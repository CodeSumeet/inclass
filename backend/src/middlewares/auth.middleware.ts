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
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken.role) {
      return res.status(403).json({ message: "Forbidden: No role assigned" });
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};

export { authenticate, authorizeRole };
