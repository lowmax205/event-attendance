import { redirect } from "next/navigation";

/**
 * Auth Page
 * Redirects to login page
 */
export default function AuthPage() {
  redirect("/auth/login");
}
