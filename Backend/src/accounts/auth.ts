import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import db from "../db.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

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
      res.status(400).json({
        success: false,
        message: "username, email, and password are required",
      });
      return;
    }

    const type = String(accountType ?? "user")
      .trim()
      .toLowerCase();
    const allowed = new Set(["manager", "student", "user"]);
    if (!allowed.has(type)) {
      res.status(400).json({ success: false, message: "Invalid account type" });
      return;
    }

    const role = type;
    const status = type === "manager" ? 0 : 1;

    const [existing]: any = await db
      .promise()
      .query("SELECT ID FROM Users WHERE Email = ? LIMIT 1", [email]);
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
      message:
        role === "manager"
          ? "Your manager request has been submitted for admin approval."
          : "User registered",
    });
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      res.status(409).json({ success: false, message: "Email already in use" });
      return;
    }
    res
      .status(500)
      .json({ success: false, message: err?.message || "Registration failed" });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = (req.body ?? {}) as {
    email?: string;
    password?: string;
  };

  try {
    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
      return;
    }

    const [rows]: any = await db
      .promise()
      .query(
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
    const status = Number.isFinite(Number(user.Status))
      ? Number(user.Status)
      : null;
    if (role !== "manager" && status !== 1) {
      res
        .status(403)
        .json({ success: false, message: "User account is not active." });
      return;
    }

    const s: any = (req as any).session;
    s.userId = user.ID ?? null;
    s.role = role;
    s.status = status;

    s.save((e: any) => {
      if (e) {
        res.status(500).json({
          success: false,
          message: "Session save failed",
          error: e?.message,
        });
        return;
      }
      const base = { success: true, role, status };
      if (role === "manager") {
        if (status === 0) {
          res.status(200).json({
            ...base,
            message: "Login successful (manager pending approval)",
          });
          return;
        }
        if (status === 2) {
          res.status(200).json({
            ...base,
            message: "Login successful (manager access denied)",
          });
          return;
        }
      }
      res.status(200).json({ ...base, message: "Login successful" });
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: err?.message || "Login failed" });
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

const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const sql = "SELECT ID FROM Users WHERE Email = ?";
    const [rows]: any = await db.promise().query(sql, [email]);

    if (!rows || rows.length === 0) {
      res.status(200).json({ success: true });
      return;
    }

    const id = rows[0].ID;
    const token = jwt.sign({ userId: id }, process.env.JWT_SECRET || "token", {
      expiresIn: "1h",
    });

    //Fake email for demo purposes
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"EventHub" <no-reply@eventhub.com>',
      to: email,
      subject: "Password Reset",
      text: `Click here to reset your password: http://localhost:5173/reset-password/${token}`,
    });

    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

    res.json({ success: true });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process request" });
  }
};

const verifyToken = (req: Request, res: Response): any => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ success: false, message: "Token is required" });
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || "token");
    res.status(200).json({ success: true, message: "Token is valid" });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Token verification failed" });
  }
};

const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const sql = "UPDATE Users SET Hash = ? WHERE ID = ?";
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "token") as {
      userId: string;
    };
    await db.promise().query(sql, [hashedPassword, decoded.userId]);
    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};

const authModuleController = {
  register,
  login,
  logout,
  forgotPassword,
  verifyToken,
  resetPassword,
};
export default authModuleController;
