"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import apiClient from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string } | null;
  privateKey: string | null;
  isLoading: boolean;
  handleLoginSuccess: (data: {
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
  const pathname = usePathname();

  const logout = async () => {
    try {
        await apiClient.post('/token/logout/');
    } catch (error) {
        console.error("Logout API call failed, proceeding with client-side cleanup.", error);
    } finally {
        setUser(null);
        setPrivateKey(null);
        localStorage.removeItem("privateKey");
        localStorage.removeItem("username");
        router.push("/login");
    }
  };

  useEffect(() => {
    const storedKey = localStorage.getItem("privateKey");
    const storedUsername = localStorage.getItem("username");

    if (storedKey && storedUsername) {
      setUser({ username: storedUsername });
      setPrivateKey(storedKey);
    }
    setIsLoading(false);
    
    const handleAuthError = () => logout();
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);

  }, []);

  const handleLoginSuccess = (data: {
    username: string;
    privateKey: string;
  }) => {
    localStorage.setItem("privateKey", data.privateKey);
    localStorage.setItem("username", data.username);

    setUser({ username: data.username });
    setPrivateKey(data.privateKey);

    router.push("/cases");
  };

  const isAuthenticated = !!user && !!privateKey;
  
  // This effect handles redirecting unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !pathname.startsWith('/login') && !pathname.startsWith('/onboard')) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

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