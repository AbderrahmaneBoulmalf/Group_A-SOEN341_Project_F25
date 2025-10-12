import type { Request, Response } from "express";
import { randomUUID } from "crypto";

//Browser compatibility styff
function fallbackRandomId() {
  return (
    "p_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  );
}

export async function issuePass(req: Request, res: Response) {
  //get eventId from frontend
  const { eventId } = (req.body ?? {}) as { eventId?: string | number };
  //read userId from the session

  const userId = (req as any).session?.userId;

  if (!eventId) return res.status(400).json({ error: "missing_eventId" });

  //generate passId
  const passId =
    typeof randomUUID === "function" ? randomUUID() : fallbackRandomId();

  //add to database later

  return res.json({ passId });
}

export default issuePass;
