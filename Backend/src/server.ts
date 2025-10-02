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
