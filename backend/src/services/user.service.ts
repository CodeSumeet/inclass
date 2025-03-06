import prisma from "../config/db";
import {
  User,
  UpdateUserDto,
  UserClassroom,
  UserEnrollment,
} from "../types/user.types";

export const getUserProfile = async (userId: string): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      email: true,
      firstName: true,
      lastName: true,
      profilePic: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: UpdateUserDto
): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { userId },
    data,
    select: {
      userId: true,
      email: true,
      firstName: true,
      lastName: true,
      profilePic: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const getUserClassrooms = async (
  userId: string
): Promise<UserClassroom[]> => {
  const user = await prisma.user.findUnique({
    where: { userId },
    include: {
      classrooms: {
        select: {
          id: true,
          name: true,
          section: true,
          subject: true,
          createdAt: true,
          enrollments: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.classrooms.map((classroom) => ({
    id: classroom.id,
    name: classroom.name,
    section: classroom.section,
    subject: classroom.subject,
    createdAt: classroom.createdAt,
    studentsCount: classroom.enrollments.length,
  }));
};

export const getUserEnrollments = async (
  userId: string
): Promise<UserEnrollment[]> => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      classroom: {
        select: {
          id: true,
          name: true,
          section: true,
          subject: true,
          createdAt: true,
          ownerId: true,
          owner: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return enrollments.map((enrollment) => ({
    id: enrollment.classroom.id,
    name: enrollment.classroom.name,
    section: enrollment.classroom.section,
    subject: enrollment.classroom.subject,
    createdAt: enrollment.classroom.createdAt,
    teacherName: `${enrollment.classroom.owner.firstName} ${enrollment.classroom.owner.lastName}`,
  }));
};
