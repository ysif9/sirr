// contexts/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string } | null;
  privateKey: string | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
    privateKey: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedKey = localStorage.getItem("privateKey");
    const storedUsername = localStorage.getItem("username");

    if (token && storedKey && storedUsername) {
      setUser({ username: storedUsername });
      setPrivateKey(storedKey);
    }
    setIsLoading(false);
    
    const handleAuthError = () => logout();
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);

  }, []);

  const login = async (
    username: string,
    password: string,
    userPrivateKey: string
  ) => {
    try {
      const response = await apiClient.post("/token/", {
        username,
        password,
      });
      const { access } = response.data;

      localStorage.setItem("authToken", access);
      localStorage.setItem("privateKey", userPrivateKey);
      localStorage.setItem("username", username);

      setUser({ username });
      setPrivateKey(userPrivateKey);

      router.push("/cases");
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Login failed. Please check your credentials and private key.");
    }
  };

  const logout = () => {
    setUser(null);
    setPrivateKey(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("privateKey");
    localStorage.removeItem("username");
    router.push("/login");
  };

  const isAuthenticated = !!user && !!privateKey;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, privateKey, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};