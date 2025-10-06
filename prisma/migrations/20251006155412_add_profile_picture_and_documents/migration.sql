-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "documentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "profilePictureUrl" TEXT;
