import type { Request, Response } from "express";
import type { PoolConnection, ResultSetHeader } from "mysql2/promise";

import db from "../db.js";

const deleteEvent = async (req: Request, res: Response) => {
  const eventId = Number(req.params.eventId);
  if (!Number.isFinite(eventId)) {
    res.status(400).json({ success: false, message: "Invalid event id" });
    return;
  }

  let connection: PoolConnection | null = null;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    await connection.query("DELETE FROM ClaimedTickets WHERE event_id = ?", [
      eventId,
    ]);
    await connection.query("DELETE FROM SavedEvents WHERE EventID = ?", [
      eventId,
    ]);

    const [result] = await connection.query<ResultSetHeader>(
      "DELETE FROM events WHERE id = ?",
      [eventId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    await connection.commit();
    res.status(200).json({ success: true });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {
        // ignore rollback error
      }
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: (error as Error).message,
    });
  } finally {
    connection?.release();
  }
};

const adminEventsController = { deleteEvent };
export default adminEventsController;

