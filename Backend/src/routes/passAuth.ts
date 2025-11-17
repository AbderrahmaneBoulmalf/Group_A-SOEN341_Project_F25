import express from "express";
import pool from "../db.js";

const router = express.Router();

//Creates a new pass and puts in the database
router.post("/passes", async (req, res) => {
  try {
    const { passKey, user_id, event_id } = req.body;

    if (
      typeof passKey !== "string" ||
      !Number.isInteger(user_id) ||
      !Number.isInteger(event_id)
    ) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    await pool.promise().execute(
      `INSERT INTO TicketPasses (\`pass\`, user_id, event_id, valid)
     VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE
       \`pass\` = VALUES(\`pass\`),
       valid = 1`,
      [passKey, user_id, event_id]
    );

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("insert pass error:", err);
    return res.status(500).json({ error: "Failed to insert pass" });
  }
});

//Verify passes. Only one use
router.post("/verify", async (req, res) => {
  try {
    const { pass } = req.body;
    if (typeof pass !== "string" || pass.length === 0) {
      return res.status(400).json({ error: "Bad pass value" });
    }

    const [rows]: any = await pool
      .promise()
      .execute(
        "SELECT user_id, event_id, valid FROM TicketPasses WHERE `pass` = ? LIMIT 1",
        [pass]
      );

    if (!rows.length || rows[0].valid !== 1) {
      // Not found or already invalid/used
      return res.status(200).json({ valid: false });
    }

    const row = rows[0];

    //use once only
    await pool
      .promise()
      .execute("UPDATE TicketPasses SET valid = 0 WHERE `pass` = ?", [pass]);

    return res.status(200).json({
      valid: true,
      user_id: row.user_id,
      event_id: row.event_id,
    });
  } catch (err) {
    console.error("verify error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//Get Pass
router.get("/getPasses", async (req, res) => {
  //console.log("[getPasses] query:", req.query);

  try {
    const user_id = Number(req.query.user_id);
    const event_id = Number(req.query.event_id);

    if (!Number.isInteger(user_id) || !Number.isInteger(event_id)) {
      console.error("[getPasses] bad input", {
        user_id,
        event_id,
        types: {
          user_id: typeof req.query.user_id,
          event_id: typeof req.query.event_id,
        },
      });
      return res
        .status(400)
        .json({ error: "user_id and event_id must be integers" });
    }

    const [rows]: any = await pool
      .promise()
      .execute(
        "SELECT `pass`, user_id, event_id, valid FROM TicketPasses WHERE user_id = ? AND event_id = ? LIMIT 1",
        [user_id, event_id]
      );

    if (!rows.length) {
      return res.status(404).json({ exists: false });
    }

    const row = rows[0];
    if (row.valid !== 1) {
      return res.status(404).json({ exists: false });
    }

    return res.status(200).json({
      exists: true,
      pass: row.pass,
      user_id: row.user_id,
      event_id: row.event_id,
      valid: row.valid,
    });
  } catch (err) {
    console.error("lookup pass error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
