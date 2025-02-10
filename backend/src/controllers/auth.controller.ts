import { Request, Response } from "express";
import { signUpUser } from "../services/auth.service";
import asyncHandler from "../utils/asyncHandler";
import prisma from "../config/db";

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const response = await signUpUser(req.body);

    return res.status(201).json(response);
  } catch (error: any) {
    console.error("Error creating user: ", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

export const checkUserExists = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { firebaseUid } = req.query;

      if (!firebaseUid) {
        return res.status(400).json({ message: "Firebase UID is required" });
      }

      const user = await prisma.user.findUnique({
        where: { userId: firebaseUid as string },
      });

      return res.json({ exists: !!user });
    } catch (error) {
      console.error("Error checking user existence: ", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }
);
