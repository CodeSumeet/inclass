import prisma from "../config/db";

export const getUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      firstName: true,
      lastName: true,
      email: true,
      profilePic: true,
    },
  });
};

export const updateUser = async (userId: string, data: any) => {
  return prisma.user.update({
    where: { userId },
    data,
  });
};

export const getUserEnrollments = async (userId: string) => {
  return prisma.enrollment.findMany({
    where: { userId },
    include: { classroom: true },
  });
};
