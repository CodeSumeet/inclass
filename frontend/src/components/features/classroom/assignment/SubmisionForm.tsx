import React, { useState, useEffect } from "react";
import { Button } from "@/components/common/Button/Button";
import { FileUpload } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import { uploadToCloudinary } from "@/utils/cloudinaryUtils";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import {
  Assignment,
  Submission,
  SubmissionStatus,
} from "@/types/assignment.types";
import {
  createSubmission,
  addSubmissionAttachment,
  getStudentSubmission,
} from "@/services/api/assignment";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import DocumentViewer from "@/components/common/DocumentViewer/DocumentViewer";

// Create a Textarea component since it's missing
const Textarea = ({ label, value, onChange, placeholder, rows = 3 }: any) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium">{label}</label>
      )}
      <textarea
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
};

interface SubmissionFormProps {
  assignment: Assignment;
  onSubmissionComplete: () => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({
  assignment,
  onSubmissionComplete,
}) => {
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingSubmission, setExistingSubmission] =
    useState<Submission | null>(null);
  const [fetchingSubmission, setFetchingSubmission] = useState(true);
  const [viewingAttachment, setViewingAttachment] = useState<{
    url: string;
    fileName: string;
    fileType: string;
  } | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!user || !user.userId) {
        setFetchingSubmission(false);
        return;
      }

      try {
        const submission = await getStudentSubmission(
          assignment.id,
          user.userId
        );
        setExistingSubmission(submission);
      } catch (error) {
        // No submission exists yet, which is fine
        console.log("No existing submission found");
      } finally {
        setFetchingSubmission(false);
      }
    };

    fetchSubmission();
  }, [assignment.id, user]);

  const handleFileChange = (selectedFile: File | null) => {
    setError(null);
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
      // First create the submission record
      const submissionData = {
        assignmentId: assignment.id,
        comment: comment.trim() || undefined,
      };

      const submission = await createSubmission(submissionData);

      // Then upload the file to Cloudinary
      const uploadResult = await uploadToCloudinary({
        file,
        fileType: "assignment",
        userId: user.userId,
        classroomId: assignment.classroomId,
        assignmentId: assignment.id,
      });

      // Finally, add the attachment to the submission
      await addSubmissionAttachment(submission.id, {
        url: uploadResult.secure_url,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      toast.success("Assignment submitted successfully!");
      setExistingSubmission(submission);
      onSubmissionComplete();
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

  const isOverdue = () => {
    return new Date(assignment.dueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  };

  if (fetchingSubmission) {
    return (
      <Card className="p-6">
        <div className="flex justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Card>
    );
  }

  if (existingSubmission) {
    return (
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
          <h2 className="text-xl font-semibold">Assignment Submitted</h2>
        </div>

        <div className="bg-green-50 p-4 rounded-md mb-4">
          <p className="text-green-700">
            You submitted this assignment on{" "}
            <span className="font-medium">
              {formatDate(existingSubmission.submissionDate)}
            </span>
            {existingSubmission.status === SubmissionStatus.LATE && (
              <span className="text-orange-600 ml-2 font-medium">(Late)</span>
            )}
          </p>
        </div>

        {existingSubmission.comment && (
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2">Your Comment</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">
                {existingSubmission.comment}
              </p>
            </div>
          </div>
        )}

        <h3 className="text-md font-medium mb-2">Your Submission</h3>
        <div className="space-y-2">
          {existingSubmission.attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              <span className="flex-grow">{attachment.fileName}</span>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500"
                  onClick={() =>
                    setViewingAttachment({
                      url: attachment.url,
                      fileName: attachment.fileName,
                      fileType: attachment.fileType,
                    })
                  }
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>

        {existingSubmission.grade && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-medium mb-2">Grade</h3>
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">
                  {existingSubmission.grade.points} / {assignment.points} points
                </span>
                <span className="text-gray-500 text-sm">
                  Graded on {formatDate(existingSubmission.grade.gradedAt)}
                </span>
              </div>
              {existingSubmission.grade.feedback && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <h4 className="text-sm font-medium text-blue-700 mb-1">
                    Feedback
                  </h4>
                  <p className="text-blue-700 whitespace-pre-wrap">
                    {existingSubmission.grade.feedback}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {viewingAttachment && (
          <DocumentViewer
            url={viewingAttachment.url}
            fileName={viewingAttachment.fileName}
            fileType={viewingAttachment.fileType}
            onClose={() => setViewingAttachment(null)}
          />
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold">Submit Your Work</h2>
        {isOverdue() && (
          <span className="ml-3 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" /> Past Due
          </span>
        )}
      </div>

      <div className="flex items-center text-sm text-gray-600 mb-6">
        <Clock className="h-4 w-4 mr-1" />
        <span>
          Due: {formatDate(assignment.dueDate)}
          {isOverdue() && (
            <span className="text-orange-600 ml-1">
              (Submission will be marked late)
            </span>
          )}
        </span>
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
        <FileUpload
          label="Upload Your Work"
          onChange={handleFileChange}
          errorMessage={!file ? "Please select a file" : undefined}
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

        <Textarea
          label="Comment (Optional)"
          value={comment}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setComment(e.target.value)
          }
          placeholder="Add a comment to your submission"
          rows={3}
        />

        <Button
          type="submit"
          loading={loading}
          disabled={!file || loading}
          className="w-full"
        >
          Submit Assignment
        </Button>
      </form>
    </Card>
  );
};

export default SubmissionForm;
