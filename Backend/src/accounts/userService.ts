import { Request, Response } from "express";
import db from "../db.js";

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

const userService = {
  getUsername,
};

export default userService;
