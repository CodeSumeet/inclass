import nodemailer from "nodemailer";
import prisma from "../config/db";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const getClassroomStudentEmails = async (classroomId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      classroomId,
      role: "STUDENT",
    },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return enrollments.map((enrollment) => ({
    email: enrollment.user.email,
    name: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
  }));
};

export const sendAnnouncementEmail = async (
  classroomId: string,
  content: string,
  createdBy: { firstName: string; lastName: string }
) => {
  try {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    const students = await getClassroomStudentEmails(classroomId);

    for (const student of students) {
      await transporter.sendMail({
        from: `"Inclass" <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: `New Announcement in ${classroom.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Announcement in ${classroom.name}</h2>
            <p>Hello ${student.name},</p>
            <p>${createdBy.firstName} ${createdBy.lastName} has posted a new announcement:</p>
            <div style="padding: 15px; background-color: #f5f5f5; border-left: 4px solid #3b82f6; margin: 15px 0;">
              ${content}
            </div>
            <p>View the full announcement and discussion in your classroom.</p>
            <p><a href="${process.env.FRONTEND_URL}/classroom/${classroomId}/stream" style="background-color: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Go to Classroom</a></p>
          </div>
        `,
      });
    }

    return { success: true, emailsSent: students.length };
  } catch (error: any) {
    console.error("Error sending announcement emails:", error);
    return { success: false, error: error.message };
  }
};

export const sendAssignmentEmail = async (
  classroomId: string,
  assignmentId: string,
  title: string,
  description: string,
  dueDate: Date | null,
  createdBy: { firstName: string; lastName: string }
) => {
  try {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    const students = await getClassroomStudentEmails(classroomId);

    const formattedDueDate = dueDate
      ? new Date(dueDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "No due date";

    for (const student of students) {
      await transporter.sendMail({
        from: `"Inclass" <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: `New Assignment: ${title} - ${classroom.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Assignment in ${classroom.name}</h2>
            <p>Hello ${student.name},</p>
            <p>${createdBy.firstName} ${createdBy.lastName} has posted a new assignment:</p>
            <div style="padding: 15px; background-color: #f5f5f5; border-left: 4px solid #3b82f6; margin: 15px 0;">
              <h3>${title}</h3>
              <p>${description}</p>
              <p><strong>Due Date:</strong> ${formattedDueDate}</p>
            </div>
            <p>Please submit your work before the deadline.</p>
            <p><a href="${process.env.FRONTEND_URL}/classroom/${classroomId}/assignment/${assignmentId}" style="background-color: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">View Assignment</a></p>
          </div>
        `,
      });
    }

    return { success: true, emailsSent: students.length };
  } catch (error: any) {
    console.error("Error sending assignment emails:", error);
    return { success: false, error: error.message };
  }
};

export const sendQuizEmail = async (
  classroomId: string,
  quizId: string,
  title: string,
  description: string,
  dueDate: Date | null,
  createdBy: { firstName: string; lastName: string }
) => {
  try {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    const students = await getClassroomStudentEmails(classroomId);

    const formattedDueDate = dueDate
      ? new Date(dueDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "No due date";

    for (const student of students) {
      await transporter.sendMail({
        from: `"Inclass" <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: `New Quiz: ${title} - ${classroom.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Quiz in ${classroom.name}</h2>
            <p>Hello ${student.name},</p>
            <p>${createdBy.firstName} ${createdBy.lastName} has posted a new quiz:</p>
            <div style="padding: 15px; background-color: #f5f5f5; border-left: 4px solid #3b82f6; margin: 15px 0;">
              <h3>${title}</h3>
              <p>${description}</p>
              <p><strong>Due Date:</strong> ${formattedDueDate}</p>
            </div>
            <p>Please complete the quiz before the deadline.</p>
            <p><a href="${process.env.FRONTEND_URL}/classroom/${classroomId}/quiz/${quizId}" style="background-color: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Take Quiz</a></p>
          </div>
        `,
      });
    }

    return { success: true, emailsSent: students.length };
  } catch (error: any) {
    console.error("Error sending quiz emails:", error);
    return { success: false, error: error.message };
  }
};

export const sendMaterialEmail = async (
  classroomId: string,
  materialId: string,
  title: string,
  description: string,
  type: string,
  createdBy: { firstName: string; lastName: string }
) => {
  try {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    const students = await getClassroomStudentEmails(classroomId);

    for (const student of students) {
      await transporter.sendMail({
        from: `"Inclass" <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: `New Material: ${title} - ${classroom.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Material in ${classroom.name}</h2>
            <p>Hello ${student.name},</p>
            <p>${createdBy.firstName} ${
          createdBy.lastName
        } has uploaded a new material:</p>
            <div style="padding: 15px; background-color: #f5f5f5; border-left: 4px solid #3b82f6; margin: 15px 0;">
              <h3>${title}</h3>
              ${description ? `<p>${description}</p>` : ""}
              <p><strong>Type:</strong> ${type}</p>
            </div>
            <p><a href="${
              process.env.FRONTEND_URL
            }/classroom/${classroomId}/materials" style="background-color: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">View Material</a></p>
          </div>
        `,
      });
    }

    return { success: true, emailsSent: students.length };
  } catch (error: any) {
    console.error("Error sending material emails:", error);
    return { success: false, error: error.message };
  }
};

export const sendMeetingStartedEmail = async (
  classroomId: string,
  meetingId: string,
  createdBy: { firstName: string; lastName: string }
) => {
  try {
    // Get classroom details
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    // Get all student emails
    const students = await getClassroomStudentEmails(classroomId);

    // Send email to each student
    for (const student of students) {
      await transporter.sendMail({
        from: `"Inclass" <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: `Live Meeting Started - ${classroom.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Live Meeting Started in ${classroom.name}</h2>
            <p>Hello ${student.name},</p>
            <p>${createdBy.firstName} ${createdBy.lastName} has started a live meeting.</p>
            <div style="padding: 15px; background-color: #f5f5f5; border-left: 4px solid #3b82f6; margin: 15px 0;">
              <p>Join now to participate in the live discussion!</p>
            </div>
            <p><a href="${process.env.FRONTEND_URL}/meeting/${meetingId}" style="background-color: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Join Meeting</a></p>
          </div>
        `,
      });
    }

    return { success: true, emailsSent: students.length };
  } catch (error: any) {
    console.error("Error sending meeting emails:", error);
    return { success: false, error: error.message };
  }
};
