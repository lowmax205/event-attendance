import { z } from "zod";

/**
 * Login schema validation
 * Validates email format and password minimum requirements
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required"),
});

/**
 * Registration schema validation
 * Enforces strong password requirements and validates all user data
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name must be less than 50 characters")
      .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes")
      .trim(),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be less than 50 characters")
      .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Profile creation/update schema validation
 * Used after registration to complete user profile
 */
export const profileSchema = z.object({
  studentId: z
    .string()
    .min(1, "Student ID is required")
    .max(20, "Student ID must be less than 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Student ID can only contain uppercase letters, numbers, and hyphens")
    .trim(),
  department: z
    .string()
    .min(1, "Department is required")
    .max(100, "Department must be less than 100 characters")
    .trim(),
  yearLevel: z
    .number()
    .int("Year level must be a whole number")
    .min(1, "Year level must be at least 1")
    .max(6, "Year level must be at most 6"),
  section: z
    .string()
    .max(50, "Section must be less than 50 characters")
    .optional(),
  contactNumber: z
    .string()
    .regex(/^[0-9+\-() ]+$/, "Contact number can only contain numbers, +, -, (), and spaces")
    .min(10, "Contact number must be at least 10 characters")
    .max(20, "Contact number must be less than 20 characters")
    .optional(),
});

/**
 * TypeScript types inferred from Zod schemas
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
