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

      try {
        const insertSql =
          "INSERT INTO ClaimedTickets (student_id, event_id) VALUES (?, ?)";
        const [result] = await db
          .promise()
          .query(insertSql, [studentId, eventId]);
      } catch (dbErr: any) {
        if (dbErr && dbErr.code === "ER_DUP_ENTRY") {
          return res
            .status(409)
            .json({ success: false, message: "Ticket already claimed" });
        }
        throw dbErr;
      }
      
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to claim ticket",
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
app.use("/student", passRoute);

// Event Routes
app.get("/api/events", events.getEvents);

// Start Server
app.listen(8787, () => {
  console.log("Server running on http://localhost:8787");
});
