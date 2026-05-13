import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserResponse } from "@/types";
import { setTokens, clearTokens } from "@/lib/axios";

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  setAuth: (
    user: UserResponse,
    accessToken: string,
    refreshToken: string,
  ) => void;
  updateUser: (user: UserResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      setAuth: (user, accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
        set({
          user,
          isAuthenticated: true,
          isAdmin: user.role === "ADMIN",
        });
      },

      updateUser: (user) => set({ user }),

      logout: () => {
        clearTokens();
        set({ user: null, isAuthenticated: false, isAdmin: false });
      },
    }),
    {
      name: "yf-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
