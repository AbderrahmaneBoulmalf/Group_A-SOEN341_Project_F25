import { Request, Response } from "express";
import db from "../db.js";
import bcrypt from "bcrypt";

const saltRounds: number = 10;

const getUsername = async (req: Request, res: Response): Promise<void> => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const sql = "SELECT Username FROM Users WHERE ID = ?";
    const [result] = await db.promise().query<any[]>(sql, [userId]);

    if (result.length === 0) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      username: result[0].Username,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: (err as Error).message,
    });
  }
};

const changeUsername = async (req: Request, res: Response): Promise<void> => {
  const userId = req.session.userId;
  const { newUsername } = req.body;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  try {
    const sql = "SELECT * FROM Users WHERE Username = ?";
    const [existingUser] = await db.promise().query<any[]>(sql, [newUsername]);

    if (existingUser.length > 0) {
      res
        .status(400)
        .json({ success: false, message: "Username already taken" });
      return;
    }

    const updateSql = "UPDATE Users SET Username = ? WHERE ID = ?";
    await db.promise().query(updateSql, [newUsername, userId]);

    res
      .status(200)
      .json({ success: true, message: "Username updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

const changeEmail = async (req: Request, res: Response): Promise<void> => {
  const userId = req.session.userId;
  const { newEmail } = req.body;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const sql = "SELECT * FROM Users WHERE Email = ?";
    const [existingUser] = await db.promise().query<any[]>(sql, [newEmail]);

    if (existingUser.length > 0) {
      res.status(400).json({ success: false, message: "Email already taken" });
      return;
    }

    const updateSql = "UPDATE Users SET Email = ? WHERE ID = ?";
    await db.promise().query(updateSql, [newEmail, userId]);

    res
      .status(200)
      .json({ success: true, message: "Email updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

const changePassword = async (req: Request, res: Response): Promise<void> => {
  const userId = req.session.userId;
  const { newPassword } = req.body;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const sql = "UPDATE Users SET Password = ? WHERE ID = ?";
    await db.promise().query(sql, [hashedPassword, userId]);

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

const userService = {
  getUsername,
  changeUsername,
  changeEmail,
  changePassword,
};

export default userService;
