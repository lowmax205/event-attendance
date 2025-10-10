import { redirect, notFound } from "next/navigation";
import { AttendanceDetailClient } from "./attendance-detail-client";
import { getAttendanceForVerification } from "@/actions/attendance/get-for-verification";

interface AttendanceDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AttendanceDetailPage({
  params,
}: AttendanceDetailPageProps) {
  const result = await getAttendanceForVerification(params.id);

  if (!result.success) {
    switch (result.error) {
      case "UNAUTHENTICATED":
        redirect(
          `/auth/login?redirect=/dashboard/moderator/attendance/${params.id}`,
        );
      case "FORBIDDEN":
        redirect("/dashboard/moderator/attendance");
      case "NOT_FOUND":
        notFound();
      default:
        redirect("/dashboard/moderator/attendance");
    }
  }

  return <AttendanceDetailClient attendance={result.data} />;
}
