import express from "express";
import cors from "cors";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import db from "./db.js";
import authMiddleware from "./middleware/authMiddleware.js";
import auth from "./accounts/auth.js";
import events from "./events/events.js";
import analytics from "./analytics/analytics.js";
import userService from "./accounts/userService.js";
import studentEventsController from "./accounts/students/events.js";
import passRoute from "./routes/passAuth.js";
import exportEventAttendeesCsv from "./events/exportAttendees.js";
import adminOrganizers from "./accounts/adminOrganizers.js";
import ensureActiveManager from "./middleware/ensureActiveManager.js";
import accountManagementController from "./accounts/admins/manageAccounts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
    },
  })
);

app.use((req, _res, next) => {
  (req as any).session?.touch?.();
  next();
});

console.log("Database module imported:", db ? "success" : "failed");

app.post("/register", auth.register);
app.post("/login", auth.login);
app.post("/logout", auth.logout);

app.get("/verify-session", authMiddleware.requireAuth, (req, res) =>
  res.status(200).json({ success: true, role: req.session.role })
);



app.get("/user", authMiddleware.requireAuth, userService.getUsername);
app.get("/profile", authMiddleware.requireAuth, userService.getProfile);

app.get("/session/me", authMiddleware.requireAuth, (req, res) => {
  const s: any = (req as any).session || {};
  const role = typeof s.role === "string" ? String(s.role).toLowerCase() : null;
  const statusNum =
    Number.isFinite(Number(s.status)) ? Number(s.status) : null;
  res.status(200).json({
    success: true,
    user: {
      id: s.userId ?? null,
      username: s.username ?? null,
      email: s.email ?? null,
      role,
      status: statusNum,
    },
  });
});

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

app.get(
  "/student/tickets",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("student"),
  async (req, res) => {
    try {
      const studentId = (req as any).session?.userId;
      if (!studentId) {
        return res
          .status(401)
          .json({ success: false, message: "No student ID in session" });
      }

      const [claimedRows] = await db
        .promise()
        .query("SELECT * FROM ClaimedTickets WHERE student_id = ?", [
          studentId,
        ]);
      const claimed: any[] = (claimedRows as any[]) || [];

      if (claimed.length === 0) {
        return res.status(200).json({ success: true, tickets: [] });
      }

      const eventIds = Array.from(
        new Set(
          claimed
            .map((r: any) => Number(r.event_id))
            .filter((n) => Number.isFinite(n))
        )
      );

      let eventsMap: Record<number, any> = {};
      if (eventIds.length > 0) {
        const placeholders = eventIds.map(() => "?").join(",");
        const [rows] = await db
          .promise()
          .query(
            `SELECT id, title, date, location FROM events WHERE id IN (${placeholders})`,
            eventIds
          );
        (rows as any[]).forEach((r: any) => (eventsMap[Number(r.id)] = r));
      }

      const tickets = claimed.map((c: any) => {
        const ev = eventsMap[Number(c.event_id)];
        return {
          id: c.id,
          student_id: c.student_id,
          event_id: c.event_id,
          eventTitle: ev?.title ?? null,
          date: ev?.date ?? null,
          location: ev?.location ?? null,
        };
      });

      res.status(200).json({ success: true, tickets });
    } catch (error) {
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
      const studentId = (req as any).session?.userId;
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

      const [insertResult] = await db
        .promise()
        .query(
          "INSERT INTO ClaimedTickets (student_id, event_id) VALUES (?, ?)",
          [studentId, eventId]
        );

      return res.status(200).json({
        success: true,
        message: "Ticket claimed",
        ticketId: (insertResult as any).insertId ?? null,
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

app.post(
  "/student/pay-and-claim",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("student"),
  async (req, res) => {
    try {
      const studentId = (req as any).session?.userId;
      const { eventId, payment } = req.body;

      if (!studentId)
        return res
          .status(401)
          .json({ success: false, message: "Not authenticated" });
      if (!eventId || isNaN(Number(eventId)))
        return res
          .status(400)
          .json({ success: false, message: "Missing or invalid eventId" });
      if (!payment || !payment.card || String(payment.card).length < 12)
        return res
          .status(400)
          .json({ success: false, message: "Invalid payment info" });

      const [existing] = await db
        .promise()
        .query(
          "SELECT * FROM ClaimedTickets WHERE student_id = ? AND event_id = ?",
          [studentId, eventId]
        );
      if ((existing as any[]).length > 0)
        return res
          .status(409)
          .json({ success: false, message: "Ticket already claimed" });

      const [insertResult] = await db
        .promise()
        .query(
          "INSERT INTO ClaimedTickets (student_id, event_id) VALUES (?, ?)",
          [studentId, eventId]
        );

      return res.status(200).json({
        success: true,
        message: "Payment accepted, ticket claimed",
        ticketId: (insertResult as any).insertId ?? null,
      });
    } catch (err) {
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

app.use("/student", passRoute);

app.use(
  "/admin/organizers",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("admin"),
  adminOrganizers
);

app.post(
  "/api/events",
  authMiddleware.requireAuth,
  ensureActiveManager,
  events.createEvent
);
app.get("/api/events", events.getEvents);

app.get(
  "/api/events/:eventId/attendees/export",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("manager"),
  exportEventAttendeesCsv
);

// Admin Routes

app.get(
  "/admin/manager-accounts",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("admin"),
  accountManagementController.getManagerAccounts
);

app.post(
  "/admin/reactivate-manager",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("admin"),
  accountManagementController.reactivateManagerAccount
);

app.post(
  "/admin/disable-manager",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("admin"),
  accountManagementController.deactivateManagerAccount
// Admin analytics (requires admin role)
app.get(
  "/api/admin/analytics",
  authMiddleware.requireAuth,
  authMiddleware.requireRole("admin"),
  analytics.getAnalytics
);

// Start Server
app.listen(8787, () => {
  console.log("Server running on http://localhost:8787");
});
