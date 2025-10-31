import { Request, Response, NextFunction } from "express";

// Extend SessionData to include userId and role
declare module "express-session" {
  interface SessionData {
    userId?: string;
    role?: string;
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId && req.session.role) {
    next(); // User is authenticated
  } else {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired session" });
  }
};

const requireRole =
  (role: string) => (req: Request, res: Response, next: NextFunction) => {
    if (req.session.role !== role) {
      // Check if user has the required role permission
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };

const authMiddleware = {
  requireAuth,
  requireRole,
};

export default authMiddleware;
