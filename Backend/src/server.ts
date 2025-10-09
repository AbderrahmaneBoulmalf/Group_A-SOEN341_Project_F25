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
import { get } from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const app = express();

console.log("Database module imported:", db ? "success" : "failed");

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // React URL
    credentials: true,
  })
);

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

// Student Routes

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

// Event Routes

app.get("/api/events", events.getEvents);

// Start server
app.listen(8787, () => {
  console.log("Server running on http://localhost:8787");
});
