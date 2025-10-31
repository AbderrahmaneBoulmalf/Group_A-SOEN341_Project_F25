import { Router } from "express";
import type { Request, Response } from "express";
import db from "../db.js";

const router = Router();


router.get("/pending", async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await db
      .promise()
      .query(
        "SELECT ID, Username, Email, Role, Status, created_at FROM Users WHERE Role='manager' AND Status=0 ORDER BY ID DESC"
      );

    res.status(200).json({ success: true, pending: rows ?? [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to fetch pending managers", error: err?.message });
  }
});


router.post("/approve", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body ?? {};
    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({ success: false, message: "Missing or invalid userId" });
    }

    const [result]: any = await db
      .promise()
      .execute(
        "UPDATE Users SET Status=1 WHERE ID=? AND Role='manager' AND Status<>1",
        [userId]
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Manager not found or already active" });
    }

    res.status(200).json({ success: true, message: "Manager approved" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to approve manager", error: err?.message });
  }
});


router.post("/reject", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body ?? {};
    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({ success: false, message: "Missing or invalid userId" });
    }

    
    const [result]: any = await db
      .promise()
      .execute(
        "DELETE FROM Users WHERE ID=? AND Role='manager' AND Status=0",
        [userId]
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Pending manager not found" });
    }

    res.status(200).json({ success: true, message: "Manager rejected and removed" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to reject manager", error: err?.message });
  }
});

export default router;
