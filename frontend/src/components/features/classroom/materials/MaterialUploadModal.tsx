import React, { useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { Input, FileUpload } from "@/components/common/Input";
import { uploadToCloudinary } from "@/utils/cloudinaryUtils";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import API from "@/services/api";
import { getMaterialTypeFromFile, isFileTypeAllowed } from "@/utils/fileUtils";

interface MaterialUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroomId: string;
  onMaterialUploaded: () => void;
}

const MaterialUploadModal: React.FC<MaterialUploadModalProps> = ({
  isOpen,
  onClose,
  classroomId,
  onMaterialUploaded,
}) => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (selectedFile: File | null) => {
    setError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!isFileTypeAllowed(selectedFile)) {
      setError(
        "Invalid file type. Only PDF, DOCX, PPT, MP4, JPG, and PNG files are allowed."
      );
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title for the material.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Determine material type based on file
      const materialType = getMaterialTypeFromFile(file);

      // Upload file to Cloudinary
      const uploadResult = await uploadToCloudinary({
        file,
        fileType: "material",
        classroomId,
      });

      console.log("Upload result:", uploadResult);

      // Create material record in database
      const res = await API.post(`/classrooms/${classroomId}/materials`, {
        title,
        description,
        type: materialType,
        url: uploadResult.secure_url,
        fileSize: file.size,
        fileType: file.type,
        classroomId,
      });

      console.log("Material uploaded successfully!", res);

      toast.success("Material uploaded successfully!");
      onMaterialUploaded();
      onClose();
    } catch (error) {
      console.error("Error uploading material:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload material. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Upload Material</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this material"
              required
            />

            <Input
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description"
            />

            <FileUpload
              label="Upload Document"
              onChange={handleFileChange}
              errorMessage={!file ? "Please select a file" : undefined}
              accept=".pdf,.docx,.ppt,.pptx,.mp4,.jpg,.jpeg,.png"
            />

            {file && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!file || !title.trim() || loading}
            >
              Upload Material
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialUploadModal;
