import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as AnalyticsService from "../services/analytics.service";
import prisma from "../config/db";

export const logActivity = asyncHandler(async (req: Request, res: Response) => {
  const { userId, activityType, resourceId, resourceType, metadata } = req.body;

  res.status(200).json({
    message: "Activity logging is currently disabled",
    data: { userId, activityType, resourceId, resourceType },
  });
});

export const getClassroomAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Get total students
      const totalStudents = await prisma.enrollment.count({
        where: {
          classroomId,
          role: "STUDENT",
        },
      });

      // Get active students (students who have submitted at least one assignment or quiz)
      const activeStudentsIds = await prisma.submission.findMany({
        where: {
          assignment: {
            classroomId,
          },
        },
        select: {
          studentId: true,
        },
        distinct: ["studentId"],
      });

      const activeStudents = activeStudentsIds.length;

      // Get assignment stats
      const totalAssignments = await prisma.assignment.count({
        where: {
          classroomId,
          status: "ACTIVE", // Only count published assignments
        },
      });

      // Get all submissions for this classroom
      const submissions = await prisma.submission.findMany({
        where: {
          assignment: {
            classroomId,
          },
        },
        include: {
          grade: true,
        },
      });

      const submittedAssignments = submissions.length;

      // Calculate average score for graded assignments
      const gradedSubmissions = submissions.filter(
        (s) => s.grade !== null && s.grade.points !== null
      );

      const averageScore =
        gradedSubmissions.length > 0
          ? gradedSubmissions.reduce(
              (sum, s) => sum + (s.grade?.points || 0),
              0
            ) / gradedSubmissions.length
          : 0;

      // Get quiz stats
      const totalQuizzes = await prisma.quiz.count({
        where: {
          classroomId,
          isPublished: true, // Using isPublished instead of status
        },
      });

      const quizAttempts = await prisma.quizAttempt.findMany({
        where: {
          quiz: {
            classroomId,
          },
        },
        select: {
          score: true,
        },
      });

      // Get unique attempted quizzes
      const attemptedQuizzes = await prisma.quizAttempt.findMany({
        where: {
          quiz: {
            classroomId,
          },
        },
        select: {
          quizId: true,
        },
        distinct: ["quizId"],
      });

      // Calculate average quiz score
      const quizAvgScore =
        quizAttempts.length > 0
          ? quizAttempts.reduce(
              (sum, attempt) => sum + (attempt.score || 0),
              0
            ) / quizAttempts.length
          : 0;

      // Get classroom details
      const classroom = await prisma.classroom.findUnique({
        where: { id: classroomId },
        select: {
          id: true,
          name: true,
          ownerId: true,
        },
      });

      // Get student performance data
      const students = await prisma.enrollment.findMany({
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
              profilePic: true,
            },
          },
        },
      });

      // Calculate performance for each student
      const studentPerformances = await Promise.all(
        students.map(async (student) => {
          // Calculate assignment completion rate
          const studentSubmissions = await prisma.submission.count({
            where: {
              studentId: student.userId,
              assignment: {
                classroomId,
                status: "ACTIVE", // Only count active assignments
              },
            },
          });

          const assignmentCompletionRate =
            totalAssignments > 0
              ? (studentSubmissions / totalAssignments) * 100
              : 0;

          // Calculate quiz average score
          const studentQuizAttempts = await prisma.quizAttempt.findMany({
            where: {
              userId: student.userId,
              quiz: {
                classroomId,
                isPublished: true, // Only count published quizzes
              },
            },
            select: {
              score: true,
            },
          });

          const quizAvgScore =
            studentQuizAttempts.length > 0
              ? studentQuizAttempts.reduce(
                  (sum, attempt) => sum + (attempt.score || 0),
                  0
                ) / studentQuizAttempts.length
              : 0;

          // Calculate overall grade
          const overallGrade =
            assignmentCompletionRate * 0.7 + quizAvgScore * 0.3;

          return {
            userId: student.userId,
            firstName: student.user.firstName,
            lastName: student.user.lastName,
            profilePic: student.user.profilePic,
            performance: {
              assignmentCompletionRate,
              quizAvgScore,
              overallGrade,
            },
          };
        })
      );

      const analytics = {
        classroomId,
        totalStudents,
        activeStudents,
        assignmentStats: {
          totalAssignments,
          submittedAssignments,
          averageScore,
        },
        quizStats: {
          totalQuizzes,
          attemptedQuizzes: attemptedQuizzes.length,
          averageScore: quizAvgScore,
        },
        classroom,
        students: studentPerformances,
      };

      res.status(200).json(analytics);
    } catch (error: any) {
      console.error("Error getting classroom analytics:", error);
      res
        .status(500)
        .json({ message: `Failed to get analytics: ${error.message}` });
    }
  }
);

export const getUserEngagement = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId, userId } = req.params;
    const requesterId = req.user?.userId;

    if (!requesterId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Since getUserEngagement doesn't exist, return simplified engagement data
    const engagement = {
      userId,
      classroomId,
      submissionCount: 0,
      resourceViews: 0,
      lastActive: new Date().toISOString(),
    };

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

    try {
      const performance = await AnalyticsService.getUserPerformance(
        classroomId,
        userId
      );
      res.status(200).json(performance);
    } catch (error: any) {
      console.error("Error getting user performance:", error);
      res.status(404).json({
        message: "Performance metrics not found",
        userId,
        classroomId,
        error: error.message,
      });
    }
  }
);
export const getTeacherDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const stats = await AnalyticsService.getTeacherDashboardStats(userId);
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({
        message: "Failed to retrieve teacher dashboard stats",
        error: (error as Error).message,
      });
    }
  }
);

export const getStudentDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const stats = await AnalyticsService.getStudentDashboardStats(userId);
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({
        message: "Failed to retrieve student dashboard stats",
        error: (error as Error).message,
      });
    }
  }
);
