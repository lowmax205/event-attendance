"use server";

import { getCurrentUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { uploadImageToCloudflare } from "@/lib/cloudflare-images";
import { uploadFileToR2 } from "@/lib/cloudflare-r2";
import { revalidatePath } from "next/cache";

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
        const uploadResult = await uploadImageToCloudflare(profilePicture, {
          folder: `profiles/${user.userId}`,
          filename: `profile-${Date.now()}`,
          metadata: { userId: user.userId, type: "profilePicture" },
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
          const uploadResult = await uploadFileToR2(document, {
            folder: `profiles/${user.userId}/documents`,
            filename:
              document.name ||
              `document-${user.userId}-${Date.now()}-${docIndex}`,
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
