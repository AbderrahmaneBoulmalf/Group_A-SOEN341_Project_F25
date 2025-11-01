import type { Request, Response, NextFunction } from "express";
import db from "../db.js";

export default async function ensureActiveManager(req: Request, res: Response, next: NextFunction) {
  try {
    const s: any = (req as any).session || {};
    const role = typeof s.role === "string" ? String(s.role).toLowerCase() : null;
    if (role !== "manager") return res.status(403).json({ success: false, message: "Insufficient role" });
    if (!s.userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const [rows]: any = await db.promise().query(
      "SELECT Status FROM Users WHERE ID = ? AND Role = 'manager' LIMIT 1",
      [s.userId]
    );
    const row = rows?.[0];
    const statusNum = Number.isFinite(Number(row?.Status)) ? Number(row.Status) : null;

    s.status = statusNum;

    if (statusNum === 1) return next();
    if (statusNum === 2) return res.status(403).json({ success: false, message: "Manager access denied" });
    return res.status(403).json({ success: false, message: "Manager approval pending" });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e?.message || "Authorization failed" });
  }
}
