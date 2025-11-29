// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { fetcher, setAuthToken } from "@/lib/api";
import { User } from "@/features/Users/types";

type UpdateProfileInput = {
  name?: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileInput) => Promise<User>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("auth_token");
        console.log("Bootstrap, savedToken:", savedToken);

        if (!savedToken) {
          setLoading(false);
          return;
        }

        setAuthToken(savedToken);

        try {
          const me = await fetcher<User>("/api/auth/me");
          console.log("Bootstrap /auth/me success");
          setUser(me);
          setToken(savedToken);
        } catch (e) {
          console.log("Bootstrap /auth/me failed, clearing token", e);
          setAuthToken(null);
          await SecureStore.deleteItemAsync("auth_token");
          setUser(null);
          setToken(null);
        }
      } catch (e) {
        console.log("Auth bootstrap error", e);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await fetcher<{ user: User; token: string }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });

    setUser(res.user);
    setToken(res.token);
    setAuthToken(res.token);
    await SecureStore.setItemAsync("auth_token", res.token);
  };

  const signOut = async () => {
    try {
      await fetcher("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.log("Logout error", e);
    } finally {
      setUser(null);
      setToken(null);
      setAuthToken(null);
      await SecureStore.deleteItemAsync("auth_token");
    }
  };

  const updateProfile = async (data: UpdateProfileInput): Promise<User> => {
    const updated = await fetcher<User>("/api/auth/me", {
      method: "PATCH",
      body: data,
    });
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
