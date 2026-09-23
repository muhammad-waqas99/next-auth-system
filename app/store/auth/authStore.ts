
import { create } from "zustand";

import { axiosInstance } from "@/app/lib/axios/axiosInstance";

type AuthMethod = "email" | "google";

interface AuthUser {
  name: string;
  email: string;
  isVerified: boolean;
  authMethods: AuthMethod[];
  twoFactorEnabled: boolean;
}

interface AuthStore {
  user: AuthUser | null;
  backupCodesRemaining: number;
  isLoading: boolean;

  setUser: (user: AuthUser | null) => void;
  setBackupCodesRemaining: (count: number) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  backupCodesRemaining: 0,
  isLoading: true,

  setUser: (user) => {
    set({ user });
  },

  setBackupCodesRemaining: (count) => {
    set({ backupCodesRemaining: count });
  },

  clearUser: () => {
    set({
      user: null,
      backupCodesRemaining: 0,
    });
  },

  fetchUser: async () => {
    try {
      const response = await axiosInstance.get("/api/auth/me");

      const { user, backupCodesRemaining } = response.data;

      let authMethods: AuthMethod[] = [];

      if (user.authProvider === "local") {
        authMethods = ["email"];
      }

      if (user.authProvider === "google") {
        authMethods = ["google"];
      }

      if (user.authProvider === "both") {
        authMethods = ["email", "google"];
      }

      set({
        user: {
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          authMethods,
          twoFactorEnabled: user.twoFactorEnabled,
        },
        backupCodesRemaining,
      });
    } finally {
      set({
        isLoading: false,
      });
    }
  },
}));

