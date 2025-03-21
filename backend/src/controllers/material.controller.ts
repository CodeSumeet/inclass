import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as MaterialService from "../services/material.service";

export const createMaterial = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId } = req.params;
    const { title, description, type, url, fileSize, fileType } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const material = await MaterialService.createMaterial(
      {
        title,
        description,
        type,
        url,
        fileSize,
        fileType,
        classroomId,
      },
      userId
    );

    res.status(200).json(material);
  }
);

export const getClassroomMaterials = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId } = req.params;

    const materials = await MaterialService.getClassroomMaterials(classroomId);

    res.status(200).json(materials);
  }
);

export const deleteMaterial = asyncHandler(
  async (req: Request, res: Response) => {
    const { materialId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await MaterialService.deleteMaterial(materialId, userId);

    res.status(200).json({ message: "Material deleted successfully" });
  }
);
