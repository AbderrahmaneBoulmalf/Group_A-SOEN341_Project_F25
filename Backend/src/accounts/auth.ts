import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import db from "../db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const SALT_ROUNDS = 10;

const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, accountType } = (req.body ?? {}) as {
    username?: string;
    email?: string;
    password?: string;
    accountType?: string;
  };

  try {
    if (!username || !email || !password) {
      res.status(400).json({ success: false, message: "username, email, and password are required" });
      return;
    }

    const type = String(accountType ?? "user").trim().toLowerCase();
    const allowed = new Set(["manager", "student", "user"]);
    if (!allowed.has(type)) {
      res.status(400).json({ success: false, message: "Invalid account type" });
      return;
    }

    const role = type;
    const status = type === "manager" ? 0 : 1;

    const [existing]: any = await db.promise().query(
      "SELECT ID FROM Users WHERE Email = ? LIMIT 1",
      [email]
    );
    if (existing?.length) {
      res.status(409).json({ success: false, message: "Email already in use" });
      return;
    }

    const hash = await bcrypt.hash(password!, SALT_ROUNDS);

    await db
      .promise()
      .execute(
        "INSERT INTO Users (Username, Email, Hash, Role, Status) VALUES (?, ?, ?, ?, ?)",
        [username, email, hash, role, status]
      );

    res.status(201).json({
      success: true,
      message: role === "manager"
        ? "Your manager request has been submitted for admin approval."
        : "User registered",
    });
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      res.status(409).json({ success: false, message: "Email already in use" });
      return;
    }
    res.status(500).json({ success: false, message: err?.message || "Registration failed" });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = (req.body ?? {}) as { email?: string; password?: string };

  try {
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required" });
      return;
    }

    const [rows]: any = await db.promise().query(
      "SELECT ID, Username, Email, Hash, Role, Status FROM Users WHERE Email = ? LIMIT 1",
      [email]
    );
    const user = rows?.[0];
    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    const ok = await bcrypt.compare(password!, user.Hash);
    if (!ok) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const role = String(user.Role || "").toLowerCase();
    const status = Number.isFinite(Number(user.Status)) ? Number(user.Status) : null;
    if (role !== "manager" && status !== 1) {
      res.status(403).json({ success: false, message: "User account is not active." });
      return;
    }

    const s: any = (req as any).session;
    s.userId = user.ID ?? null;
    s.role = role;
    s.status = status;

    s.save((e: any) => {
      if (e) {
        res.status(500).json({ success: false, message: "Session save failed", error: e?.message });
        return;
      }
      const base = { success: true, role, status };
      if (role === "manager") {
        if (status === 0) {
          res.status(200).json({ ...base, message: "Login successful (manager pending approval)" });
          return;
        }
        if (status === 2) {
          res.status(200).json({ ...base, message: "Login successful (manager access denied)" });
          return;
        }
      }
      res.status(200).json({ ...base, message: "Login successful" });
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Login failed" });
  }
};

const logout = (req: Request, res: Response): void => {
  const session: any = (req as any).session;
  session?.destroy((err: any) => {
    if (err) {
      res.status(500).json({ success: false, message: err?.message });
      return;
    }
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ success: true, message: "Logout successful" });
  });
};

export default { register, login, logout };
