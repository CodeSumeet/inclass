import prisma from "../config/db";

export const getUserPerformance = async (
  classroomId: string,
  userId: string
) => {
  try {
    // Check if user is enrolled in the classroom
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId,
      },
    });

    if (!enrollment) {
      throw new Error("User is not enrolled in this classroom");
    }

    // Get existing performance metrics or create new ones
    let performance = await prisma.performanceMetric.findFirst({
      where: {
        userId,
        classroomId,
      },
    });

    if (!performance) {
      // Calculate performance metrics
      // Assignment completion rate
      const assignments = await prisma.assignment.count({
        where: { classroomId },
      });

      const completedAssignments = await prisma.submission.count({
        where: {
          studentId: userId,
          assignment: {
            classroomId,
          },
          status: {
            in: ["TURNED_IN", "GRADED", "RETURNED", "SUBMITTED"],
          },
        },
      });

      const assignmentCompletionRate =
        assignments > 0 ? (completedAssignments / assignments) * 100 : 0;

      // Quiz average score
      const quizAttempts = await prisma.quizAttempt.findMany({
        where: {
          userId,
          quiz: {
            classroomId,
          },
          score: {
            not: null,
          },
        },
        select: {
          score: true,
        },
      });

      const quizAvgScore =
        quizAttempts.length > 0
          ? quizAttempts.reduce(
              (sum, attempt) => sum + (attempt.score || 0),
              0
            ) / quizAttempts.length
          : 0;

      // Overall grade (weighted average of assignments and quizzes)
      const overallGrade = assignmentCompletionRate * 0.7 + quizAvgScore * 0.3;

      // Create performance record
      performance = await prisma.performanceMetric.create({
        data: {
          userId,
          classroomId,
          assignmentCompletionRate,
          quizAvgScore,
          overallGrade,
          attendanceRate: 0, // Set to 0 since we're not tracking attendance
        },
      });
    }

    return performance;
  } catch (error: any) {
    console.error("Error getting user performance:", error);
    throw new Error(`Failed to get user performance: ${error.message}`);
  }
};

export const getTeacherDashboardStats = async (userId: string) => {
  try {
    // Get classrooms where user is a teacher
    const classrooms = await prisma.classroom.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            enrollments: {
              some: {
                userId,
                role: "TEACHER",
              },
            },
          },
        ],
      },
    });

    const classroomIds = classrooms.map((classroom) => classroom.id);

    // Get total students across all classrooms
    const totalStudents = await prisma.enrollment.count({
      where: {
        classroomId: {
          in: classroomIds,
        },
        role: "STUDENT",
      },
    });

    // Get recent activities - removing the classroomId filter since it's not in the schema
    const recentActivities = await prisma.activityLog.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Get classroom analytics
    const classroomAnalytics = await Promise.all(
      classroomIds.map(async (classroomId) => {
        const students = await prisma.enrollment.count({
          where: {
            classroomId,
            role: "STUDENT",
          },
        });

        const assignments = await prisma.assignment.count({
          where: { classroomId },
        });

        const quizzes = await prisma.quiz.count({
          where: { classroomId },
        });

        const classroom = classrooms.find((c) => c.id === classroomId);

        return {
          classroomId,
          classroomName: classroom?.name,
          students,
          assignments,
          quizzes,
        };
      })
    );

    // Get assignment submission stats
    const assignmentStats = await Promise.all(
      classroomIds.map(async (classroomId) => {
        const assignments = await prisma.assignment.count({
          where: { classroomId },
        });

        const submissions = await prisma.submission.count({
          where: {
            assignment: {
              classroomId,
            },
          },
        });

        const gradedSubmissions = await prisma.submission.count({
          where: {
            assignment: {
              classroomId,
            },
            status: "GRADED",
          },
        });

        const classroom = classrooms.find((c) => c.id === classroomId);

        return {
          classroomId,
          classroomName: classroom?.name,
          totalAssignments: assignments,
          totalSubmissions: submissions,
          gradedSubmissions,
          submissionRate: assignments > 0 ? submissions / assignments : 0,
        };
      })
    );

    return {
      totalClassrooms: classrooms.length,
      totalStudents,
      recentActivities,
      classroomAnalytics,
      assignmentStats,
    };
  } catch (error: any) {
    console.error("Error getting teacher dashboard stats:", error);
    throw new Error(`Failed to get teacher dashboard stats: ${error.message}`);
  }
};

export const getStudentDashboardStats = async (userId: string) => {
  try {
    const now = new Date();

    // Get classrooms where user is enrolled as a student
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        role: "STUDENT",
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const classroomIds = enrollments.map((e) => e.classroomId);

    // Get performance metrics for each classroom
    let performanceMetrics = await prisma.performanceMetric.findMany({
      where: {
        userId,
        classroomId: {
          in: classroomIds,
        },
      },
      include: {
        classroom: {
          select: {
            name: true,
          },
        },
      },
    }); // <-- This closing bracket was missing

    // If no performance metrics exist, create them
    if (performanceMetrics.length === 0) {
      for (const enrollment of enrollments) {
        // Calculate basic metrics for each classroom
        const assignments = await prisma.assignment.count({
          where: { classroomId: enrollment.classroomId },
        });

        const completedAssignments = await prisma.submission.count({
          where: {
            studentId: userId,
            assignment: {
              classroomId: enrollment.classroomId,
            },
            status: {
              in: ["TURNED_IN", "GRADED", "RETURNED", "SUBMITTED"],
            },
          },
        });

        const assignmentCompletionRate =
          assignments > 0 ? (completedAssignments / assignments) * 100 : 0;

        // Get quiz scores
        const quizAttempts = await prisma.quizAttempt.findMany({
          where: {
            userId,
            quiz: {
              classroomId: enrollment.classroomId,
            },
            score: {
              not: null,
            },
          },
          select: {
            score: true,
          },
        });

        const quizAvgScore =
          quizAttempts.length > 0
            ? quizAttempts.reduce(
                (sum, attempt) => sum + (attempt.score || 0),
                0
              ) / quizAttempts.length
            : 0;

        // Overall grade (weighted average of assignments and quizzes)
        const overallGrade =
          assignmentCompletionRate * 0.7 + quizAvgScore * 0.3;

        // Create performance record
        await prisma.performanceMetric.create({
          data: {
            userId,
            classroomId: enrollment.classroomId,
            assignmentCompletionRate,
            quizAvgScore,
            attendanceRate: 0, // Not tracking attendance
            overallGrade,
          },
        });
      }

      // Fetch the newly created metrics
      const newPerformanceMetrics = await prisma.performanceMetric.findMany({
        where: {
          userId,
          classroomId: {
            in: classroomIds,
          },
        },
        include: {
          classroom: {
            select: {
              name: true,
            },
          },
        },
      });

      performanceMetrics.push(...newPerformanceMetrics);
    }

    // Get recent activities
    const recentActivities = await prisma.activityLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Get upcoming assignments
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        classroomId: {
          in: classroomIds,
        },
        dueDate: {
          gte: now,
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 5,
      include: {
        classroom: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      totalClassrooms: enrollments.length,
      performanceMetrics,
      recentActivities,
      upcomingAssignments,
      enrollments: enrollments.map((e) => ({
        classroomId: e.classroomId,
        classroomName: e.classroom.name,
      })),
    };
  } catch (error: any) {
    console.error("Error getting student dashboard stats:", error);
    throw new Error(`Failed to get student dashboard stats: ${error.message}`);
  }
};
