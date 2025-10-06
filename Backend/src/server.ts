import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();

console.log("Database module imported:", db ? "success" : "failed");

app.use(
  cors({
    origin: "http://localhost:5173", // React URL
    credentials: true,
  })
);
app.use(express.json());
app.get("/api/events", (req, res) => {
  const sql = "SELECT * FROM events";
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Failed to fetch events" });
    } else {
      res.json(results);
    }
  });
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
