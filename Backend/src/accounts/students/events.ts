import db from "../../db.js";
import { Request, Response } from "express";

const getSavedEvents = async (req: Request, res: Response) => {
  const userId = req.session.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  try {
    const sql = "SELECT EventID FROM SavedEvents WHERE ClientID = ?";

    const [savedEvents] = await db.promise().query<any[]>(sql, [userId]);

    if (savedEvents.length === 0) {
      res.status(200).json({ success: true, savedEvents: [] });
      return;
    }

    const eventIds = savedEvents.map((event) => event.EventID);

    const eventsSql = "SELECT * FROM events WHERE id IN (?)";
    const [events] = await db.promise().query<any[]>(eventsSql, [eventIds]);

    res.status(200).json({ success: true, savedEvents: events });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

const unsaveEvent = async (req: Request, res: Response) => {
  const userId = req.session.userId;
  const { eventId } = req.body;

  try {
    const sql = "DELETE FROM SavedEvents WHERE ClientID = ? AND EventID = ?";

    await db.promise().query<any[]>(sql, [userId, eventId]);

    res.status(200).json({
      success: true,
      message: "Event unsaved successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

const saveEvent = async (req: Request, res: Response) => {
  const userId = req.session.userId;
  const { eventId } = req.body;

  try {
    const checkSql =
      "SELECT * FROM SavedEvents WHERE ClientID = ? AND EventID = ?";
    const [existingEvents] = await db
      .promise()
      .query<any[]>(checkSql, [userId, eventId]);

    if (existingEvents.length > 0) {
      res.status(200).json({
        success: true,
        saved: false,
        message: "Event already saved.",
      });
      return;
    }

    const sql = "INSERT INTO SavedEvents (ClientID, EventID) VALUES (?, ?)";

    await db.promise().query<any[]>(sql, [userId, eventId]);

    res.status(200).json({
      success: true,
      saved: true,
      message: "Event saved successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

const studentEventsController = {
  getSavedEvents,
  unsaveEvent,
  saveEvent,
};

export default studentEventsController;
