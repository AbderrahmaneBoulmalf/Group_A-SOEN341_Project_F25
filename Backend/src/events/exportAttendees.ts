import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import db from "../db.js";
type EventLookupRow = RowDataPacket & {
  id: number;
  title: string | null;
};
type EventAttendeeRow = RowDataPacket & {
  ticketId: number | null;
  studentId: number | null;
  username: string | null;
  email: string | null;
};
const escapeForCsv = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};
const formatCsvRow = (columns: (string | number | null | undefined)[]) =>
  columns.map((column) => escapeForCsv(column)).join(",");
const exportEventAttendeesCsv = async (req: Request, res: Response) => {
  const eventIdParam = req.params.eventId;
  const eventId = Number(eventIdParam);
  if (!eventIdParam || Number.isNaN(eventId)) {
    res
      .status(400)
      .json({ success: false, message: "Invalid event id parameter" });
    return;
  }
  try {
    const [eventRows] = await db
      .promise()
      .query<EventLookupRow[]>(
        `
          SELECT id, title
          FROM events
          WHERE id = ?
          LIMIT 1
        `,
        [eventId]
      );
    if (eventRows.length === 0) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }
    const [attendeeRows] = await db
      .promise()
      .query<EventAttendeeRow[]>(
        `
          SELECT
            ct.id AS ticketId,
            ct.student_id AS studentId,
            u.Username AS username,
            u.Email AS email
          FROM ClaimedTickets ct
          INNER JOIN Users u ON u.ID = ct.student_id
          WHERE ct.event_id = ?
          ORDER BY u.Username ASC, u.Email ASC
        `,
        [eventId]
      );
    const headerRow = formatCsvRow([
      "Ticket ID",
      "Student ID",
      "Username",
      "Email",
    ]);
    const dataRows = attendeeRows.map((attendee) =>
      formatCsvRow([
        attendee.ticketId,
        attendee.studentId,
        attendee.username,
        attendee.email,
      ])
    );
    const csvContent = [headerRow, ...dataRows].join("\r\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="event-${eventId}-attendees.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    console.error(
      "GET /manager/events/:eventId/attendees/export error:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to export attendees",
    });
  }
};
export default exportEventAttendeesCsv;