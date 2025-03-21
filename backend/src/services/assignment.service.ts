import prisma from "../config/db";
import { SubmissionStatus } from "../types/assignment.types";
import { sendAssignmentEmail } from "./email.service";

// Assignment Services
export const getClassroomAssignments = async (classroomId: string) => {
  return prisma.assignment.findMany({
    where: {
      classroomId,
    },
    include: {
      attachments: true,
      topic: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getAssignment = async (assignmentId: string) => {
  return prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      attachments: true,
      topic: true,
    },
  });
};

export const createAssignment = async (
  userId: string,
  data: {
    title: string;
    description: string;
    instructions: string;
    points?: number;
    dueDate?: Date;
    topicId?: string;
    classroomId: string;
    status?: string;
    attachments?: Array<{
      url: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    }>;
  }
) => {
  // Check if user is the owner of the classroom
  const classroom = await prisma.classroom.findUnique({
    where: { id: data.classroomId },
  });

  if (!classroom) {
    throw new Error("Classroom not found");
  }

  // Get user details for email
  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      firstName: true,
      lastName: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (classroom.ownerId !== userId) {
    // Check if user is a teacher in the classroom
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: data.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can create assignments");
    }
  }

  // Use a transaction to ensure both assignment and attachments are created together
  const assignment = await prisma.$transaction(async (tx) => {
    // Create the assignment
    const assignment = await tx.assignment.create({
      data: {
        title: data.title,
        description: data.description || "",
        instructions: data.instructions || "",
        points: data.points,
        dueDate: data.dueDate,
        topicId: data.topicId,
        classroomId: data.classroomId,
        status: data.status || "ACTIVE",
      },
    });

    // Add attachments if provided
    if (data.attachments && data.attachments.length > 0) {
      await Promise.all(
        data.attachments.map((attachment) =>
          tx.assignmentAttachment.create({
            data: {
              assignmentId: assignment.id,
              url: attachment.url,
              fileName: attachment.fileName,
              fileType: attachment.fileType,
              fileSize: attachment.fileSize,
            },
          })
        )
      );
    }

    // Return the assignment with attachments
    return tx.assignment.findUnique({
      where: { id: assignment.id },
      include: {
        attachments: true,
      },
    });
  });

  // Only send emails if the assignment is active
  if (assignment && assignment.status === "ACTIVE") {
    // Send email notifications to students
    sendAssignmentEmail(
      data.classroomId,
      assignment.id,
      data.title,
      data.description,
      data.dueDate || null,
      { firstName: user.firstName, lastName: user.lastName }
    ).catch((err) => console.error("Failed to send assignment emails:", err));
  }

  return assignment;
};

export const updateAssignment = async (
  userId: string,
  assignmentId: string,
  data: {
    title?: string;
    description?: string;
    instructions?: string;
    points?: number;
    dueDate?: Date;
    topicId?: string;
    status?: string;
    attachments?: Array<{
      url: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    }>;
  }
) => {
  // Check if assignment exists
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      classroom: true,
    },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // Check if user is the owner of the classroom
  if (assignment.classroom.ownerId !== userId) {
    // Check if user is a teacher in the classroom
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: assignment.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can update assignments");
    }
  }

  // Update the assignment
  const updatedAssignment = await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      points: data.points,
      dueDate: data.dueDate,
      topicId: data.topicId,
      status: data.status,
    },
    include: {
      attachments: true,
    },
  });

  // If new attachments are provided, add them
  if (data.attachments && data.attachments.length > 0) {
    await Promise.all(
      data.attachments.map((attachment) =>
        prisma.assignmentAttachment.create({
          data: {
            assignmentId,
            url: attachment.url,
            fileName: attachment.fileName,
            fileType: attachment.fileType,
            fileSize: attachment.fileSize,
          },
        })
      )
    );

    // Fetch the updated assignment with new attachments
    return prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        attachments: true,
      },
    });
  }

  return updatedAssignment;
};

export const deleteAssignment = async (
  userId: string,
  assignmentId: string
) => {
  // Check if assignment exists
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      classroom: true,
    },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // Check if user is the owner of the classroom
  if (assignment.classroom.ownerId !== userId) {
    // Check if user is a teacher in the classroom
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: assignment.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can delete assignments");
    }
  }

  // Delete the assignment
  await prisma.assignment.delete({
    where: { id: assignmentId },
  });

  return { message: "Assignment deleted successfully" };
};

export const addAssignmentAttachment = async (
  userId: string,
  assignmentId: string,
  attachment: {
    url: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }
) => {
  // Check if assignment exists
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      classroom: true,
    },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // Check if user is the owner of the classroom
  if (assignment.classroom.ownerId !== userId) {
    // Check if user is a teacher in the classroom
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: assignment.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can add attachments to assignments");
    }
  }

  // Add the attachment
  return prisma.assignmentAttachment.create({
    data: {
      assignmentId,
      url: attachment.url,
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
    },
  });
};

// Submission Services
export const getAssignmentSubmissions = async (
  userId: string,
  assignmentId: string
) => {
  // Check if assignment exists
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      classroom: true,
    },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // Check if user is the owner of the classroom
  if (assignment.classroom.ownerId !== userId) {
    // Check if user is a teacher in the classroom
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: assignment.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can view all submissions");
    }
  }

  // Get all submissions for this assignment
  return prisma.submission.findMany({
    where: {
      assignmentId,
    },
    include: {
      student: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          profilePic: true,
        },
      },
      attachments: true,
      grade: true,
    },
    orderBy: {
      submissionDate: "desc",
    },
  });
};

export const getStudentSubmission = async (
  assignmentId: string,
  studentId: string
) => {
  return prisma.submission.findFirst({
    where: {
      assignmentId,
      studentId,
    },
    include: {
      attachments: true,
      grade: true,
    },
  });
};

export const createSubmission = async (
  userId: string,
  assignmentId: string,
  comment?: string
) => {
  // Check if assignment exists
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      classroom: true,
    },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // Check if user is enrolled in the classroom
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      classroomId: assignment.classroomId,
    },
  });

  if (!enrollment) {
    throw new Error("You are not enrolled in this classroom");
  }

  // Check if assignment is still accepting submissions
  if (assignment.status === "CLOSED") {
    throw new Error("Assignment is closed for submissions");
  }

  // Check if student already submitted
  const existingSubmission = await prisma.submission.findFirst({
    where: {
      assignmentId,
      studentId: userId,
    },
  });

  if (existingSubmission) {
    throw new Error("You have already submitted this assignment");
  }

  // Determine if submission is late
  const isLate = assignment.dueDate ? new Date() > assignment.dueDate : false;
  const status = isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED;

  // Create the submission
  return prisma.submission.create({
    data: {
      assignmentId,
      studentId: userId,
      comment,
      status,
      submissionDate: new Date(),
    },
    include: {
      attachments: true,
    },
  });
};

export const addSubmissionAttachment = async (
  userId: string,
  submissionId: string,
  attachment: {
    url: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }
) => {
  // Check if submission exists
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  // Check if user is the owner of the submission
  if (submission.studentId !== userId) {
    throw new Error("You can only add attachments to your own submissions");
  }

  // Add the attachment
  await prisma.submissionAttachment.create({
    data: {
      submissionId,
      url: attachment.url,
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
    },
  });

  // Return the updated submission
  return prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      attachments: true,
      grade: true,
    },
  });
};

export const gradeSubmission = async (
  userId: string,
  submissionId: string,
  points: number,
  feedback?: string
) => {
  // Check if submission exists
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: {
        include: {
          classroom: true,
        },
      },
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  // Check if user is the owner of the classroom
  if (submission.assignment.classroom.ownerId !== userId) {
    // Check if user is a teacher in the classroom
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: submission.assignment.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can grade submissions");
    }
  }

  // Check if points are valid
  if (
    points < 0 ||
    (submission.assignment.points && points > submission.assignment.points)
  ) {
    throw new Error(
      `Points must be between 0 and ${submission.assignment.points || 100}`
    );
  }

  // Create or update the grade
  const existingGrade = await prisma.grade.findUnique({
    where: { submissionId },
  });

  if (existingGrade) {
    await prisma.grade.update({
      where: { submissionId },
      data: {
        points,
        feedback,
        gradedAt: new Date(),
        gradedById: userId,
      },
    });
  } else {
    await prisma.grade.create({
      data: {
        submissionId,
        points,
        feedback,
        gradedAt: new Date(),
        gradedById: userId,
      },
    });

    // Update submission status to GRADED
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: SubmissionStatus.GRADED,
      },
    });
  }

  // Return the updated submission with grade
  return prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      student: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          profilePic: true,
        },
      },
      attachments: true,
      grade: {
        include: {
          gradedBy: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
};
