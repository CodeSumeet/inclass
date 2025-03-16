import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as AnalyticsService from "../services/analytics.service";

export const logActivity = asyncHandler(async (req: Request, res: Response) => {
  const { userId, activityType, resourceId, resourceType, metadata } = req.body;

  const activity = await AnalyticsService.logActivity({
    userId,
    activityType,
    resourceId,
    resourceType,
    metadata,
  });

  res.status(201).json(activity);
});

export const getClassroomAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const analytics = await AnalyticsService.getClassroomAnalytics(
      classroomId,
      userId
    );
    res.status(200).json(analytics);
  }
);

export const getUserEngagement = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId, userId } = req.params;
    const requesterId = req.user?.userId;

    if (!requesterId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const engagement = await AnalyticsService.getUserEngagement(
      classroomId,
      userId,
      requesterId
    );
    res.status(200).json(engagement);
  }
);

export const getUserPerformance = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId, userId } = req.params;
    const requesterId = req.user?.userId;

    if (!requesterId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const performance = await AnalyticsService.getUserPerformance(
      classroomId,
      userId,
      requesterId
    );
    res.status(200).json(performance);
  }
);

export const getTeacherDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const stats = await AnalyticsService.getTeacherDashboardStats(userId);
    res.status(200).json(stats);
  }
);

export const getStudentDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const stats = await AnalyticsService.getStudentDashboardStats(userId);
    res.status(200).json(stats);
  }
);
