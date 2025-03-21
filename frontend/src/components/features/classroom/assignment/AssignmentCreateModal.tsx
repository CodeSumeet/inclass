import React, { useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { FileUpload } from "@/components/common/Input";
import Textarea from "@/components/common/Input/Textarea";
import Input from "@/components/common/Input/Input";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { uploadToCloudinary } from "@/utils/cloudinaryUtils";
import { createAssignment } from "@/services/api/assignment";
import { AssignmentStatus } from "@/types/assignment.types";
import { X } from "lucide-react";

interface AssignmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroomId: string;
  onAssignmentCreated: () => void;
}

const AssignmentCreateModal: React.FC<AssignmentCreateModalProps> = ({
  isOpen,
  onClose,
  classroomId,
  onAssignmentCreated,
}) => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [points, setPoints] = useState<number>(100);
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!dueDate && !saveAsDraft) {
      setError("Due date is required for published assignments");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let attachments: any = [];

      // Inside the handleSubmit function where attachments are created
      if (file) {
        const uploadResult = await uploadToCloudinary({
          file,
          fileType: "assignment",
          userId: user?.userId,
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

      await createAssignment({
        classroomId,
        title,
        description,
        instructions,
        points: Number(points),
        dueDate: new Date(dueDate).toISOString(),
        attachments,
        status: saveAsDraft ? AssignmentStatus.DRAFT : AssignmentStatus.ACTIVE,
      });

      toast.success("Assignment created successfully");
      onAssignmentCreated();
      handleClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create assignment");
      toast.error("Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Create Assignment</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-4">
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Assignment title"
                required
              />
            </div>

            <div className="mb-4">
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the assignment"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <Textarea
                label="Instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Detailed instructions for students"
                rows={5}
              />
            </div>

            <div className="mb-4">
              <Input
                label="Points"
                type="number"
                value={points.toString()}
                onChange={(e) => setPoints(Number(e.target.value))}
                min={0}
                max={1000}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachment
              </label>
              <FileUpload
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                loading={loading}
                disabled={loading}
              >
                Create Assignment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCreateModal;
