import bcrypt from "bcrypt";
import db from "../db.js";
import { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const saltRounds: number = 10;

const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, accountType } = req.body;
  let connection;

  try {
    //Either all queries succeed or none
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const sqlMail = "SELECT * FROM Users WHERE Email = ?";
    const [existingClients] = await connection.query<any[]>(sqlMail, [email]);

    if (existingClients.length > 0) {
      await connection.rollback();
      connection.release();
      res.status(409).json({ success: false, message: "Email already in use" });
      return;
    }

    const hash = await new Promise<string>((resolve, reject) => {
      bcrypt.hash(password, saltRounds, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const needApproval = accountType.toLowerCase() !== "student" ? true : false;

    const user = {
      Username: username,
      Email: email,
      Hash: hash,
      Role: accountType,
      Status: needApproval ? 0 : 1, // 0 = pending, 1 = active
    };

    const sql = "INSERT INTO Users SET ?";
    await connection.query(sql, user);

    await connection.commit();
    res.status(200).json({
      success: true,
      message: "User registered",
    });
  } catch (err) {
    // Rollback any database operations if error occurred
    if (connection) await connection.rollback();

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: (err as Error).message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const sql = "SELECT * FROM Users WHERE Email = ?";
    const [result] = await db.promise().query<any[]>(sql, [email]);

    if (result.length === 0) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    // Block non-activated accounts

    const isActive = result[0].Status === 1;

    if (!isActive) {
      res.status(403).json({
        success: false,
        message: "User account is not active",
      });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, result[0].Hash);

    if (isMatch) {
      // Store user ID in session
      req.session.role = result[0].Role;
      req.session.userId = result[0].ID;

      req.session.save((err) => {
        if (err) {
          res.status(500).json({
            success: false,
            message: "Session save failed",
            error: err.message,
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: "Login successful",
          role: result[0].Role,
        });
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: (err as Error).message,
    });
  }
};

const logout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: (err as Error).message,
      });
      return;
    }
    res.clearCookie("connect.sid", {
      // Default cookie name
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  });
};

const auth = {
  register,
  login,
  logout,
};

export default auth;
