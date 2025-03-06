import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as UserService from "../services/user.service";
import { UpdateUserDto } from "../types/user.types";

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await UserService.getUserProfile(userId);
    res.json(user);
  }
);

export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const updateData: UpdateUserDto = req.body;
    const updatedUser = await UserService.updateUserProfile(userId, updateData);
    res.json(updatedUser);
  }
);

export const getUserClassrooms = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const classrooms = await UserService.getUserClassrooms(userId);
    res.json(classrooms);
  }
);

export const getUserEnrollments = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const enrollments = await UserService.getUserEnrollments(userId);
    res.json(enrollments);
  }
);
