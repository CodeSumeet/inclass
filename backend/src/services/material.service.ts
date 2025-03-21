import prisma from "../config/db";
import { sendMaterialEmail } from "./email.service";

interface CreateMaterialDto {
  title: string;
  description?: string;
  type: string;
  url: string;
  fileSize?: number;
  fileType?: string;
  classroomId: string;
}

export const createMaterial = async (
  createMaterialDto: CreateMaterialDto,
  userId: string
) => {
  const { title, description, type, url, fileSize, fileType, classroomId } =
    createMaterialDto;

  try {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new Error("Classroom not found");
    }

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

    const material = await prisma.material.create({
      data: {
        title,
        description,
        type,
        url,
        fileSize: fileSize || undefined,
        fileType: fileType || undefined,
        classroomId,
        createdById: userId,
      },
    });

    sendMaterialEmail(
      classroomId,
      material.id,
      title,
      description || "",
      type,
      {
        firstName: user.firstName,
        lastName: user.lastName,
      }
    ).catch((err) => console.error("Failed to send material emails:", err));

    return material;
  } catch (error) {
    console.error("Error creating material:", error);
    throw error;
  }
};

export const getClassroomMaterials = async (classroomId: string) => {
  const materials = await prisma.material.findMany({
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
    },
  });

  return materials;
};

export const deleteMaterial = async (materialId: string, userId: string) => {
  const material = await prisma.material.findUnique({
    where: { id: materialId },
    include: {
      classroom: true,
    },
  });

  if (!material) {
    throw new Error("Material not found");
  }

  if (
    material.createdById !== userId &&
    material.classroom.ownerId !== userId
  ) {
    throw new Error("Unauthorized to delete this material");
  }

  return prisma.material.delete({
    where: { id: materialId },
  });
};
