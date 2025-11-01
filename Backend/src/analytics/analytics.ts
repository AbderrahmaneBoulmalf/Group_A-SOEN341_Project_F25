import type { Request, Response } from "express";
import db from "../db.js";

const getAnalytics = async (req: Request, res: Response) => {
  try {
    // Total number of events
    const [eventsCountRows] = await db.promise().query(
      "SELECT COUNT(*) AS count FROM events"
    );
    const totalEvents = (eventsCountRows as any[])[0]?.count ?? 0;

    // Total attendance (claimed tickets)
    const [attendanceRows] = await db.promise().query(
      "SELECT COUNT(*) AS count FROM ClaimedTickets"
    );
    const totalAttendance = (attendanceRows as any[])[0]?.count ?? 0;

    // Attendance per event (top events by attendance)
    const [attendancePerEventRows] = await db.promise().query(
      `SELECT e.id AS eventId, e.title, e.capacity, COUNT(ct.id) AS attendance
       FROM events e
       LEFT JOIN ClaimedTickets ct ON e.id = ct.event_id
       GROUP BY e.id
       ORDER BY attendance DESC, e.date ASC
       LIMIT 100`
    );

    // Events per month with attendance aggregated (last 24 months)
    const [eventsPerMonthRows] = await db.promise().query(
      `SELECT DATE_FORMAT(e.date, '%Y-%m') AS month,
              COUNT(*) AS eventsCount,
              COALESCE(SUM(ctcount.attendance), 0) AS attendance
       FROM events e
       LEFT JOIN (
         SELECT event_id, COUNT(*) AS attendance
         FROM ClaimedTickets
         GROUP BY event_id
       ) AS ctcount ON e.id = ctcount.event_id
       GROUP BY month
       ORDER BY month ASC
       LIMIT 24`
    );

    res.json({
      success: true,
      totalEvents: Number(totalEvents),
      totalAttendance: Number(totalAttendance),
      attendancePerEvent: attendancePerEventRows,
      eventsPerMonth: eventsPerMonthRows,
    });
  } catch (err) {
    console.error("GET /api/admin/analytics error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};

const analytics = { getAnalytics };
export default analytics;
