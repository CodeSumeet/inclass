import { MaterialType } from "@/types/material.types";

export const getMaterialTypeFromFile = (file: File): MaterialType => {
  if (file.type.startsWith("image/")) {
    return MaterialType.IMAGE;
  } else if (file.type.startsWith("video/")) {
    return MaterialType.VIDEO;
  } else if (
    file.type.includes("pdf") ||
    file.type.includes("word") ||
    file.type.includes("excel") ||
    file.type.includes("powerpoint") ||
    file.type.includes("text/")
  ) {
    return MaterialType.DOCUMENT;
  } else {
    // Default to document for unknown types
    return MaterialType.DOCUMENT;
  }
};

export const isFileTypeAllowed = (file: File): boolean => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "application/msword", // doc
    "application/vnd.ms-powerpoint", // ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
    "video/mp4",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  return allowedTypes.includes(file.type);
};
