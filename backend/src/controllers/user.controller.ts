import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import asyncHandler from "../utils/asyncHandler";

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await UserService.getUserById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  }
);

export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const updatedUser = await UserService.updateUser(userId, req.body);
    res.json(updatedUser);
  }
);

export const getUserClassrooms = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const classrooms = await UserService.getUserEnrollments(userId);
    res.json(classrooms);
  }
);
