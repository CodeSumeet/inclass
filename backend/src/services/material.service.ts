import prisma from "../config/db";
import { MaterialType } from "@prisma/client"; // Import the MaterialType enum

interface CreateMaterialDto {
  title: string;
  description?: string;
  type: MaterialType;
  url: string;
  fileSize?: number;
  fileType?: string;
  classroomId: string;
  createdById: string;
}

export const createMaterial = async (
  createMaterialDto: CreateMaterialDto,
  userId: string
) => {
  const { title, description, type, url, fileSize, fileType, classroomId } =
    createMaterialDto;

  // Verify the user has access to this classroom
  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    include: {
      enrollments: {
        where: { userId },
      },
    },
  });

  if (!classroom) {
    throw new Error("Classroom not found");
  }

  // Check if user is owner or enrolled
  const isOwner = classroom.ownerId === userId;
  const isEnrolled = classroom.enrollments.length > 0;

  if (!isOwner && !isEnrolled) {
    throw new Error(
      "You don't have permission to add materials to this classroom"
    );
  }

  // Create the material
  const material = await prisma.material.create({
    data: {
      title,
      description,
      type,
      url,
      fileSize,
      fileType,
      classroomId,
      createdById: userId,
    },
  });

  return material;
};

export const getClassroomMaterials = async (classroomId: string) => {
  const materials = await prisma.material.findMany({
    where: { classroomId },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        // Ensure this is correctly referenced
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          profilePic: true,
        },
      },
    },
  });

  return materials;
};

export const deleteMaterial = async (materialId: string, userId: string) => {
  // Find the material
  const material = await prisma.material.findUnique({
    where: { id: materialId },
    include: {
      classroom: true,
    },
  });

  if (!material) {
    throw new Error("Material not found");
  }

  // Check if user is the creator of the material or the classroom owner
  if (
    material.createdById !== userId &&
    material.classroom.ownerId !== userId
  ) {
    throw new Error("Unauthorized to delete this material");
  }

  // Delete the material
  return prisma.material.delete({
    where: { id: materialId },
  });
};
