"use server";

import { getCurrentUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { uploadPhoto } from "@/lib/cloudinary";
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

    // Validate required fields
    if (!firstName || !lastName || !department || !yearLevel || !studentId) {
      return { success: false, message: "Missing required fields" };
    }

    // Handle profile picture upload
    let profilePictureUrl: string | undefined;
    if (profilePicture && profilePicture.size > 0) {
      try {
        const arrayBuffer = await profilePicture.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const base64WithPrefix = `data:${profilePicture.type};base64,${base64}`;
        profilePictureUrl = await uploadPhoto(
          base64WithPrefix,
          `profiles/${user.userId}`,
        );
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
        try {
          const arrayBuffer = await document.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          const base64WithPrefix = `data:${document.type};base64,${base64}`;
          const url = await uploadPhoto(
            base64WithPrefix,
            `profiles/${user.userId}/documents`,
          );
          documentUrls.push(url);
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
