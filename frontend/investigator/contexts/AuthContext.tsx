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

interface User {
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user && !!privateKey;

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
    const bootstrapAuth = async () => {
        const storedKey = localStorage.getItem("privateKey");
        const storedEmail = localStorage.getItem("email");

        if (storedKey && storedEmail) {
            setPrivateKey(storedKey); // Assume authenticated for now
            try {
                const response = await apiClient.get('/users/me/');
                const { email, first_name, last_name } = response.data;
                setUser({ email, firstName: first_name, lastName: last_name });
            } catch (error) {
                console.error("Session invalid, logging out.", error);
                await logout();
            }
        }
        setIsLoading(false);
    };

    bootstrapAuth();

    const handleAuthError = () => logout();
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);

  }, []);

  const handleLoginSuccess = async (data: {
    email: string;
    privateKey: string;
  }) => {
    localStorage.setItem("privateKey", data.privateKey);
    localStorage.setItem("email", data.email);
    setPrivateKey(data.privateKey);

    try {
        const response = await apiClient.get('/users/me/');
        const { email, first_name, last_name } = response.data;
        setUser({ email, firstName: first_name, lastName: last_name });
    } catch (error) {
        console.error("Failed to fetch user data after login", error);
        // Set partial data to still allow navigation
        setUser({ email: data.email, firstName: null, lastName: null });
    }

    router.push("/home");
  };
  
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