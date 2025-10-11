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

const getProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  try {
    const sql = "SELECT Username, Email FROM Users WHERE ID = ?";
    const [result] = await db.promise().query<any[]>(sql, [userId]);
    if (result.length === 0) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.status(200).json({
      success: true,
      profile: {
        username: result[0].Username,
        email: result[0].Email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.session.userId;
  const { username, email } = req.body;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    if (username) {
      await changeUsername(userId, username);
    }
    if (email) {
      await changeEmail(userId, email);
    }
    res
      .status(200)
      .json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

const changeUsername = async (
  userId: string,
  newUsername: string
): Promise<void> => {
  try {
    const sql = "SELECT * FROM Users WHERE Username = ?";
    const [existingUser] = await db.promise().query<any[]>(sql, [newUsername]);

    if (existingUser.length > 0) {
      throw new Error("Username already taken");
    }

    const updateSql = "UPDATE Users SET Username = ? WHERE ID = ?";
    await db.promise().query(updateSql, [newUsername, userId]);
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

const changeEmail = async (userId: string, newEmail: string): Promise<void> => {
  try {
    const sql = "SELECT * FROM Users WHERE Email = ?";
    const [existingUser] = await db.promise().query<any[]>(sql, [newEmail]);

    if (existingUser.length > 0) {
      throw new Error("Email already taken");
    }

    const updateSql = "UPDATE Users SET Email = ? WHERE ID = ?";
    await db.promise().query(updateSql, [newEmail, userId]);
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

const changePassword = async (req: Request, res: Response): Promise<void> => {
  const userId = req.session.userId;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const passwordSql = "SELECT Hash FROM Users WHERE ID = ?";
    const [result] = await db.promise().query<any[]>(passwordSql, [userId]);

    if (result.length === 0) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, result[0].Hash);

    if (!isMatch) {
      res
        .status(401)
        .json({ success: false, message: "Invalid current password" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const sql = "UPDATE Users SET Hash = ? WHERE ID = ?";
    await db.promise().query(sql, [hashedPassword, userId]);

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  const userId = req.session.userId;
  let connection;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const deleteSql = "DELETE FROM Users WHERE ID = ?";
    await connection.query(deleteSql, [userId]);

    const deleteEventsSql = "DELETE FROM SavedEvents WHERE ClientID = ?";
    await connection.query(deleteEventsSql, [userId]);

    const deleteTicketsSql = "DELETE FROM ClaimedTickets WHERE student_id = ?";
    await connection.query(deleteTicketsSql, [userId]);

    await connection.commit();
    res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    await connection?.rollback(); // Rollback transaction on error
    res.status(500).json({ success: false, message: (error as Error).message });
  } finally {
    if (connection) connection.release();
  }
};

const userService = {
  getUsername,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};

export default userService;
