import type { Request, Response } from "express";

import db from "../db.js";


const getEvents = (req: Request, res: Response) => {
  console.log("[/api/events] query =", req.query);

  const { search, category, dateFrom, dateTo } =
    (req.query as Record<string, string>) || {};

  // First, check what columns exist in the events table
  let sql = `
    SELECT id, title, date, organization, description, location, category
    FROM events
    WHERE 1=1
  `;
  const params: any[] = [];

  // free-text search in title OR description
  if (search && search.trim() !== "") {
    sql += ` AND (title LIKE ? OR description LIKE ?)`;
    const like = `%${search.trim()}%`;
    params.push(like, like);
  }

  // category filter (exact)
  if (category && category.trim() !== "") {
    sql += ` AND category = ?`;
    params.push(category.trim());
  }

  // date range filters (inclusive)
  if (dateFrom && dateFrom.trim() !== "") {
    sql += ` AND DATE(date) >= ?`;
    params.push(dateFrom.trim());
  }
  if (dateTo && dateTo.trim() !== "") {
    sql += ` AND DATE(date) <= ?`;
    params.push(dateTo.trim());
  }

  // stable ordering
  sql += ` ORDER BY date ASC`;

  db.query(sql, params, (err: any, results: any[]) => {
    if (err) {
      console.error("GET /api/events error:", err);
      return res.status(500).json({ error: "Failed to fetch events" });
    }
    
    // Process results to add default values for enhanced fields
    const processedResults = results.map((event: any) => ({
      ...event,
      // Add default values for enhanced fields if they don't exist
      capacity: event.capacity || undefined,
      price: event.price !== null ? event.price : undefined,
      imageUrl: event.imageUrl || undefined,
      longDescription: event.longDescription || undefined,
      requirements: event.requirements || undefined,
      contactEmail: event.contactEmail || undefined,
      contactPhone: event.contactPhone || undefined,
      tags: event.tags ? (typeof event.tags === 'string' ? JSON.parse(event.tags) : event.tags) : [],
      startTime: event.startTime || undefined,
      endTime: event.endTime || undefined,
      registrationDeadline: event.registrationDeadline || undefined,
      isOnline: Boolean(event.isOnline),
      meetingLink: event.meetingLink || undefined,
    }));
    
    res.json(processedResults);
  });
};

const events = { getEvents };
export default events;
