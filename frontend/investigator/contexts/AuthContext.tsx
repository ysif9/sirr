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
  handleLoginSuccess: (data: {
    access: string;
    refresh: string;
    username: string;
    privateKey: string;
  }) => void;
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

  const handleLoginSuccess = (data: {
    access: string;
    refresh: string;
    username: string;
    privateKey: string;
  }) => {
    localStorage.setItem("authToken", data.access);
    // TODO: Add refresh token handling if needed
    localStorage.setItem("privateKey", data.privateKey);
    localStorage.setItem("username", data.username);

    setUser({ username: data.username });
    setPrivateKey(data.privateKey);

    router.push("/cases");
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
      value={{ isAuthenticated, user, privateKey, isLoading, handleLoginSuccess, logout }}
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