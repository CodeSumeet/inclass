import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";

declare module "express" {
  interface Request {
    user?: admin.auth.DecodedIdToken;
  }
}

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    next(error);
  }
};

export { authenticate };
