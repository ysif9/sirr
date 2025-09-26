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
  user: { email: string } | null;
  privateKey: string | null;
  isLoading: boolean;
  handleLoginSuccess: (data: {
    email: string;
    privateKey: string;
  }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
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
        localStorage.removeItem("email");
        router.push("/login");
    }
  };

  useEffect(() => {
    const storedKey = localStorage.getItem("privateKey");
    const storedEmail = localStorage.getItem("email");

    // This check is for session persistence across page reloads.
    // It assumes that if local storage has the user info, a valid cookie exists.
    if (storedKey && storedEmail) {
      setUser({ email: storedEmail });
      setPrivateKey(storedKey);
    }
    setIsLoading(false);
    
    const handleAuthError = () => logout();
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);

  }, []);

  const handleLoginSuccess = (data: {
    email: string;
    privateKey: string;
  }) => {
    // We only store non-sensitive data needed for the UI and crypto operations.
    // The actual authentication token is now in an HttpOnly cookie.
    localStorage.setItem("privateKey", data.privateKey);
    localStorage.setItem("email", data.email);

    setUser({ email: data.email });
    setPrivateKey(data.privateKey);

    router.push("/cases");
  };

  const isAuthenticated = !!user && !!privateKey;
  
  // This effect handles redirecting unauthenticated users from protected pages.
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