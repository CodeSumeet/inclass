import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as VideoConferenceService from "../services/videoConference.service";
import prisma from "../config/db";

export const createMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify the classroom exists and user has access
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Check if user is the owner or enrolled in the classroom
    const isOwner = classroom.ownerId === userId;

    if (!isOwner) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId,
          classroomId,
        },
      });

      if (!enrollment) {
        return res
          .status(403)
          .json({ message: "Not enrolled in this classroom" });
      }
    }

    // Create a Daily.co room
    const room = await VideoConferenceService.createRoom(
      classroomId,
      classroom.name
    );

    // Store meeting information in the database
    const meeting = await prisma.videoConference.create({
      data: {
        classroomId,
        createdById: userId,
        roomName: room.name,
        roomUrl: room.url,
        status: "ACTIVE",
        startTime: new Date(),
        metadata: {
          dailyRoomData: room,
        },
      },
    });

    // Create a token for the current user
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { firstName: true, lastName: true },
    });

    const participantName = `${user?.firstName} ${user?.lastName}`;

    const token = await VideoConferenceService.createMeetingToken(
      room.name,
      participantName,
      userId,
      isOwner
    );

    res.status(201).json({
      meeting,
      token: token.token,
    });
  }
);

export const joinMeeting = asyncHandler(async (req: Request, res: Response) => {
  const { meetingId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verify the meeting exists and is active
  const meeting = await prisma.videoConference.findUnique({
    where: {
      id: meetingId,
      status: "ACTIVE",
    },
    include: {
      classroom: true,
    },
  });

  if (!meeting) {
    return res.status(404).json({ message: "Active meeting not found" });
  }

  // Check if user is enrolled in the classroom
  const isOwner = meeting.classroom.ownerId === userId;

  if (!isOwner) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: meeting.classroomId,
      },
    });

    if (!enrollment) {
      return res
        .status(403)
        .json({ message: "Not enrolled in this classroom" });
    }
  }

  // Get user details for the token
  const user = await prisma.user.findUnique({
    where: { userId },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Create a token for the user
  const tokenData = await VideoConferenceService.createMeetingToken(
    meeting.roomName,
    user.firstName || user.email,
    userId,
    isOwner
  );

  // Check if the participant has already joined this meeting
  const existingParticipation =
    await prisma.videoConferenceParticipant.findUnique({
      where: {
        conferenceId_userId: {
          conferenceId: meetingId,
          userId,
        },
      },
    });

  // Only create a new participant record if they haven't joined before
  if (!existingParticipation) {
    // Log the participant joining
    await prisma.videoConferenceParticipant.create({
      data: {
        conferenceId: meetingId,
        userId,
        joinTime: new Date(),
      },
    });
  } else if (existingParticipation.leaveTime) {
    // If they joined before but left, update their record with a new join time
    await prisma.videoConferenceParticipant.update({
      where: {
        conferenceId_userId: {
          conferenceId: meetingId,
          userId,
        },
      },
      data: {
        joinTime: new Date(),
        leaveTime: null,
      },
    });
  }
  // If they're already in the meeting (no leaveTime), do nothing

  res.status(200).json({
    meeting,
    token: tokenData.token,
  });
});

export const endMeeting = asyncHandler(async (req: Request, res: Response) => {
  const { meetingId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Find the meeting
  const meeting = await prisma.videoConference.findUnique({
    where: { id: meetingId },
    include: {
      classroom: true,
    },
  });

  if (!meeting) {
    return res.status(404).json({ message: "Meeting not found" });
  }

  // Only the creator or classroom owner can end the meeting
  if (meeting.createdById !== userId && meeting.classroom.ownerId !== userId) {
    return res
      .status(403)
      .json({ message: "Not authorized to end this meeting" });
  }

  // Update meeting status
  const updatedMeeting = await prisma.videoConference.update({
    where: { id: meetingId },
    data: {
      status: "ENDED",
      endTime: new Date(),
    },
  });

  res.status(200).json(updatedMeeting);
});

export const getClassroomMeetings = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify the classroom exists and user has access
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Check if user is the owner or enrolled in the classroom
    const isOwner = classroom.ownerId === userId;

    if (!isOwner) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId,
          classroomId,
        },
      });

      if (!enrollment) {
        return res
          .status(403)
          .json({ message: "Not enrolled in this classroom" });
      }
    }

    // Get meetings for this classroom
    const meetings = await prisma.videoConference.findMany({
      where: {
        classroomId,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    res.status(200).json(meetings);
  }
);
