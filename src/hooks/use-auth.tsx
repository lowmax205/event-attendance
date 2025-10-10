"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
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
  const userRef = useRef<UserSession | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Session expired or invalid - clear user state and redirect
        if (userRef.current) {
          // Only redirect if user was previously logged in
          setUser(null);
          window.location.href = "/?error=session_expired";
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Session check failed:", error);
      if (userRef.current) {
        setUser(null);
        window.location.href = "/?error=session_expired";
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies - stable function

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Periodic session validation every 2 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (user) {
          checkSession();
        }
      },
      2 * 60 * 1000,
    ); // 2 minutes

    return () => clearInterval(interval);
  }, [user, checkSession]);

  // Validate session when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        checkSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, checkSession]);

  // Validate session when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        checkSession();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, checkSession]);

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
