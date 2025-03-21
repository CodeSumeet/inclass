import { PrismaClient } from "@prisma/client";
import { generateClassroomCode } from "../utils/generateCode";

const prisma = new PrismaClient();

export const createClassroom = async (
  userId: string,
  name: string,
  section?: string,
  subject?: string,
  roomNo?: string,
  description?: string,
  coverImage?: string
) => {
  let code: string = "";
  let isUnique = false;

  while (!isUnique) {
    code = generateClassroomCode();
    const existingClass = await prisma.classroom.findUnique({
      where: { code },
    });
    if (!existingClass) isUnique = true;
  }

  return prisma.classroom.create({
    data: {
      name,
      section,
      subject,
      roomNo,
      description,
      coverImage,
      code,
      ownerId: userId,
    },
  });
};

export const joinClassroom = async (userId: string, code: string) => {
  const classroom = await prisma.classroom.findUnique({ where: { code } });
  if (!classroom) throw new Error("Classroom not found");

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_classroomId: { userId, classroomId: classroom.id } },
  });
  if (existingEnrollment)
    throw new Error("User already enrolled in this classroom");

  console.log("User Id: ", userId);

  return prisma.enrollment.create({
    data: { userId, classroomId: classroom.id, role: "STUDENT" },
  });
};

export const getUserClassrooms = async (userId: string) => {
  const ownedClassrooms = await prisma.classroom.findMany({
    where: { ownerId: userId },
    include: {
      enrollments: true,
    },
  });

  const enrolledClassrooms = await prisma.enrollment.findMany({
    where: { userId: userId },
    include: {
      classroom: true,
    },
  });

  const allClassrooms = [
    ...ownedClassrooms,
    ...enrolledClassrooms.map((enrollment) => enrollment.classroom),
  ];

  return allClassrooms;
};

export const getClassroomDetails = async (classroomId: string) => {
  return prisma.classroom.findUnique({
    where: { id: classroomId, isDeleted: false },
    include: { enrollments: true },
  });
};

export const deleteClassroom = async (classroomId: string, userId: string) => {
  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
  });
  if (!classroom) throw new Error("Classroom not found");
  if (classroom.ownerId !== userId)
    throw new Error("Unauthorized: Only the owner can delete this classroom");

  return prisma.classroom.update({
    where: { id: classroomId },
    data: { isDeleted: true },
  });
};

export const removeStudent = async (
  ownerId: string,
  classroomId: string,
  studentId: string
) => {
  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
  });
  if (!classroom) throw new Error("Classroom not found");

  if (classroom.ownerId !== ownerId)
    throw new Error("Unauthorized: Only the owner can remove students");

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_classroomId: { userId: studentId, classroomId } },
  });

  if (!enrollment) throw new Error("Student is not enrolled in this classroom");

  return prisma.enrollment.delete({
    where: { userId_classroomId: { userId: studentId, classroomId } },
  });
};
