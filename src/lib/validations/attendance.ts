import { z } from "zod";

/**
 * Zod schema for attendance submission
 * Based on attendance-submit.json contract
 */
export const submitAttendanceSchema = z.object({
  eventId: z
    .string()
    .cuid("Invalid event ID format")
    .min(1, "Event ID is required"),
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  frontPhotoBase64: z
    .string()
    .regex(
      /^data:image\/(jpeg|png);base64,/,
      "Front photo must be a valid base64 encoded JPEG or PNG image",
    )
    .min(1, "Front photo is required"),
  backPhotoBase64: z
    .string()
    .regex(
      /^data:image\/(jpeg|png);base64,/,
      "Back photo must be a valid base64 encoded JPEG or PNG image",
    )
    .min(1, "Back photo is required"),
  signatureBase64: z
    .string()
    .regex(
      /^data:image\/png;base64,/,
      "Signature must be a valid base64 encoded PNG image",
    )
    .min(1, "Signature is required"),
});

export type SubmitAttendanceInput = z.infer<typeof submitAttendanceSchema>;

/**
 * Zod schema for QR code validation
 * Based on qr-validate.json contract
 */
export const validateQRSchema = z.object({
  qrPayload: z
    .string()
    .regex(
      /^attendance:[a-z0-9]+:[0-9]+$/,
      "Invalid QR code format. Expected: attendance:{eventId}:{timestamp}",
    )
    .min(1, "QR code payload is required"),
});

export type ValidateQRInput = z.infer<typeof validateQRSchema>;

/**
 * Zod schema for attendance verification
 * Based on attendance-verify.json contract
 */
export const verifyAttendanceSchema = z
  .object({
    verificationStatus: z.enum(["Approved", "Rejected"], {
      message: "Verification status must be either 'Approved' or 'Rejected'",
    }),
    disputeNote: z
      .string()
      .max(1000, "Dispute note must not exceed 1000 characters")
      .optional(),
  })
  .refine(
    (data) => {
      // If status is Rejected, disputeNote is required
      if (data.verificationStatus === "Rejected") {
        return !!data.disputeNote && data.disputeNote.length >= 10;
      }
      return true;
    },
    {
      message:
        "Dispute note is required when rejecting attendance (minimum 10 characters)",
      path: ["disputeNote"],
    },
  );

export type VerifyAttendanceInput = z.infer<typeof verifyAttendanceSchema>;
