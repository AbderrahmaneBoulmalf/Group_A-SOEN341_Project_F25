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

const studentEventsController = {
  getSavedEvents,
};

export default studentEventsController;
