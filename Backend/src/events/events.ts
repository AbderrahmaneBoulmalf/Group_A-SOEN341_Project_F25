import db from "../db.js";
import { Request, Response } from "express";

const getEvents = (req: Request, res: Response) => {
  const sql = "SELECT * FROM events";
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Failed to fetch events" });
    } else {
      res.json(results);
    }
  });
};

const events = {
  getEvents,
};

export default events;
