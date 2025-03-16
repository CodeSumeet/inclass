import prisma from "../config/db";

interface ActivityLogData {
  userId: string;
  activityType: string;
  resourceId?: string;
  resourceType?: string;
  metadata?: any;
}

/**
 * Logs a user activity in the system
 */
export const logActivity = async (data: ActivityLogData) => {
  try {
    return await prisma.activityLog.create({
      data: {
        userId: data.userId,
        activityType: data.activityType,
        resourceId: data.resourceId,
        resourceType: data.resourceType,
        metadata: data.metadata || {},
      },
    });
  } catch (error: any) {
    console.error("Error logging activity:", error);
    // Don't throw error to prevent disrupting the main application flow
    return null;
  }
};

/**
 * Gets analytics for a specific classroom
 */
export const getClassroomAnalytics = async (
  classroomId: string,
  userId: string
) => {
  try {
    // Verify the classroom exists
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    // Check if user is the owner (teacher) or a student in the classroom
    const isTeacher = classroom.ownerId === userId;

    // Check if user is enrolled in the classroom
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: userId,
        classroomId: classroomId,
      },
    });

    const isStudent = !!enrollment;

    if (!isTeacher && !isStudent) {
      throw new Error("Unauthorized to access classroom analytics");
    }

    // Get or create classroom analytics
    let analytics = await prisma.classroomAnalytics.findUnique({
      where: { classroomId },
    });

    if (!analytics) {
      // Calculate analytics data
      const enrollments = await prisma.enrollment.findMany({
        where: { classroomId },
      });

      const studentCount = enrollments.length;

      // Count active students (those with activity in the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const activeStudentIds = await prisma.activityLog.findMany({
        where: {
          resourceId: classroomId,
          resourceType: "classroom",
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          userId: true,
        },
        distinct: ["userId"],
      });

      const activeStudents = activeStudentIds.length;

      // Calculate average engagement score
      // This is a simple metric based on activity count per student
      const activities = await prisma.activityLog.groupBy({
        by: ["userId"],
        where: {
          resourceId: classroomId,
          resourceType: "classroom",
        },
        _count: {
          id: true,
        },
      });

      const totalActivities = activities.reduce(
        (sum, act) => sum + act._count.id,
        0
      );
      const avgEngagementScore =
        studentCount > 0 ? totalActivities / studentCount : 0;

      // Create analytics record
      analytics = await prisma.classroomAnalytics.create({
        data: {
          classroomId,
          totalStudents: studentCount,
          activeStudents,
          avgEngagementScore,
        },
      });
    }

    // Include classroom data for context
    return {
      ...analytics,
      classroom: {
        id: classroom.id,
        name: classroom.name,
        ownerId: classroom.ownerId,
      },
    };
  } catch (error: any) {
    console.error("Error getting classroom analytics:", error);
    throw new Error(`Failed to get classroom analytics: ${error.message}`);
  }
};

/**
 * Gets engagement metrics for a specific user in a classroom
 */
export const getUserEngagement = async (
  classroomId: string,
  userId: string,
  requesterId: string
) => {
  try {
    // Verify the classroom exists
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    // Only the owner (teacher) or the user themselves can view engagement
    if (classroom.ownerId !== requesterId && userId !== requesterId) {
      throw new Error("Unauthorized to access user engagement");
    }

    // Get or create user engagement record
    let engagement = await prisma.userEngagement.findFirst({
      where: {
        userId,
        classroomId,
      },
    });

    if (!engagement) {
      // Calculate engagement metrics from activity logs
      const loginCount = await prisma.activityLog.count({
        where: {
          userId,
          resourceId: classroomId,
          resourceType: "classroom",
          activityType: "LOGIN",
        },
      });

      const resourceViews = await prisma.activityLog.count({
        where: {
          userId,
          resourceId: classroomId,
          resourceType: "classroom",
          activityType: {
            in: ["VIEW_MATERIAL", "VIEW_QUIZ", "VIEW_CLASSROOM"],
          },
        },
      });

      const submissionCount = await prisma.activityLog.count({
        where: {
          userId,
          resourceId: classroomId,
          resourceType: "classroom",
          activityType: {
            in: ["SUBMIT_QUIZ", "assignment_submission"],
          },
        },
      });

      // Get last active timestamp
      const lastActivity = await prisma.activityLog.findFirst({
        where: {
          userId,
          resourceId: classroomId,
          resourceType: "classroom",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const lastActive = lastActivity?.createdAt || new Date();

      // Create engagement record
      engagement = await prisma.userEngagement.create({
        data: {
          userId,
          classroomId,
          loginCount,
          resourceViews,
          submissionCount,
          lastActive,
        },
      });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return {
      ...engagement,
      user,
    };
  } catch (error: any) {
    console.error("Error getting user engagement:", error);
    throw new Error(`Failed to get user engagement: ${error.message}`);
  }
};

/**
 * Gets performance metrics for a specific user in a classroom
 */
export const getUserPerformance = async (
  classroomId: string,
  userId: string,
  requesterId: string
) => {
  try {
    // Verify the classroom exists
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    // Only the owner (teacher) or the user themselves can view performance
    if (classroom.ownerId !== requesterId && userId !== requesterId) {
      throw new Error("Unauthorized to access user performance");
    }

    // Get or create performance metrics
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
          // Filter for completed attempts based on having a score
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

      // Attendance rate (placeholder - implement based on your attendance tracking)
      const attendanceRate = 90; // Default placeholder value

      // Overall grade (weighted average of assignments and quizzes)
      const overallGrade = assignmentCompletionRate * 0.6 + quizAvgScore * 0.4;

      // Create performance record
      performance = await prisma.performanceMetric.create({
        data: {
          userId,
          classroomId,
          assignmentCompletionRate,
          quizAvgScore,
          attendanceRate,
          overallGrade,
        },
      });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return {
      ...performance,
      user,
    };
  } catch (error: any) {
    console.error("Error getting user performance:", error);
    throw new Error(`Failed to get user performance: ${error.message}`);
  }
};

/**
 * Gets dashboard statistics for a teacher
 */
export const getTeacherDashboardStats = async (userId: string) => {
  try {
    // Get classrooms where user is the owner (teacher)
    const classrooms = await prisma.classroom.findMany({
      where: { ownerId: userId },
    });

    if (classrooms.length === 0) {
      throw new Error("No classrooms found for this teacher");
    }

    const classroomIds = classrooms.map((c) => c.id);

    // Get total students across all classrooms
    const totalStudents = await prisma.enrollment.count({
      where: {
        classroomId: {
          in: classroomIds,
        },
      },
    });

    // Get recent activities
    const recentActivities = await prisma.activityLog.findMany({
      where: {
        resourceId: {
          in: classroomIds,
        },
        resourceType: "classroom",
      },
      include: {
        user: {
          select: {
            userId: true,
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
    const classroomAnalytics = await prisma.classroomAnalytics.findMany({
      where: {
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

        const classroom = classrooms.find((c) => c.id === classroomId);

        return {
          classroomId,
          classroomName: classroom?.name,
          totalAssignments: assignments,
          totalSubmissions: submissions,
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

/**
 * Gets dashboard statistics for a student
 */
export const getStudentDashboardStats = async (userId: string) => {
  try {
    // Get classrooms where user is enrolled
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        classroom: true,
      },
    });

    if (enrollments.length === 0) {
      throw new Error("No enrollments found for this student");
    }

    const classroomIds = enrollments.map((e) => e.classroomId);

    // Get performance metrics
    const performanceMetrics = await prisma.performanceMetric.findMany({
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

        // Create performance record
        await prisma.performanceMetric.create({
          data: {
            userId,
            classroomId: enrollment.classroomId,
            assignmentCompletionRate,
            quizAvgScore: 0, // Default until quiz data is available
            attendanceRate: 100, // Default
            overallGrade: assignmentCompletionRate, // Default to assignment completion for now
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
    const now = new Date();
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

/**
 * Updates analytics data for a classroom
 * This can be called periodically to refresh analytics
 */
export const updateClassroomAnalytics = async (classroomId: string) => {
  try {
    // Calculate analytics data
    const enrollments = await prisma.enrollment.findMany({
      where: { classroomId },
    });

    const studentCount = enrollments.length;

    // Count active students (those with activity in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeStudentIds = await prisma.activityLog.findMany({
      where: {
        resourceId: classroomId,
        resourceType: "classroom",
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });

    const activeStudents = activeStudentIds.length;

    // Calculate average engagement score
    const activities = await prisma.activityLog.groupBy({
      by: ["userId"],
      where: {
        resourceId: classroomId,
        resourceType: "classroom",
      },
      _count: {
        id: true,
      },
    });

    const totalActivities = activities.reduce(
      (sum, act) => sum + act._count.id,
      0
    );
    const avgEngagementScore =
      studentCount > 0 ? totalActivities / studentCount : 0;

    // Update or create analytics record
    return await prisma.classroomAnalytics.upsert({
      where: { classroomId },
      update: {
        totalStudents: studentCount,
        activeStudents,
        avgEngagementScore,
        lastUpdated: new Date(),
      },
      create: {
        classroomId,
        totalStudents: studentCount,
        activeStudents,
        avgEngagementScore,
      },
    });
  } catch (error: any) {
    console.error("Error updating classroom analytics:", error);
    throw new Error(`Failed to update classroom analytics: ${error.message}`);
  }
};
