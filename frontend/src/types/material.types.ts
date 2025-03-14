export enum MaterialType {
  DOCUMENT = "DOCUMENT",
  LINK = "LINK",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export interface Material {
  id: string;
  title: string;
  description?: string;
  type: MaterialType;
  url: string;
  fileSize?: number;
  fileType?: string;
  createdAt: string;
  createdById: string;
  classroomId: string;
  createdBy?: {
    userId: string;
    firstName: string;
    lastName: string;
    profilePic?: string;
  };
}

export interface CreateMaterialDto {
  title: string;
  description?: string;
  type: MaterialType;
  url: string;
  fileSize?: number;
  fileType?: string;
  classroomId: string;
}
