import prisma from "../config/db";
import { sendAnnouncementEmail } from "./email.service";

export const createAnnouncement = async (
  classroomId: string,
  createdById: string,
  content: string
) => {
  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId, isDeleted: false },
  });

  if (!classroom) {
    throw new Error("Classroom not found");
  }

  const user = await prisma.user.findUnique({
    where: { userId: createdById },
    select: {
      firstName: true,
      lastName: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const announcement = await prisma.announcement.create({
    data: {
      content,
      classroomId,
      createdById,
    },
    include: {
      createdBy: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          profilePic: true,
        },
      },
    },
  });

  sendAnnouncementEmail(classroomId, content, {
    firstName: user.firstName,
    lastName: user.lastName,
  }).catch((err) => console.error("Failed to send announcement emails:", err));

  return {
    id: announcement.id,
    content: announcement.content,
    createdAt: announcement.createdAt,
    author: {
      id: announcement.createdBy.userId,
      name: `${announcement.createdBy.firstName} ${announcement.createdBy.lastName}`,
      avatar: announcement.createdBy.profilePic || "/placeholder-avatar.png",
    },
  };
};

export const getClassroomAnnouncements = async (classroomId: string) => {
  const announcements = await prisma.announcement.findMany({
    where: { classroomId },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          profilePic: true,
        },
      },
      comments: {
        include: {
          createdBy: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              profilePic: true,
            },
          },
        },
      },
    },
  });

  return announcements.map((announcement) => ({
    id: announcement.id,
    content: announcement.content,
    createdAt: announcement.createdAt,
    author: {
      id: announcement.createdBy.userId,
      name: `${announcement.createdBy.firstName} ${announcement.createdBy.lastName}`,
      avatar: announcement.createdBy.profilePic || "/placeholder-avatar.png",
    },
    comments: announcement.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: {
        id: comment.createdBy.userId,
        name: `${comment.createdBy.firstName} ${comment.createdBy.lastName}`,
        avatar: comment.createdBy.profilePic || "/placeholder-avatar.png",
      },
    })),
  }));
};

export const deleteAnnouncement = async (
  announcementId: string,
  userId: string
) => {
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    include: {
      classroom: true,
    },
  });

  if (!announcement) {
    throw new Error("Announcement not found");
  }

  if (
    announcement.createdById !== userId &&
    announcement.classroom.ownerId !== userId
  ) {
    throw new Error("Unauthorized to delete this announcement");
  }

  return prisma.announcement.delete({
    where: { id: announcementId },
  });
};
