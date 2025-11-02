import { Request, Response } from "express";
import db from "../../db.js";

const getManagerAccounts = async (_req: Request, res: Response) => {
  try {
    const sqlActive =
      "SELECT ID, Username, Email FROM Users WHERE Status = TRUE AND Role = ?";
    const sqlPending =
      "SELECT ID, Username, Email FROM Users WHERE Status = FALSE AND Role = ?";
    const sqlDisabled =
      "SELECT ID, Username, Email FROM Users WHERE Status = 2 AND Role = ?";

    const [activeManagers] = await db.promise().query(sqlActive, ["manager"]);
    const [pendingManagers] = await db.promise().query(sqlPending, ["manager"]);
    const [disabledManagers] = await db
      .promise()
      .query(sqlDisabled, ["manager"]);

    res.status(200).json({
      success: true,
      data: {
        active: activeManagers,
        pending: pendingManagers,
        disabled: disabledManagers,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching manager accounts" });
  }
};

const reactivateManagerAccount = async (req: Request, res: Response) => {
  const { accountId } = req.body;
  try {
    const sql = "UPDATE Users SET Status = TRUE WHERE ID = ? AND Role = ?";
    await db.promise().query(sql, [accountId, "manager"]);
    res
      .status(200)
      .json({
        success: true,
        message: "Manager account reactivated successfully",
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error reactivating manager account" });
  }
};

const deactivateManagerAccount = async (req: Request, res: Response) => {
  const { accountId } = req.body;
  try {
    const sql = "UPDATE Users SET Status = 2 WHERE ID = ? AND Role = ?";
    await db.promise().query(sql, [accountId, "manager"]);
    res
      .status(200)
      .json({
        success: true,
        message: "Manager account disabled successfully",
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error disabling manager account" });
  }
};

const accountManagementController = {
  getManagerAccounts,
  reactivateManagerAccount,
  deactivateManagerAccount,
};

export default accountManagementController;
