/**
 * T028: CSV Export Generation
 * Phase 3.6 - Server Actions - Data Export
 * Generates RFC 4180-compliant CSV from attendance records
 */

interface AttendanceRecord {
  id: string;
  event: {
    name: string;
    startDateTime: Date;
    venueName: string;
  };
  user: {
    firstName: string;
    lastName: string;
    UserProfile?: {
      studentId: string;
      department: string;
      yearLevel: number;
      section?: string | null;
    } | null;
  };
  verificationStatus: string;
  checkInSubmittedAt: Date | null;
  checkOutSubmittedAt: Date | null;
  checkInDistance: number | null;
  checkInFrontPhoto: string | null;
  checkInBackPhoto: string | null;
  checkInSignature: string | null;
  verifiedBy?: {
    firstName: string;
    lastName: string;
  } | null;
  verifiedAt: Date | null;
  disputeNote: string | null;
  appealMessage: string | null;
  resolutionNotes: string | null;
}

/**
 * Escape a CSV field value according to RFC 4180
 * - Wrap in quotes if contains comma, quote, or newline
 * - Escape internal quotes by doubling them
 */
function escapeCSVField(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Check if needs quoting
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    // Escape quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Format date for CSV export
 */
function formatDate(date: Date | null | undefined): string {
  if (!date) return "";

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Generate RFC 4180-compliant CSV from attendance records
 * @param records - Array of attendance records with user, event, and verifier data
 * @returns CSV string with headers and data rows
 */
export function generateAttendanceCSV(records: AttendanceRecord[]): string {
  // CSV Headers
  const headers = [
    "Student Number",
    "Name",
    "Department",
    "Year Level",
    "Section",
    "Event Name",
    "Event Date",
    "Venue",
    "Check-In",
    "Check-Out",
    "Submission",
    "Status",
    "Verified By",
    "Verified At",
    "Distance (m)",
    "Front Photo URL",
    "Back Photo URL",
    "Signature URL",
    "Dispute Notes",
    "Appeal Message",
    "Resolution Notes",
  ];

  // Create header row
  const rows: string[] = [headers.map(escapeCSVField).join(",")];

  // Generate data rows
  for (const record of records) {
    const row = [
      escapeCSVField(record.user.UserProfile?.studentId || "N/A"),
      escapeCSVField(`${record.user.firstName} ${record.user.lastName}`),
      escapeCSVField(record.user.UserProfile?.department || "N/A"),
      escapeCSVField(record.user.UserProfile?.yearLevel?.toString() || "N/A"),
      escapeCSVField(record.user.UserProfile?.section || "N/A"),
      escapeCSVField(record.event.name),
      escapeCSVField(formatDate(record.event.startDateTime)),
      escapeCSVField(record.event.venueName),
      escapeCSVField(formatDate(record.checkInSubmittedAt)),
      escapeCSVField(formatDate(record.checkOutSubmittedAt)),
      escapeCSVField(formatDate(record.checkInSubmittedAt)), // Submission = check-in time
      escapeCSVField(record.verificationStatus),
      escapeCSVField(
        record.verifiedBy
          ? `${record.verifiedBy.firstName} ${record.verifiedBy.lastName}`
          : ""
      ),
      escapeCSVField(formatDate(record.verifiedAt)),
      escapeCSVField(
        record.checkInDistance ? record.checkInDistance.toFixed(2) : ""
      ),
      escapeCSVField(record.checkInFrontPhoto || ""),
      escapeCSVField(record.checkInBackPhoto || ""),
      escapeCSVField(record.checkInSignature || ""),
      escapeCSVField(record.disputeNote || ""),
      escapeCSVField(record.appealMessage || ""),
      escapeCSVField(record.resolutionNotes || ""),
    ];

    rows.push(row.join(","));
  }

  // Join all rows with newline
  return rows.join("\n");
}
