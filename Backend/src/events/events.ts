import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

import db from "../db.js";

interface CreateEventBody {
  title: string;
  date: string;
  organization: string;
  description: string;
  location: string;
  category: string;
  capacity?: number | null;
  price?: number | null;
  imageUrl?: string | null;
  longDescription?: string | null;
  requirements?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  tags?: string[] | string | null;
  startTime?: string | null;
  endTime?: string | null;
  registrationDeadline?: string | null;
  isOnline?: boolean;
  meetingLink?: string | null;
}

type EventRow = RowDataPacket & {
  id: number;
  title: string;
  date: string;
  organization: string;
  description: string;
  location: string;
  category: string;
  capacity: number | null;
  price: number | null;
  imageUrl: string | null;
  longDescription: string | null;
  requirements: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  tags: string | null;
  startTime: string | null;
  endTime: string | null;
  registrationDeadline: string | null;
  isOnline: number | boolean | null;
  meetingLink: string | null;
};

interface EventResponse {
  id: number;
  title: string;
  date: string;
  organization: string;
  description: string;
  location: string;
  category: string;
  capacity?: number;
  price?: number;
  imageUrl?: string;
  longDescription?: string;
  requirements?: string;
  contactEmail?: string;
  contactPhone?: string;
  tags: string[];
  startTime?: string;
  endTime?: string;
  registrationDeadline?: string;
  isOnline: boolean;
  meetingLink?: string;
}

const getEvents = (req: Request, res: Response) => {
  const { search, category, dateFrom, dateTo, sort } =
    (req.query as Record<string, string>) || {};

  let sql = `
    SELECT
      id, title, date, organization, description, location, category,
      capacity, price, imageUrl, longDescription, requirements,
      contactEmail, contactPhone, tags, startTime, endTime,
      registrationDeadline, isOnline, meetingLink
    FROM events
    WHERE 1=1
  `;
  const params: string[] = [];

  if (search && search.trim() !== "") {
    sql += ` AND (title LIKE ? OR description LIKE ?)`;
    const like = `%${search.trim()}%`;
    params.push(like, like);
  }
  if (category && category.trim() !== "") {
    sql += ` AND category = ?`;
    params.push(category.trim());
  }
  if (dateFrom && dateFrom.trim() !== "") {
    sql += ` AND DATE(date) >= ?`;
    params.push(dateFrom.trim());
  }
  if (dateTo && dateTo.trim() !== "") {
    sql += ` AND DATE(date) <= ?`;
    params.push(dateTo.trim());
  }

  // exactly one ORDER BY
  if (sort === "capacity") {
    sql += ` ORDER BY CASE WHEN capacity IS NULL THEN 1 ELSE 0 END ASC, capacity DESC, \`date\` ASC`;
  } else {
    sql += ` ORDER BY \`date\` ASC`;
  }

  db.query<EventRow[]>(sql, params, (err, results) => {
    if (err) {
      console.error("GET /api/events SQL:", sql, params);
      console.error(
        "MySQL error:",
        (err as any).sqlMessage || err.message,
        (err as any).code
      );
      return res.status(500).json({ error: "Failed to fetch events" });
    }

    const processedResults: EventResponse[] = results.map(
      (event): EventResponse => {
        let tags: string[] = [];
        if (event.tags) {
          try {
            const parsed = JSON.parse(event.tags);
            if (Array.isArray(parsed)) {
              tags = parsed.map((tag) => String(tag).trim()).filter(Boolean);
            }
          } catch (parseError) {
            console.warn("Failed to parse event tags:", parseError);
          }
        }

        return {
          id: event.id,
          title: event.title,
          date: event.date,
          organization: event.organization,
          description: event.description,
          location: event.location,
          category: event.category,
          capacity: event.capacity ?? undefined,
          price: event.price ?? undefined,
          imageUrl: event.imageUrl ?? undefined,
          longDescription: event.longDescription ?? undefined,
          requirements: event.requirements ?? undefined,
          contactEmail: event.contactEmail ?? undefined,
          contactPhone: event.contactPhone ?? undefined,
          tags,
          startTime: event.startTime ?? undefined,
          endTime: event.endTime ?? undefined,
          registrationDeadline: event.registrationDeadline ?? undefined,
          isOnline: Boolean(event.isOnline),
          meetingLink: event.meetingLink ?? undefined,
        };
      }
    );

    res.json(processedResults);
  } catch (err) {
    console.error("GET /api/events error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

const REQUIRED_FIELDS: (keyof CreateEventBody)[] = [
  "title",
  "date",
  "organization",
  "description",
  "location",
  "category",
  "contactEmail",
];

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const phonePattern = /^\+?[-\d\s()]{7,}$/;

const createEvent = async (
  req: Request<unknown, unknown, CreateEventBody>,
  res: Response
) => {
  try {
    const body = req.body;

    const missingFields = REQUIRED_FIELDS.filter((field) => {
      const value = body[field];
      if (typeof value === "string") {
        return value.trim().length === 0;
      }
      return value === undefined || value === null;
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        details: missingFields,
      });
    }

    if (!emailPattern.test(body.contactEmail.trim())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid contact email" });
    }

    if (body.contactPhone && !phonePattern.test(body.contactPhone.trim())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid contact phone" });
    }

    if (typeof body.capacity === "number" && body.capacity < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Capacity cannot be negative" });
    }

    if (typeof body.price === "number" && body.price < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Price cannot be negative" });
    }

    if (body.isOnline && !body.meetingLink?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Meeting link is required for online events",
      });
    }

    if (
      body.registrationDeadline &&
      body.date &&
      body.registrationDeadline > body.date
    ) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline cannot be after the event date",
      });
    }

    const normalizedTags = (() => {
      if (!body.tags) return null;
      if (Array.isArray(body.tags)) {
        const cleaned = body.tags
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
        return cleaned.length > 0 ? JSON.stringify(cleaned) : null;
      }
      if (typeof body.tags === "string") {
        const cleaned = body.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
        return cleaned.length > 0 ? JSON.stringify(cleaned) : null;
      }
      return null;
    })();

    const sql = `
      INSERT INTO events (
        title,
        date,
        organization,
        description,
        location,
        category,
        capacity,
        price,
        imageUrl,
        longDescription,
        requirements,
        contactEmail,
        contactPhone,
        tags,
        startTime,
        endTime,
        registrationDeadline,
        isOnline,
        meetingLink
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      body.title.trim(),
      body.date,
      body.organization.trim(),
      body.description.trim(),
      body.location.trim(),
      body.category.trim(),
      body.capacity ?? null,
      body.price ?? null,
      body.imageUrl?.trim() || null,
      body.longDescription?.trim() || null,
      body.requirements?.trim() || null,
      body.contactEmail.trim(),
      body.contactPhone?.trim() || null,
      normalizedTags,
      body.startTime || null,
      body.endTime || null,
      body.registrationDeadline || null,
      body.isOnline ? 1 : 0,
      body.isOnline ? body.meetingLink?.trim() || null : null,
    ];

    const [result] = await db.promise().query<ResultSetHeader>(sql, params);

    return res.status(201).json({
      success: true,
      eventId: result.insertId,
    });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create event" });
  }
};
const getEventAnalytics = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id, 10);

  if (isNaN(eventId)) {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  try {
    // Tickets sold
    const [ticketsResult] = await db.promise().query(
      `SELECT COUNT(*) AS ticketsSold
         FROM ClaimedTickets
         WHERE event_id = ?`,
      [eventId]
    );
    const ticketsSold = (ticketsResult as any)[0]?.ticketsSold || 0;

    // Event info
    const [eventResult] = await db
      .promise()
      .query(`SELECT price, capacity FROM events WHERE id = ?`, [eventId]);
    const eventRow = (eventResult as any)[0];
    const price = eventRow?.price || 0;
    const capacity = eventRow?.capacity || 0;

    // Attendance (if no checked_in column, assume all tickets are attended)
    const attendance = ticketsSold;

    // Revenue
    const revenue = ticketsSold * price;

    res.json({
      ticketsSold,
      attendance,
      revenue,
      capacity,
    });
  } catch (err) {
    console.error("GET /manager/event/:id/analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

const events = { getEvents, createEvent, getEventAnalytics };
export default events;
