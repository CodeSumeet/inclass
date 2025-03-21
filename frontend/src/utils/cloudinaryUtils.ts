type FileType = "profile" | "material" | "assignment";

interface UploadOptions {
  file: File;
  fileType: FileType;
  userId?: string;
  classroomId?: string;
  assignmentId?: string;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

const ALLOWED_FILE_TYPES = {
  image: ["image/jpeg", "image/jpg", "image/png"],
  document: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  video: ["video/mp4"],
};

export const uploadToCloudinary = async ({
  file,
  fileType,
  userId,
  classroomId,
  assignmentId,
}: UploadOptions): Promise<CloudinaryResponse> => {
  const isImage = ALLOWED_FILE_TYPES.image.includes(file.type);
  const isDocument = ALLOWED_FILE_TYPES.document.includes(file.type);
  const isVideo = ALLOWED_FILE_TYPES.video.includes(file.type);

  if (!isImage && !isDocument && !isVideo) {
    throw new Error(
      "Invalid file type. Only PDF, DOCX, PPT, MP4, JPG, and PNG files are allowed."
    );
  }

  if (fileType === "profile" && file.size > 2 * 1024 * 1024) {
    throw new Error("Profile pictures must be less than 2MB");
  }
  if (fileType === "material" && file.size > 50 * 1024 * 1024) {
    throw new Error("Classroom materials must be less than 50MB");
  }
  if (fileType === "assignment" && file.size > 10 * 1024 * 1024) {
    throw new Error("Assignment submissions must be less than 10MB");
  }

  let uploadPreset;
  let folder = import.meta.env.VITE_CLOUDINARY_BASE_FOLDER || "inclass";

  switch (fileType) {
    case "profile":
      uploadPreset = import.meta.env.VITE_CLOUDINARY_PROFILE_PRESET;
      folder += "/profile_pics";
      break;
    case "material":
      uploadPreset = import.meta.env.VITE_CLOUDINARY_MATERIALS_PRESET;
      folder += `/classroom_materials/${classroomId || ""}`;
      break;
    case "assignment":
      uploadPreset = import.meta.env.VITE_CLOUDINARY_ASSIGNMENTS_PRESET;
      folder += `/assignments/${classroomId || ""}/${userId || ""}`;
      break;
    default:
      throw new Error("Invalid file type");
  }

  let resourceType: string;
  if (isImage) {
    resourceType = "image";
  } else if (isVideo) {
    resourceType = "video";
  } else {
    resourceType = "raw";
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  if (isDocument) {
    formData.append("flags", "attachment");
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  try {
    console.log("Uploading to Cloudinary:", {
      cloudName,
      resourceType,
      uploadPreset,
      folder,
      fileType: file.type,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    });

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary upload error details:", errorData);
      throw new Error(
        `Cloudinary error: ${errorData.error?.message || response.statusText}`
      );
    }

    const result = await response.json();

    if (isDocument) {
      result.secure_url = result.secure_url.replace(
        "/upload/",
        "/upload/fl_attachment/"
      );
    }

    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

export const getOptimizedUrl = (url: string, fileType?: string): string => {
  if (!url.includes("cloudinary.com")) return url;

  return url.replace("/fl_attachment", "");
};

export const getDownloadUrl = (url: string, fileType?: string): string => {
  if (!url.includes("cloudinary.com")) return url;

  const isPdf = url.toLowerCase().endsWith(".pdf") || fileType?.includes("pdf");
  const isDocument =
    /\.(docx?|xlsx?|pptx?|txt)$/i.test(url) ||
    fileType?.includes("document") ||
    fileType?.includes("word") ||
    fileType?.includes("powerpoint");

  if (isPdf || isDocument) {
    if (!url.includes("fl_attachment")) {
      return url.replace("/upload/", "/upload/fl_attachment/");
    }
  }

  return url;
};
