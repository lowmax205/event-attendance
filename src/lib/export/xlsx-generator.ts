/**
 * T029: Excel (XLSX) Export Generation
 * Phase 3.6 - Server Actions - Data Export
 * Generates Excel workbook with formatted attendance data using SheetJS
 */

import * as XLSX from "xlsx";

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
 * Format date for Excel export
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
 * Get status color based on verification status
 */
function getStatusColor(status: string): string {
  switch (status) {
    case "Approved":
      return "FF10B981"; // Green
    case "Rejected":
      return "FFEF4444"; // Red
    case "Pending":
      return "FFF59E0B"; // Yellow
    case "Disputed":
      return "FF8B5CF6"; // Purple
    default:
      return "FFFFFFFF"; // White
  }
}

/**
 * Generate Excel workbook from attendance records
 * @param records - Array of attendance records with user, event, and verifier data
 * @returns Buffer containing the Excel file
 */
export function generateAttendanceXLSX(records: AttendanceRecord[]): Buffer {
  // Prepare data rows
  const data = records.map((record) => ({
    "Student Number": record.user.UserProfile?.studentId || "N/A",
    Name: `${record.user.firstName} ${record.user.lastName}`,
    Department: record.user.UserProfile?.department || "N/A",
    "Year Level": record.user.UserProfile?.yearLevel?.toString() || "N/A",
    Section: record.user.UserProfile?.section || "N/A",
    "Event Name": record.event.name,
    "Event Date": formatDate(record.event.startDateTime),
    Venue: record.event.venueName,
    "Check-In": formatDate(record.checkInSubmittedAt),
    "Check-Out": formatDate(record.checkOutSubmittedAt),
    Submission: formatDate(record.checkInSubmittedAt),
    Status: record.verificationStatus,
    "Verified By": record.verifiedBy
      ? `${record.verifiedBy.firstName} ${record.verifiedBy.lastName}`
      : "",
    "Verified At": formatDate(record.verifiedAt),
    "Distance (m)": record.checkInDistance
      ? record.checkInDistance.toFixed(2)
      : "",
    "Front Photo URL": record.checkInFrontPhoto || "",
    "Back Photo URL": record.checkInBackPhoto || "",
    "Signature URL": record.checkInSignature || "",
    "Dispute Notes": record.disputeNote || "",
    "Appeal Message": record.appealMessage || "",
    "Resolution Notes": record.resolutionNotes || "",
  }));

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Style header row (row 1)
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFFFF" } },
      fill: { fgColor: { rgb: "FF4F46E5" } }, // Indigo background
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Color-code status cells (column L - Status)
  const statusColIndex = 11; // Column L (0-indexed)
  for (let row = 1; row <= range.e.r; row++) {
    const statusCell =
      worksheet[XLSX.utils.encode_cell({ r: row, c: statusColIndex })];
    if (statusCell && statusCell.v) {
      const status = String(statusCell.v);
      statusCell.s = {
        fill: { fgColor: { rgb: getStatusColor(status) } },
        font: {
          color: { rgb: status === "Pending" ? "FF000000" : "FFFFFFFF" },
        },
        alignment: { horizontal: "center" },
      };
    }
  }

  // Convert photo/signature URLs to hyperlinks
  const urlColumns = [15, 16, 17]; // Columns P, Q, R (0-indexed)
  for (const colIdx of urlColumns) {
    for (let row = 1; row <= range.e.r; row++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: colIdx })];
      if (cell && cell.v && String(cell.v).startsWith("http")) {
        cell.l = { Target: String(cell.v) };
        cell.s = {
          font: { color: { rgb: "FF0000FF" }, underline: true },
        };
      }
    }
  }

  // Set column widths
  const colWidths = [
    { wch: 15 }, // Student Number
    { wch: 25 }, // Name
    { wch: 20 }, // Department
    { wch: 10 }, // Year Level
    { wch: 10 }, // Section
    { wch: 30 }, // Event Name
    { wch: 20 }, // Event Date
    { wch: 25 }, // Venue
    { wch: 20 }, // Check-In
    { wch: 20 }, // Check-Out
    { wch: 20 }, // Submission
    { wch: 12 }, // Status
    { wch: 20 }, // Verified By
    { wch: 20 }, // Verified At
    { wch: 12 }, // Distance
    { wch: 40 }, // Front Photo URL
    { wch: 40 }, // Back Photo URL
    { wch: 40 }, // Signature URL
    { wch: 30 }, // Dispute Notes
    { wch: 30 }, // Appeal Message
    { wch: 30 }, // Resolution Notes
  ];
  worksheet["!cols"] = colWidths;

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Records");

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return buffer;
}
