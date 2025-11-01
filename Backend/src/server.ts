import express from "express";
import cors from "cors";
import db from "./db.js";
import session from "express-session";
import authMiddleware from "./middleware/authMiddleware.js";
import auth from "./accounts/auth.js";
import events from "./events/events.js";
import userService from "./accounts/userService.js";
import studentEventsController from "./accounts/students/events.js";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import passRoute from "./routes/passAuth.js";
import { issuePass } from "./middleware/issuePass.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const app = express();

console.log("Database module imported:", db ? "success" : "failed");

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60, // 1 hour
      httpOnly: true,
    },
  })
);

app.use((req, _, next) => {
  if (req.session) req.session.touch(); // reset maxAge on every request
  next();
});

// Account Routes

app.post("/register", auth.register);
app.post("/login", auth.login);
app.post("/logout", auth.logout);
app.get("/verify-session", authMiddleware.requireAuth, (_req, res) =>
  res.status(200).json({ success: true })
);
app.get("/user", authMiddleware.requireAuth, userService.getUsername);
app.get("/profile", authMiddleware.requireAuth, userService.getProfile);
app.post(
  "/profile/changePassword",
  authMiddleware.requireAuth,
  userService.changePassword
);
app.post(
  "/profile/update",
  authMiddleware.requireAuth,
  userService.updateProfile
);
app.post(
  "/account/deleteAccount",
  authMiddleware.requireAuth,
  userService.deleteAccount
);

// Student Routes
app.get(
  "/student/tickets",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("student"),
  async (req, res) => {
    try {
      const studentId = req.session.userId;

      if (!studentId) {
        return res
          .status(401)
          .json({ success: false, message: "No student ID in session" });
      }

      // Fetch claimed tickets
      const [claimedRows] = await db
        .promise()
        .query("SELECT * FROM ClaimedTickets WHERE student_id = ?", [
          studentId,
        ]);
      const claimed: any[] = (claimedRows as any[]) || [];

      if (claimed.length === 0) {
        return res.status(200).json({ success: true, tickets: [] });
      }

      // Collect distinct event_ids
      const eventIds = Array.from(
        new Set(claimed.map((r: any) => Number(r.event_id)).filter(Boolean))
      );

      let eventsMap: Record<number, any> = {};

      if (eventIds.length > 0) {
        const tryFetchEvents = async (tableName: string) => {
          const placeholders = eventIds.map(() => "?").join(",");
          const sql = `SELECT id, title, date, location FROM ${tableName} WHERE id IN (${placeholders})`;
          const [rows] = await db.promise().query(sql, eventIds);
          return (rows as any[]) || [];
        };

        try {
          const rows = await tryFetchEvents("events");
          rows.forEach((r: any) => (eventsMap[Number(r.id)] = r));
        } catch (err2) {
          console.warn(
            "Could not fetch event details:",
            (err2 as Error).message
          );
        }
      }

      const tickets = claimed.map((c: any) => {
        const ev = eventsMap[Number(c.event_id)];
        return {
          id: c.id,
          student_id: c.student_id,
          event_id: c.event_id,
          eventTitle: ev ? ev.title : null,
          date: ev ? ev.date : null,
          location: ev ? ev.location : null,
        };
      });

      res.status(200).json({ success: true, tickets });
    } catch (error) {
      console.error("Error fetching student tickets:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch tickets",
        error: (error as Error).message,
      });
    }
  }
);

app.post(
  "/student/claim-ticket",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("student"),
  async (req, res) => {
    try {
      const studentId = req.session.userId;
      const { eventId } = req.body;

      if (!studentId) {
        return res
          .status(401)
          .json({ success: false, message: "Not authenticated" });
      }

      if (!eventId || isNaN(Number(eventId))) {
        return res
          .status(400)
          .json({ success: false, message: "Missing or invalid eventId" });
      }

      const [existing] = await db
        .promise()
        .query(
          "SELECT * FROM ClaimedTickets WHERE student_id = ? AND event_id = ?",
          [studentId, eventId]
        );

      if ((existing as any[]).length > 0) {
        return res
          .status(409)
          .json({ success: false, message: "Ticket already claimed" });
      }

      // Insert into ClaimedTickets table in the db
      let result: any;
      try {
        const insertSql =
          "INSERT INTO ClaimedTickets (student_id, event_id) VALUES (?, ?)";
        const [insertResult] = await db
          .promise()
          .query(insertSql, [studentId, eventId]);
        result = insertResult;
      } catch (dbErr: any) {
        if (dbErr && dbErr.code === "ER_DUP_ENTRY") {
          return res
            .status(409)
            .json({ success: false, message: "Ticket already claimed" });
        }
        throw dbErr;
      }

      // Send success response so frontend gets immediate confirmation
      return res.status(200).json({
        success: true,
        message: "Ticket claimed",
        ticketId: result.insertId ?? null,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to claim ticket",
        error: (err as Error).message,
      });
    }
  }
);

// Mock payment endpoint that creates a claimed ticket after "payment"
app.post(
  "/student/pay-and-claim",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("student"),
  async (req, res) => {
    try {
      const studentId = req.session.userId;
      const { eventId, payment } = req.body;

      if (!studentId) {
        return res
          .status(401)
          .json({ success: false, message: "Not authenticated" });
      }
      if (!eventId || isNaN(Number(eventId))) {
        return res
          .status(400)
          .json({ success: false, message: "Missing or invalid eventId" });
      }

      // (Optional) minimal mock payment validation
      if (!payment || !payment.card || String(payment.card).length < 12) {
        // For mock flow fail fast
        return res
          .status(400)
          .json({ success: false, message: "Invalid payment info" });
      }

      const [existing] = await db
        .promise()
        .query(
          "SELECT * FROM ClaimedTickets WHERE student_id = ? AND event_id = ?",
          [studentId, eventId]
        );

      if ((existing as any[]).length > 0) {
        return res
          .status(409)
          .json({ success: false, message: "Ticket already claimed" });
      }

      // Insert into ClaimedTickets table
      const insertSql =
        "INSERT INTO ClaimedTickets (student_id, event_id) VALUES (?, ?)";
      const [insertResult] = await db
        .promise()
        .query(insertSql, [studentId, eventId]);

      return res.status(200).json({
        success: true,
        message: "Payment accepted, ticket claimed",
        ticketId: (insertResult as any).insertId ?? null,
      });
    } catch (err) {
      console.error("pay-and-claim error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to process payment/claim",
        error: (err as Error).message,
      });
    }
  }
);

app.get(
  "/student/saved-events",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("student"),
  studentEventsController.getSavedEvents
);
app.post(
  "/student/unsave-event",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("student"),
  studentEventsController.unsaveEvent
);
app.post(
  "/student/saveEvent",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("student"),
  studentEventsController.saveEvent
);

// Pass Routes
app.post(
  "/student/issue-pass",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("student"),
  issuePass
);
app.use("/internal", passRoute);

app.post(
  "/api/events",
  authMiddleware.requireAuth,

  events.createEvent
);
app.get("/api/events", events.getEvents);

// Start Server
app.listen(8787, () => {
  console.log("Server running on http://localhost:8787");
});
