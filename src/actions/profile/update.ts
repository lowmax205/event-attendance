"use server";

import { getCurrentUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { uploadFileToR2 } from "@/lib/cloudflare-r2";
import { revalidatePath } from "next/cache";
import path from "node:path";

interface UpdateProfileResult {
  success: boolean;
  message: string;
}

export async function updateProfile(
  formData: FormData,
): Promise<UpdateProfileResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    // Extract form data
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const contactNumber = (formData.get("contactNumber") as string) || null;
    const department = formData.get("department") as string;
    const yearLevel = parseInt(formData.get("yearLevel") as string, 10);
    const section = (formData.get("section") as string) || null;
    const studentId = formData.get("studentId") as string;
    const profilePicture = formData.get("profilePicture") as File | null;

    const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
    const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB

    // Validate required fields
    if (!firstName || !lastName || !department || !yearLevel || !studentId) {
      return { success: false, message: "Missing required fields" };
    }

    const MIME_EXTENSION_MAP: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "application/pdf": ".pdf",
    };

    const resolveExtension = (file: File, fallback: string) => {
      const extFromName = file.name ? path.extname(file.name) : "";
      if (extFromName) {
        return extFromName.toLowerCase();
      }
      const mapped = MIME_EXTENSION_MAP[file.type];
      if (mapped) {
        return mapped;
      }
      return fallback;
    };

    const buildFileName = (
      prefix: "profile" | "document",
      file: File,
      index?: number,
    ) => {
      const fallbackExt = prefix === "document" ? ".pdf" : ".jpg";
      const extension = resolveExtension(file, fallbackExt);
      const timestamp = Date.now();
      const suffix =
        typeof index === "number"
          ? `${user.userId}-${timestamp}-${index}`
          : `${user.userId}-${timestamp}`;
      return `${prefix}-${suffix}${extension}`;
    };

    // Handle profile picture upload
    let profilePictureUrl: string | undefined;
    if (profilePicture && profilePicture.size > 0) {
      if (profilePicture.size > MAX_PROFILE_IMAGE_SIZE) {
        return {
          success: false,
          message: "Profile picture must be 5 MB or smaller",
        };
      }

      if (!profilePicture.type.startsWith("image/")) {
        return {
          success: false,
          message: "Profile picture must be an image file",
        };
      }

      try {
        const profileFileName = buildFileName("profile", profilePicture);
        const uploadResult = await uploadFileToR2(profilePicture, {
          folder: `Profile/${user.userId}`,
          filename: profileFileName,
        });
        profilePictureUrl = uploadResult.url;
      } catch (error) {
        console.error("Failed to upload profile picture:", error);
        return { success: false, message: "Failed to upload profile picture" };
      }
    }

    // Handle document uploads
    const documentUrls: string[] = [];
    let docIndex = 0;
    while (formData.has(`document_${docIndex}`)) {
      const document = formData.get(`document_${docIndex}`) as File;
      if (document && document.size > 0) {
        if (document.size > MAX_DOCUMENT_SIZE) {
          console.warn(
            `Document ${docIndex} exceeds the 10 MB limit and will be skipped`,
          );
          docIndex++;
          continue;
        }

        if (!document.type || document.type !== "application/pdf") {
          console.warn(
            `Document ${docIndex} skipped due to unsupported type: ${document.type}`,
          );
          docIndex++;
          continue;
        }

        try {
          const documentFileName = buildFileName(
            "document",
            document,
            docIndex,
          );
          const uploadResult = await uploadFileToR2(document, {
            folder: `Profile/${user.userId}/documents`,
            filename: documentFileName,
          });
          documentUrls.push(uploadResult.url);
        } catch (error) {
          console.error(`Failed to upload document ${docIndex}:`, error);
        }
      }
      docIndex++;
    }

    // Update user basic info
    await db.user.update({
      where: { id: user.userId },
      data: {
        firstName,
        lastName,
      },
    });

    // Update or create profile
    const existingProfile = await db.userProfile.findUnique({
      where: { userId: user.userId },
    });

    if (existingProfile) {
      await db.userProfile.update({
        where: { userId: user.userId },
        data: {
          studentId,
          department,
          yearLevel,
          section,
          contactNumber,
          ...(profilePictureUrl && { profilePictureUrl }),
          ...(documentUrls.length > 0 && {
            documentUrls: [...existingProfile.documentUrls, ...documentUrls],
          }),
        },
      });
    } else {
      await db.userProfile.create({
        data: {
          userId: user.userId,
          studentId,
          department,
          yearLevel,
          section,
          contactNumber,
          ...(profilePictureUrl && { profilePictureUrl }),
          documentUrls: documentUrls.length > 0 ? documentUrls : [],
        },
      });
    }

    revalidatePath("/profile");
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, message: "Failed to update profile" };
  }
}
