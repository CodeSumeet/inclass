import { Request, Response } from "express";
import { signUpUser } from "../services/auth.service";
import asyncHandler from "../utils/asyncHandler";

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
