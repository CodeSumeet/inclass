import React, { useState, useEffect } from "react";
import { Button } from "@/components/common/Button/Button";
import { FileUpload } from "@/components/common/Input";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { uploadToCloudinary } from "@/utils/cloudinaryUtils";
import { createAssignment } from "@/services/api/assignment";
import { AssignmentStatus } from "@/types/assignment.types";
import { X } from "lucide-react";

// Create Textarea and Input components since they're missing
const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
}: any) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
      />
    </div>
  );
};

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  min,
  max,
  required = false,
}: any) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        required={required}
      />
    </div>
  );
};

interface AssignmentCreateModalProps {
  classroomId: string;
  isOpen: boolean;
  onClose: () => void;
  onAssignmentCreated: () => void;
}

const AssignmentCreateModal: React.FC<AssignmentCreateModalProps> = ({
  classroomId,
  isOpen,
  onClose,
  onAssignmentCreated,
}) => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [points, setPoints] = useState(100);
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(false);

  // Close modal when escape key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setInstructions("");
    setPoints(100);
    setDueDate("");
    setFile(null);
    setError(null);
    setIsDraft(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!dueDate) {
      setError("Due date is required");
      return;
    }

    if (points < 0) {
      setError("Points cannot be negative");
      return;
    }

    if (!user) {
      setError("You must be logged in to create an assignment");
      return;
    }

    if (loading) return; // Prevent duplicate submissions

    setLoading(true);
    setError(null);

    try {
      // Prepare assignment data
      const assignmentData = {
        classroomId,
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim() || undefined,
        points,
        dueDate: new Date(dueDate).toISOString(),
        status: isDraft ? AssignmentStatus.DRAFT : AssignmentStatus.ACTIVE,
      };

      // If there's a file, upload it first
      let attachments = undefined;
      if (file) {
        const uploadResult = await uploadToCloudinary({
          file,
          fileType: "assignment",
          userId: user.userId,
          classroomId,
        });

        attachments = [
          {
            url: uploadResult.secure_url,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          },
        ];
      }

      // Create assignment only once with attachments if they exist
      await createAssignment({
        ...assignmentData,
        attachments,
      });

      toast.success(
        `Assignment ${isDraft ? "saved as draft" : "created"} successfully!`
      );
      resetForm();
      onAssignmentCreated();
      onClose();
    } catch (error) {
      console.error("Error creating assignment:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create assignment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create New Assignment</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 rounded-full p-0 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <Input
              label="Title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
              required
            />

            <Textarea
              label="Description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              placeholder="Provide a brief description of the assignment"
              required
            />

            <Textarea
              label="Instructions"
              value={instructions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInstructions(e.target.value)
              }
              placeholder="Detailed instructions for students (optional)"
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Points"
                type="number"
                value={points}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPoints(parseInt(e.target.value) || 0)
                }
                min={0}
                required
              />

              <Input
                label="Due Date"
                type="datetime-local"
                value={dueDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDueDate(e.target.value)
                }
                required
              />
            </div>

            <FileUpload
              label="Attachment (Optional)"
              onChange={handleFileChange}
              accept=".pdf,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
            />

            {file && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                id="draft"
                checked={isDraft}
                onChange={(e) => setIsDraft(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="draft"
                className="text-sm text-gray-700"
              >
                Save as draft (won't be visible to students)
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
              >
                {isDraft ? "Save Draft" : "Create Assignment"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCreateModal;
