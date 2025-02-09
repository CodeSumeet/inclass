import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";
import asyncHandler from "../utils/asyncHandler";

declare module "express" {
  interface Request {
    user?: admin.auth.DecodedIdToken;
  }
}

const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("Error verifying Firebase token:", error);
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
  }
);

export { authenticate };
