import type { Request, Response, NextFunction } from "express";
import db from "../db.js";

export default async function ensureActiveManager(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const [rows]: any = await db
      .promise()
      .query("SELECT Role, Status FROM Users WHERE ID = ? LIMIT 1", [userId]);

    const user = rows?.[0];
    const role = String(user?.Role ?? "");
    const status = Number(user?.Status ?? 0);

    if (role !== "manager" || status !== 1) {
      return res
        .status(403)
        .json({ success: false, message: "Manager approval pending or insufficient role" });
    }

    next();
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Role check failed",
      error: err?.message,
    });
  }
}
