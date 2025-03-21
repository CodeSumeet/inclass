import React, { useState, useEffect } from "react";
import { Button } from "@/components/common/Button/Button";
import { FileUpload } from "@/components/common/Input";
import Textarea from "@/components/common/Input/Textarea";
import Input from "@/components/common/Input/Input";
import { Card } from "@/components/common/Card";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { uploadToCloudinary } from "@/utils/cloudinaryUtils";
import { getAssignment, updateAssignment } from "@/services/api/assignment";
import { Assignment, AssignmentStatus } from "@/types/assignment.types";
import { X, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const AssignmentEditForm = () => {
  const { classroomId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [points, setPoints] = useState<number>(100);
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);
  const [existingFileType, setExistingFileType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) return;

      try {
        const data = await getAssignment(assignmentId);
        setAssignment(data);
        setTitle(data.title);
        setDescription(data.description || "");
        setInstructions(data.instructions || "");
        setPoints(data.points || 100);

        if (data.dueDate) {
          const date = new Date(data.dueDate);
          setDueDate(date.toISOString().slice(0, 16));
        }

        if (data.attachments && data.attachments.length > 0) {
          setExistingFileUrl(data.attachments[0].url);
          setExistingFileName(data.attachments[0].fileName || "Attachment");
          setExistingFileType(data.attachments[0].fileType || "");
        }
      } catch (err) {
        toast.error("Failed to load assignment details");
        console.error(err);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    if (newFile) {
      setExistingFileUrl(null);
      setExistingFileName(null);
      setExistingFileType(null);
    }
  };

  const removeExistingFile = () => {
    setExistingFileUrl(null);
    setExistingFileName(null);
    setExistingFileType(null);
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!dueDate && !isDraft) {
      setError("Due date is required for published assignments");
      return;
    }

    if (!classroomId || !assignmentId) {
      toast.error("Missing classroom or assignment ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let attachments = [];

      if (existingFileUrl && existingFileName) {
        attachments.push({
          url: existingFileUrl,
          fileName: existingFileName,
          fileType: existingFileType || "",
        });
      }

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
          },
        ];
      }

      const status = isDraft ? AssignmentStatus.DRAFT : AssignmentStatus.ACTIVE;

      await updateAssignment(assignmentId, {
        title,
        description,
        instructions,
        points: Number(points),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        attachments: attachments as any,
        status,
      });

      toast.success("Assignment updated successfully");
      navigate(`/classrooms/${classroomId}/assignments/${assignmentId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to update assignment");
      toast.error("Failed to update assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Edit Assignment</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)}>
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

            {existingFileUrl && existingFileName && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md mb-3">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <span>{existingFileName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeExistingFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {(!existingFileUrl || !existingFileName) && (
              <FileUpload
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
              />
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(
                  `/classrooms/${classroomId}/assignments/${assignmentId}`
                )
              }
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
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Update Assignment
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AssignmentEditForm;
