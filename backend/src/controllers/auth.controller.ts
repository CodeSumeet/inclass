import { Request, Response } from "express";
import { signUpUser } from "../services/auth.service";
import asyncHandler from "../utils/asyncHandler";
import prisma from "../config/db";

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  console.log("Sign-up Request Body:", req.body);
  const response = await signUpUser(req.body);
  res.status(201).json(response);
});

export const checkUserExists = asyncHandler(
  async (req: Request, res: Response) => {
    const firebaseUid = req.query.firebaseUid as string;

    if (!firebaseUid) {
      res.status(400).json({ message: "Firebase UID is required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { userId: firebaseUid },
    });

    res.json({ exists: Boolean(user) });
  }
);
