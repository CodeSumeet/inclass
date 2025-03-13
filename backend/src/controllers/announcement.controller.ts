import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as AnnouncementService from "../services/announcement.service";

export const createAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId, content } = req.body;
    const createdById = req.user?.userId;

    if (!createdById) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const announcement = await AnnouncementService.createAnnouncement(
      classroomId,
      createdById,
      content
    );

    res.status(201).json(announcement);
  }
);

export const getClassroomAnnouncements = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId } = req.params;

    const announcements = await AnnouncementService.getClassroomAnnouncements(
      classroomId
    );

    res.status(200).json(announcements);
  }
);

export const deleteAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const { announcementId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await AnnouncementService.deleteAnnouncement(announcementId, userId);

    res.status(200).json({ message: "Announcement deleted successfully" });
  }
);
