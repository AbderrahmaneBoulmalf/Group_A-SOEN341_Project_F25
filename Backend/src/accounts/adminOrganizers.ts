import { Router } from "express";
import db from "../db.js";

const router = Router();

router.get("/pending", async (_req, res) => {
  try {
    const [rows]: any = await db
      .promise()
      .query("SELECT ID, Username, Email, Role, Status FROM Users WHERE Role='manager' AND Status=0 ORDER BY ID DESC");
    res.status(200).json({ success: true, users: rows ?? [] });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Failed to load pending managers" });
  }
});

router.post("/:id/approve", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    await db.promise().execute("UPDATE Users SET Status=1 WHERE ID=? AND Role='manager'", [id]);
    res.status(200).json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Failed to approve" });
  }
});

router.post("/:id/reject", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    await db.promise().execute("UPDATE Users SET Status=2 WHERE ID=? AND Role='manager'", [id]);
    res.status(200).json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message || "Failed to reject" });
  }
});

export default router;
