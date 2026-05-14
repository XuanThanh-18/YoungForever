// ═══════════════════════════════════════════════════════════════════
// FILE: fe/src/store/authStore.ts
// Zustand store – lưu user + token vào cookie để persist qua reload
// ═══════════════════════════════════════════════════════════════════
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import type { UserResponse } from "@/types";

const COOKIE_OPTS = {
  expires: 7,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  // actions
  setAuth: (
    user: UserResponse,
    accessToken: string,
    refreshToken: string,
  ) => void;
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
        // Lưu token vào cookie (httpOnly không thể dùng từ JS; dùng cookie thường nhưng short-lived access)
        Cookies.set("access_token", accessToken, {
          ...COOKIE_OPTS,
          expires: 1,
        });
        Cookies.set("refresh_token", refreshToken, COOKIE_OPTS);

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isAdmin: user.role === "ADMIN" || user.role === "STAFF",
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
      // Chỉ persist user và auth status; token lấy từ cookie
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    },
  ),
);
