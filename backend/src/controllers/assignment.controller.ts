import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as AssignmentService from "../services/assignment.service";

// Assignment Controllers
export const getClassroomAssignments = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId } = req.params;
    const assignments = await AssignmentService.getClassroomAssignments(
      classroomId
    );
    res.status(200).json(assignments);
  }
);

export const getAssignment = asyncHandler(
  async (req: Request, res: Response) => {
    const { assignmentId } = req.params;
    const assignment = await AssignmentService.getAssignment(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json(assignment);
  }
);

export const createAssignment = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      description,
      instructions,
      points,
      dueDate,
      topicId,
      classroomId,
      status,
      attachments,
    } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const assignment = await AssignmentService.createAssignment(userId, {
      title,
      description: description || "",
      instructions: instructions || "",
      points: points ? Number(points) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      topicId,
      classroomId,
      status,
      attachments,
    });

    res.status(201).json(assignment);
  }
);

export const updateAssignment = asyncHandler(
  async (req: Request, res: Response) => {
    const { assignmentId } = req.params;
    const {
      title,
      description,
      instructions,
      points,
      dueDate,
      topicId,
      status,
      attachments,
    } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const assignment = await AssignmentService.updateAssignment(
      userId,
      assignmentId,
      {
        title,
        description,
        instructions,
        points: points ? Number(points) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        topicId,
        status,
        attachments,
      }
    );

    res.status(200).json(assignment);
  }
);

export const deleteAssignment = asyncHandler(
  async (req: Request, res: Response) => {
    const { assignmentId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await AssignmentService.deleteAssignment(
      userId,
      assignmentId
    );
    res.status(200).json(result);
  }
);

export const addAssignmentAttachment = asyncHandler(
  async (req: Request, res: Response) => {
    const { assignmentId } = req.params;
    const { url, fileName, fileType, fileSize } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const attachment = await AssignmentService.addAssignmentAttachment(
      userId,
      assignmentId,
      {
        url,
        fileName,
        fileType,
        fileSize: Number(fileSize),
      }
    );

    res.status(201).json(attachment);
  }
);

// Submission Controllers
export const getAssignmentSubmissions = asyncHandler(
  async (req: Request, res: Response) => {
    const { assignmentId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const submissions = await AssignmentService.getAssignmentSubmissions(
      userId,
      assignmentId
    );
    res.status(200).json(submissions);
  }
);

export const getStudentSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    const { assignmentId, studentId } = req.params;
    const submission = await AssignmentService.getStudentSubmission(
      assignmentId,
      studentId
    );

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.status(200).json(submission);
  }
);

export const createSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    const { assignmentId, comment } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const submission = await AssignmentService.createSubmission(
      userId,
      assignmentId,
      comment
    );
    res.status(201).json(submission);
  }
);

export const addSubmissionAttachment = asyncHandler(
  async (req: Request, res: Response) => {
    const { submissionId } = req.params;
    const { url, fileName, fileType, fileSize } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const submission = await AssignmentService.addSubmissionAttachment(
      userId,
      submissionId,
      {
        url,
        fileName,
        fileType,
        fileSize: Number(fileSize),
      }
    );

    res.status(200).json(submission);
  }
);

export const gradeSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    const { submissionId } = req.params;
    const { points, feedback } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const submission = await AssignmentService.gradeSubmission(
      userId,
      submissionId,
      Number(points),
      feedback
    );

    res.status(200).json(submission);
  }
);
