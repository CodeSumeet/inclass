import React, { useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { FileUpload } from "@/components/common/Input";
import { uploadToCloudinary } from "@/utils/cloudinaryUtils";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import API from "@/services/api";

interface AssignmentSubmissionFormProps {
  assignmentId: string;
  classroomId: string;
  onSubmissionComplete: () => void;
}

const AssignmentSubmissionForm: React.FC<AssignmentSubmissionFormProps> = ({
  assignmentId,
  classroomId,
  onSubmissionComplete,
}) => {
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!user) {
      setError("You must be logged in to submit an assignment");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload file to Cloudinary with proper folder structure
      const uploadResult = await uploadToCloudinary({
        file,
        fileType: "assignment",
        userId: user.userId,
        classroomId,
        assignmentId,
      });

      // Create submission record in database
      await API.post("/assignments/submit", {
        assignmentId,
        fileUrl: uploadResult.secure_url,
        fileType: file.type,
        fileSize: file.size,
        fileName: file.name,
      });

      toast.success("Assignment submitted successfully!");
      onSubmissionComplete();
      setFile(null);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit assignment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <h3 className="text-lg font-medium">Submit Assignment</h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>
      )}

      <FileUpload
        label="Upload Your Work (PDF or DOCX only)"
        onChange={handleFileChange}
        errorMessage={!file ? "Please select a file" : undefined}
      />

      {file && (
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm font-medium">{file.name}</p>
          <p className="text-xs text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
          </p>
        </div>
      )}

      <Button
        type="submit"
        loading={loading}
        disabled={!file || loading}
        className="w-full"
      >
        Submit Assignment
      </Button>
    </form>
  );
};

export default AssignmentSubmissionForm;
