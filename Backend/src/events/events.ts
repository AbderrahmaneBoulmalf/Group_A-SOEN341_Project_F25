import type { Request, Response } from "express";

import db from "../db.js";


const getEvents = (req: Request, res: Response) => {
  console.log("[/api/events] query =", req.query);

  const { search, category, dateFrom, dateTo } =
    (req.query as Record<string, string>) || {};

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
    res.json(results); // unchanged shape so your teammate's frontend keeps working
  });
};

const events = { getEvents };
export default events;
