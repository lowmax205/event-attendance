"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { UserSession } from "@/lib/types/user";

/**
 * Authentication Context
 * Provides global authentication state management
 */

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (user: UserSession) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * Wraps the app to provide auth state to all components
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Session check failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function login(userData: UserSession) {
    setUser(userData);
  }

  async function logout() {
    try {
      const { logout: logoutAction } = await import("@/actions/auth/logout");
      await logoutAction();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local state even if server logout fails
      setUser(null);
    }
  }

  function updateUser(updates: Partial<UserSession>) {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * Access authentication state and methods from any component
 * 
 * @example
 * ```tsx
 * const { user, isLoading, logout } = useAuth();
 * 
 * if (isLoading) return <Spinner />;
 * if (!user) return <LoginForm />;
 * 
 * return <div>Welcome, {user.firstName}!</div>;
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
