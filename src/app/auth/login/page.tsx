"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * Login Page
 * Standalone authentication page with login and register forms
 * Supports redirect query parameter
 */
export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Note: We don't redirect if already logged in from this page
  // The login form itself will handle the redirect after successful login
  // This prevents redirect loops with server-side auth checks

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {activeTab === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {activeTab === "login"
              ? "Log in to your account to continue"
              : "Register to start tracking event attendance"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tab Switcher */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors min-h-11 ${
                activeTab === "login"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors min-h-11 ${
                activeTab === "register"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              Register
            </button>
          </div>

          <Separator />

          {/* Form Content */}
          <div className="py-2">
            {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            {activeTab === "login" ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="text-primary hover:underline font-medium"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-primary hover:underline font-medium"
                >
                  Log in here
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
