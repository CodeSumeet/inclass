import API from "./index";
import { CreateMaterialDto, Material } from "@/types/material.types";

export const getClassroomMaterials = async (
  classroomId: string
): Promise<Material[]> => {
  const response = await API.get(`/classrooms/${classroomId}/materials`);
  return response.data;
};

export const uploadMaterial = async (
  file: File,
  data: Omit<CreateMaterialDto, "url" | "fileSize" | "fileType">
): Promise<Material> => {
  // First upload the file to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  );

  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    }/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const cloudinaryData = await cloudinaryResponse.json();

  // Then create the material record with the file URL
  const materialData: CreateMaterialDto = {
    ...data,
    url: cloudinaryData.secure_url,
    fileSize: file.size,
    fileType: file.type,
  };

  const response = await API.post(
    `/classrooms/${data.classroomId}/materials`,
    materialData
  );
  return response.data;
};

export const deleteMaterial = async (materialId: string): Promise<void> => {
  await API.delete(`/materials/${materialId}`);
};
