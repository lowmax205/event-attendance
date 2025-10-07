import { db } from "@/lib/db";

/**
 * Log security-related actions to the SecurityLog table
 * Used for audit trail of event/attendance operations
 */
export async function logAction(
  action: string,
  userId: string,
  entityType: string,
  entityId: string,
  metadata?: object,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await db.securityLog.create({
      data: {
        action,
        userId,
        metadata: metadata
          ? JSON.parse(JSON.stringify({ entityType, entityId, ...metadata }))
          : { entityType, entityId },
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  } catch (error) {
    // Log to console but don't throw - audit logging failures shouldn't break user operations
    console.error("Failed to log security action:", error);
  }
}
