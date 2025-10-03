import mysql from "mysql2";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const db = mysql.createPool({
  host: process.env.AIVEN_DB_HOST,
  user: process.env.AIVEN_DB_USER,
  password: process.env.AIVEN_DB_PASS,
  database: process.env.AIVEN_DB_NAME,
  port: Number(process.env.AIVEN_DB_PORT),
  connectionLimit: Number(process.env.AIVEN_CONNECTION_LIMIT),
  waitForConnections: true,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Database connected successfully!");
    connection.release();
  }
});

export default db;
