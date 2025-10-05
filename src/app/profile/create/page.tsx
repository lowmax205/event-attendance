import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";

export default function CreateProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-base">
            Please provide your student information to continue. This information
            will be used for event attendance tracking and verification.
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
            number. It should match the format used by your institution
            (e.g., 2024-12345).
          </p>
          <p>
            <strong>Department:</strong> Enter your full department or program name
            (e.g., Computer Science, Business Administration).
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
