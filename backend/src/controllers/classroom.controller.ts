import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as ClassroomService from "../services/classroom.service";
import prisma from "../config/db";

export const createClassroom = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, name, section, subject, roomNo, description, coverImage } =
      req.body;
    const classroom = await ClassroomService.createClassroom(
      userId,
      name,
      section,
      subject,
      roomNo,
      description,
      coverImage
    );
    res.status(201).json(classroom);
  }
);

export const joinClassroom = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, code } = req.body;
    const enrollment = await ClassroomService.joinClassroom(userId, code);
    res.status(200).json(enrollment);
  }
);

export const getUserClassrooms = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const classrooms = await ClassroomService.getUserClassrooms(userId);
    res.status(200).json(classrooms);
  }
);

export const getClassroomDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const classroomId = req.params.classroomId;
    const classroom = await ClassroomService.getClassroomDetails(classroomId);
    res.status(200).json(classroom);
  }
);

export const deleteClassroom = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId, userId } = req.body;
    await ClassroomService.deleteClassroom(classroomId, userId);
    res.status(200).json({ message: "Classroom deleted successfully" });
  }
);

export const removeStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { ownerId, classroomId, studentId } = req.body;
    await ClassroomService.removeStudent(ownerId, classroomId, studentId);
    res.status(200).json({ message: "Student removed successfully" });
  }
);

export const getUserRoleInClassroom = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (classroom.ownerId === userId) {
      return res.status(200).json({ role: "TEACHER" });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId,
      },
    });

    if (!enrollment) {
      return res
        .status(403)
        .json({ message: "User not enrolled in this classroom" });
    }

    return res.status(200).json({ role: enrollment.role });
  }
);

export const getClassroomParticipants = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        owner: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
          },
        },
      },
    });

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const userEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId,
      },
    });

    if (!userEnrollment && classroom.ownerId !== userId) {
      return res
        .status(403)
        .json({ message: "You are not enrolled in this classroom" });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        classroomId,
        role: "STUDENT",
      },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
          },
        },
      },
    });

    const students = enrollments.map((enrollment) => enrollment.user);

    return res.status(200).json({
      teacher: classroom.owner,
      students,
    });
  }
);
