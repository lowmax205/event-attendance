/**
 * Zod validation schemas for User Management features (FR-001 to FR-015)
 * Phase 3.2 - T009
 */

import { z } from "zod";
import { Role, AccountStatus } from "@prisma/client";

/**
 * User list query parameters (FR-001 to FR-004, FR-006)
 * Used by: GET /api/admin/users
 */
export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(10).max(100).default(20),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(AccountStatus).optional(),
  search: z.string().min(2).optional(),
  sortBy: z
    .enum(["email", "role", "accountStatus", "createdAt", "lastLoginAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;

/**
 * User role update request (FR-005, FR-008)
 * Used by: PATCH /api/admin/users/:userId/role
 */
export const userRoleUpdateSchema = z.object({
  role: z.nativeEnum(Role),
  confirmSelfChange: z.boolean().default(false),
});

export type UserRoleUpdate = z.infer<typeof userRoleUpdateSchema>;

/**
 * User account status update request (FR-007, FR-009)
 * Used by: PATCH /api/admin/users/:userId/status
 */
export const userStatusUpdateSchema = z.object({
  accountStatus: z.nativeEnum(AccountStatus),
  reason: z.string().max(500).optional(),
});

export type UserStatusUpdate = z.infer<typeof userStatusUpdateSchema>;

/**
 * User password reset request (FR-012)
 * Used by: POST /api/admin/users/:userId/reset-password
 */
export const userPasswordResetSchema = z.object({
  userId: z.string().cuid(),
});

export type UserPasswordReset = z.infer<typeof userPasswordResetSchema>;

/**
 * User creation request (FR-011)
 * Used by: POST /api/admin/users
 */
export const userCreateSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  studentNumber: z.string().min(1).max(50).optional(),
  department: z.string().min(1).max(100).optional(),
  yearLevel: z.number().int().min(1).max(6).optional(),
  section: z.string().max(50).optional(),
});

export type UserCreate = z.infer<typeof userCreateSchema>;

/**
 * User deletion request (FR-014)
 * Used by: DELETE /api/admin/users/:userId
 */
export const userDeleteSchema = z.object({
  userId: z.string().cuid(),
  reason: z.string().max(500).optional(),
});

export type UserDelete = z.infer<typeof userDeleteSchema>;
