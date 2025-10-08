"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createUser } from "@/actions/admin/users";
import { userCreateSchema } from "@/lib/validations/user-management";
import { Role } from "@prisma/client";
import { z } from "zod";
import { Loader2, Copy, Check } from "lucide-react";

interface UserCreateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserCreateForm({
  open,
  onOpenChange,
  onSuccess,
}: UserCreateFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [temporaryPassword, setTemporaryPassword] = React.useState<
    string | null
  >(null);
  const [copied, setCopied] = React.useState(false);

  const form = useForm<z.infer<typeof userCreateSchema>>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      email: "",
      role: Role.Student,
      studentNumber: "",
      firstName: "",
      lastName: "",
      department: "",
      yearLevel: 1,
      section: "",
    },
  });

  const selectedRole = form.watch("role");

  const handleSubmit = async (values: z.infer<typeof userCreateSchema>) => {
    try {
      setIsSubmitting(true);
      const result = await createUser(values);

      if (!result.success) {
        throw new Error(result.error || "Failed to create user");
      }

      if (result.data?.temporaryPassword) {
        setTemporaryPassword(result.data.temporaryPassword);
      }

      toast({
        title: "User created",
        description: `${values.email} has been created successfully`,
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = async () => {
    if (temporaryPassword) {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Temporary password copied to clipboard",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setTemporaryPassword(null);
    setCopied(false);
    onOpenChange(false);
  };

  // If temporary password is shown, display it
  if (temporaryPassword) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>User Created Successfully</DialogTitle>
            <DialogDescription>
              Save the temporary password below. It will only be shown once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted">
              <p className="text-sm font-medium mb-2">Temporary Password:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-background rounded border font-mono text-sm">
                  {temporaryPassword}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyPassword}
                  aria-label="Copy password"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Please provide this password to the user. They should change it
              after their first login.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. A temporary password will be generated.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Role.Student}>Student</SelectItem>
                      <SelectItem value={Role.Moderator}>Moderator</SelectItem>
                      <SelectItem value={Role.Administrator}>
                        Administrator
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRole === Role.Student && (
              <FormField
                control={form.control}
                name="studentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="2024-12345"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedRole === Role.Student && (
              <>
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Computer Science"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="yearLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Level *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={6}
                            placeholder="1"
                            disabled={isSubmitting}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value, 10))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="A"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
