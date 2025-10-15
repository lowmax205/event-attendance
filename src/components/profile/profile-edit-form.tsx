"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { User, Upload, FileText, GraduationCap, X } from "lucide-react";
import { User as UserType, UserProfile } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  contactNumber: z.string().min(10).max(20).optional().or(z.literal("")),
  department: z.string().min(1, "Department is required").max(100),
  yearLevel: z.number().int().min(1).max(6),
  section: z.string().max(50).optional().or(z.literal("")),
  studentId: z.string().min(1, "Student ID is required").max(20),
});

type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

interface ProfileEditFormProps {
  user: UserType & { UserProfile: UserProfile | null };
  profile: UserProfile | null;
}

export function ProfileEditForm({ user, profile }: ProfileEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null,
  );
  const [documents, setDocuments] = useState<File[]>([]);

  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      contactNumber: profile?.contactNumber || "",
      department: profile?.department || "",
      yearLevel: profile?.yearLevel || 1,
      section: profile?.section || "",
      studentId: profile?.studentId || "",
    },
  });

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Profile picture must be less than 5MB",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", {
          description: "Please select an image file",
        });
        return;
      }

      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large`, {
          description: "Documents must be less than 10MB",
        });
        return false;
      }
      return true;
    });

    setDocuments((prev) => [...prev, ...validFiles]);
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(data: ProfileUpdateInput) {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      // Add profile data
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value?.toString() || "");
      });

      // Add profile picture if selected
      if (profilePictureFile) {
        formData.append("profilePicture", profilePictureFile);
      }

      // Add documents if selected
      documents.forEach((doc, index) => {
        formData.append(`document_${index}`, doc);
      });

      const { updateProfile } = await import("@/actions/profile/update");
      const result = await updateProfile(formData);

      if (result.success) {
        toast.success("Profile updated successfully!");

        // Reset file states
        setProfilePictureFile(null);
        setDocuments([]);

        // Refresh the page to show updated data
        window.location.reload();
      } else {
        setError(result.message);
        toast.error("Update failed", { description: result.message });
      }
    } catch (err) {
      const message = "An unexpected error occurred. Please try again.";
      setError(message);
      toast.error("Error", { description: message });
      console.error("Profile update error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const getInitials = () => {
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  const lastLoginDate = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
  const lastLoginDisplay =
    lastLoginDate && !Number.isNaN(lastLoginDate.getTime())
      ? format(lastLoginDate, "MMM d, yyyy • h:mm a")
      : "Never logged in";

  return (
    <Tabs defaultValue="basic" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basic">Basic Info & Picture</TabsTrigger>
        <TabsTrigger value="academic">Academic & Documents</TabsTrigger>
      </TabsList>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information & Profile Picture Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      Role
                    </Label>
                    <Badge variant="outline" className="w-fit px-2 py-1">
                      {user.role}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      Last Login
                    </Label>
                    <p className="text-sm font-medium">{lastLoginDisplay}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormFieldWrapper
                    name="firstName"
                    control={form.control}
                    label="First Name"
                    required
                  >
                    {(field) => (
                      <Input
                        {...field}
                        type="text"
                        placeholder="John"
                        disabled={isLoading}
                      />
                    )}
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    name="lastName"
                    control={form.control}
                    label="Last Name"
                    required
                  >
                    {(field) => (
                      <Input
                        {...field}
                        type="text"
                        placeholder="Doe"
                        disabled={isLoading}
                      />
                    )}
                  </FormFieldWrapper>
                </div>

                <FormFieldWrapper
                  name="contactNumber"
                  control={form.control}
                  label="Contact Number"
                  labelHint="Optional"
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

                <div className="pt-2">
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <Input
                    type="email"
                    value={user.email}
                    disabled
                    className="mt-1.5 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed. Contact administrator if needed.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Upload or update your profile picture (max 5MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profilePicturePreview || undefined} />
                    <AvatarFallback className="text-2xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col items-center gap-2">
                    <Label htmlFor="profile-picture" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                        <Upload className="h-4 w-4" />
                        Choose Picture
                      </div>
                      <Input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground text-center">
                      Accepted formats: JPG, PNG, GIF (max 5MB)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Information & Documents Tab */}
          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Information
                </CardTitle>
                <CardDescription>
                  Update your academic details and student information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                      />
                    )}
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    name="section"
                    control={form.control}
                    label="Section"
                    labelHint="Optional"
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
                <CardDescription>
                  Upload supporting documents (ID, certificates, etc. - max 10MB
                  each)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Label htmlFor="documents" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Click to upload documents
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, DOC, DOCX, JPG, PNG (max 10MB each)
                      </p>
                    </div>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleDocumentChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </Label>

                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Selected Documents
                      </Label>
                      <div className="space-y-2">
                        {documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm truncate">
                                {doc.name}
                              </span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                ({(doc.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDocument(index)}
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Saving changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Tabs>
  );
}
