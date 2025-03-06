import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as ClassroomService from "../services/classroom.service";

export const createClassroom = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, name, section, subject, roomNo, description, coverImage } =
      req.body; // Include coverImage
    const classroom = await ClassroomService.createClassroom(
      userId,
      name,
      section,
      subject,
      roomNo,
      description,
      coverImage // Pass coverImage to the service
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
