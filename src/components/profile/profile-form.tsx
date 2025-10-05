"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateUser } = useAuth();

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      studentId: "",
      department: "",
      yearLevel: 1,
      section: "",
      contactNumber: "",
    },
  });

  async function onSubmit(data: ProfileInput) {
    setIsLoading(true);
    setError(null);

    try {
      const { createProfile } = await import("@/actions/profile/create");
      const result = await createProfile(data);

      if (result.success) {
        // Update auth context to reflect profile completion
        updateUser({ hasProfile: true });

        toast.success("Profile created successfully!", {
          description: "Redirecting to dashboard...",
        });

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        setError(result.message);
        toast.error("Profile creation failed", {
          description: result.message,
        });
      }
    } catch (err) {
      const message = "An unexpected error occurred. Please try again.";
      setError(message);
      toast.error("Error", { description: message });
      console.error("Profile creation error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormFieldWrapper
          name="studentId"
          control={form.control}
          label="Student ID"
          description="Your official student identification number"
          required
        >
          {(field) => (
            <Input
              {...field}
              type="text"
              placeholder="2024-12345"
              disabled={isLoading}
              className="uppercase"
            />
          )}
        </FormFieldWrapper>

        <FormFieldWrapper
          name="department"
          control={form.control}
          label="Department/Program"
          description="Your academic department or program"
          required
        >
          {(field) => (
            <Input
              {...field}
              type="text"
              placeholder="Computer Science"
              disabled={isLoading}
            />
          )}
        </FormFieldWrapper>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormFieldWrapper
            name="yearLevel"
            control={form.control}
            label="Year Level"
            required
          >
            {(field) => (
              <Input
                {...field}
                type="number"
                min={1}
                max={6}
                placeholder="1"
                disabled={isLoading}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
              />
            )}
          </FormFieldWrapper>

          <FormFieldWrapper
            name="section"
            control={form.control}
            label="Section"
            description="Optional"
          >
            {(field) => (
              <Input
                {...field}
                type="text"
                placeholder="A"
                disabled={isLoading}
              />
            )}
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper
          name="contactNumber"
          control={form.control}
          label="Contact Number"
          description="Optional - for event notifications"
        >
          {(field) => (
            <Input
              {...field}
              type="tel"
              placeholder="+63 912 345 6789"
              disabled={isLoading}
            />
          )}
        </FormFieldWrapper>

        <Button type="submit" className="w-full min-h-11" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              Creating profile...
            </>
          ) : (
            "Complete Profile"
          )}
        </Button>
      </form>
    </Form>
  );
}
