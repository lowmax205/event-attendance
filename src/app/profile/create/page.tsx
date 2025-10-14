import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";
import { getCurrentUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSession } from "@/lib/auth/session";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "@/lib/auth/cookies";

export default async function CreateProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user already has a profile
  const existingProfile = await db.userProfile.findUnique({
    where: { userId: user.userId },
  });

  // If user has a profile but token says hasProfile: false, update the session
  if (existingProfile && !user.hasProfile) {
    // Get full user details
    const fullUser = await db.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (fullUser) {
      // Create new session with hasProfile: true
      const { accessToken, refreshToken } = await createSession({
        id: fullUser.id,
        email: fullUser.email,
        role: fullUser.role,
        hasProfile: true,
      });

      // Update cookies
      const cookieStore = await cookies();
      cookieStore.set("accessToken", accessToken, {
        ...getAccessTokenCookieOptions(),
      });

      cookieStore.set("refreshToken", refreshToken, {
        ...getRefreshTokenCookieOptions(),
      });

      // Redirect to dashboard based on role
      switch (fullUser.role) {
        case "Student":
          redirect("/dashboard/student");
        case "Moderator":
          redirect("/dashboard/moderator");
        case "Administrator":
          redirect("/dashboard/admin");
        default:
          redirect("/");
      }
    }
  }

  // If user already has a profile and token is correct, redirect to dashboard
  if (existingProfile && user.hasProfile) {
    switch (user.role) {
      case "Student":
        redirect("/dashboard/student");
      case "Moderator":
        redirect("/dashboard/moderator");
      case "Administrator":
        redirect("/dashboard/admin");
      default:
        redirect("/");
    }
  }
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-base">
            Please provide your student information to continue. This
            information will be used for event attendance tracking and
            verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-6 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Student ID:</strong> Use your official university student ID
            number. It should match the format used by your institution (e.g.,
            2024-12345).
          </p>
          <p>
            <strong>Department:</strong> Enter your full department or program
            name (e.g., Computer Science, Business Administration).
          </p>
          <p>
            <strong>Year Level:</strong> Enter a number from 1 to 6 representing
            your current year in the program.
          </p>
          <p>
            <strong>Section:</strong> Optional field for your section assignment
            (e.g., A, B, 1, 2).
          </p>
          <p>
            <strong>Contact Number:</strong> Optional field for receiving event
            notifications via SMS.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
