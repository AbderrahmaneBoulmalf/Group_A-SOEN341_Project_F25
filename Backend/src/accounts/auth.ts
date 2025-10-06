import bcrypt from "bcrypt";
import db from "../db.js";
import { Request, Response } from "express";

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

    // Compare passwords
    const isMatch = await bcrypt.compare(password, result[0].Hash);

    if (isMatch) {
      // Store user ID in session
      req.session.role = result[0].Role;
      req.session.userId = result[0].ID;
      res.status(200).json({
        success: true,
        message: "Login successful",
        role: result[0].Role,
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

const auth = {
  login,
};

export default auth;
