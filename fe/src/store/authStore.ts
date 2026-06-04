import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import type { UserResponse } from "@/types";

// FIX: access token backend sống 15 phút (900_000ms)
// Cookie expires phải khớp để browser không gửi JWT đã hết hạn
const ACCESS_TOKEN_EXPIRE_DAYS = 900_000 / (1000 * 60 * 60 * 24); // ≈ 0.0104 ngày
const REFRESH_TOKEN_EXPIRE_DAYS = 7;
const COOKIE_SECURE  = process.env.NODE_ENV === "production";
const COOKIE_SAME_SITE = "strict" as const;

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  setAuth: (user: UserResponse, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,

      setAuth: (user, accessToken, refreshToken) => {
        // FIX: expires phải khớp thời gian sống thực của JWT (15 phút)
        // Trước đó dùng expires: 1 (1 ngày) → browser giữ token cũ đã hết hạn
        Cookies.set("access_token", accessToken, {
          expires: ACCESS_TOKEN_EXPIRE_DAYS,
          secure: COOKIE_SECURE,
          sameSite: COOKIE_SAME_SITE,
        });
        Cookies.set("refresh_token", refreshToken, {
          expires: REFRESH_TOKEN_EXPIRE_DAYS,
          secure: COOKIE_SECURE,
          sameSite: COOKIE_SAME_SITE,
        });

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isAdmin: user.role === "ROLE_ADMIN" || user.role === "ROLE_STAFF",
        });
      },

      logout: () => {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },
    }),
    {
      name: "yf-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    },
  ),
);