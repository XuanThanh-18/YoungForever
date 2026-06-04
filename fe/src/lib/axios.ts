import axios from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/authStore";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor ───────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: auto refresh khi 401 ───────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

// Khớp với authStore: access token 15 phút
const ACCESS_TOKEN_EXPIRE_DAYS = 900_000 / (1000 * 60 * 60 * 24);
const COOKIE_SECURE   = process.env.NODE_ENV === "production";
const COOKIE_SAME_SITE = "strict" as const;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get("refresh_token");
      if (!refreshToken) {
        useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Dùng axios thô để tránh interceptor vòng lặp
        // Backend trả: { success, data: { accessToken, refreshToken, user } }
        const axiosResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        // FIX: parse đúng tầng - axiosResponse.data = body JSON (ApiResponse)
        // axiosResponse.data.data = AuthResponse
        const authData = axiosResponse.data?.data;
        const newAccess: string  = authData?.accessToken;
        const newRefresh: string = authData?.refreshToken;
        const user = authData?.user;

        if (!newAccess || !newRefresh) {
          throw new Error("Invalid refresh response");
        }

        // Lưu cookie với thời gian đúng (không export, xử lý nội bộ)
        Cookies.set("access_token", newAccess, {
          expires: ACCESS_TOKEN_EXPIRE_DAYS,
          secure: COOKIE_SECURE,
          sameSite: COOKIE_SAME_SITE,
        });
        Cookies.set("refresh_token", newRefresh, {
          expires: 7,
          secure: COOKIE_SECURE,
          sameSite: COOKIE_SAME_SITE,
        });

        // Cập nhật store - dùng user từ response hoặc fallback store
        const currentUser = user ?? useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setAuth(currentUser, newAccess, newRefresh);
        }

        processQueue(null, newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        if (
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/admin")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;