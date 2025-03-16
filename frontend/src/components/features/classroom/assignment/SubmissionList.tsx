import React, { useState } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button/Button";
import { Submission, SubmissionStatus } from "@/types/assignment.types";
import { gradeSubmission } from "@/services/api/assignment";
import { format } from "date-fns";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
} from "lucide-react";
import DocumentViewer from "@/components/common/DocumentViewer/DocumentViewer";
import { getDownloadUrl } from "@/utils/cloudinaryUtils";
import { toast } from "sonner";

// Create a Textarea and Input component since they're missing
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

const Input = ({ label, type = "text", value, onChange, min, max }: any) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium">{label}</label>
      )}
      <input
        type={type}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
      />
    </div>
  );
};

interface SubmissionsListProps {
  assignmentId: string;
  submissions: Submission[];
  onSubmissionsUpdated: (submissions: Submission[]) => void;
}

const SubmissionsList: React.FC<SubmissionsListProps> = ({
  assignmentId,
  submissions,
  onSubmissionsUpdated,
}) => {
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<
    string | null
  >(null);
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(
    null
  );
  const [points, setPoints] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [viewingAttachment, setViewingAttachment] = useState<{
    url: string;
    fileName: string;
    fileType: string;
  } | null>(null);

  const handleGradeSubmit = async (submissionId: string) => {
    if (points < 0) {
      toast.error("Points cannot be negative");
      return;
    }

    setLoading(true);
    try {
      const updatedSubmission = await gradeSubmission(submissionId, {
        points,
        feedback: feedback.trim() || undefined,
      });

      // Update the submissions list with the graded submission
      const updatedSubmissions = submissions.map((sub) =>
        sub.id === submissionId ? updatedSubmission : sub
      );

      onSubmissionsUpdated(updatedSubmissions);
      setGradingSubmissionId(null);
      setPoints(0);
      setFeedback("");
      toast.success("Submission graded successfully!");
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error("Failed to grade submission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  };

  const getStatusBadge = (submission: Submission) => {
    switch (submission.status) {
      case SubmissionStatus.GRADED:
        return (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" /> Graded
          </span>
        );
      case SubmissionStatus.LATE:
        return (
          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" /> Late
          </span>
        );
      case SubmissionStatus.SUBMITTED:
        return (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" /> Submitted
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full flex items-center">
            <Clock className="h-3 w-3 mr-1" /> Not Submitted
          </span>
        );
    }
  };

  if (submissions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
        <p className="text-gray-500">
          Students haven't submitted any work for this assignment yet.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Student Submissions ({submissions.length})
      </h2>

      <div className="space-y-4">
        {submissions.map((submission) => (
          <Card
            key={submission.id}
            className="overflow-hidden"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center">
                <div className="mr-3">
                  {submission.student.profilePic ? (
                    <img
                      src={submission.student.profilePic}
                      alt={`${submission.student.firstName} ${submission.student.lastName}`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
                        {submission.student.firstName.charAt(0)}
                        {submission.student.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {submission.student.firstName} {submission.student.lastName}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>
                      Submitted {formatDate(submission.submissionDate)}
                    </span>
                    <span className="mx-2">•</span>
                    {getStatusBadge(submission)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setExpandedSubmissionId(
                    expandedSubmissionId === submission.id
                      ? null
                      : submission.id
                  )
                }
              >
                {expandedSubmissionId === submission.id ? "Hide" : "View"}
              </Button>
            </div>

            {expandedSubmissionId === submission.id && (
              <div className="p-4 bg-gray-50">
                {submission.comment && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-1">
                      Student Comment
                    </h4>
                    <div className="bg-white p-3 rounded-md">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {submission.comment}
                      </p>
                    </div>
                  </div>
                )}

                <h4 className="text-sm font-medium mb-2">Attachments</h4>
                <div className="space-y-2 mb-4">
                  {submission.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center p-3 bg-white rounded-md hover:bg-gray-100 transition-colors"
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
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-500"
                          onClick={() => {
                            const downloadUrl = getDownloadUrl(
                              attachment.url,
                              attachment.fileType
                            );
                            const link = document.createElement("a");
                            link.href = downloadUrl;
                            link.download = attachment.fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {submission.grade ? (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Grade</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setGradingSubmissionId(submission.id);
                          setPoints(submission.grade?.points || 0);
                          setFeedback(submission.grade?.feedback || "");
                        }}
                      >
                        Edit Grade
                      </Button>
                    </div>
                    <div className="mt-2">
                      <p className="text-blue-700 font-medium text-lg">
                        {submission.grade.points} points
                      </p>
                      {submission.grade.feedback && (
                        <div className="mt-2">
                          <h5 className="text-sm font-medium text-blue-700 mb-1">
                            Feedback
                          </h5>
                          <p className="text-blue-700 whitespace-pre-wrap">
                            {submission.grade.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Button
                      onClick={() => {
                        setGradingSubmissionId(submission.id);
                        setPoints(0);
                        setFeedback("");
                      }}
                    >
                      Grade Submission
                    </Button>
                  </div>
                )}

                {gradingSubmissionId === submission.id && (
                  <div className="mt-4 p-4 border rounded-md bg-white">
                    <h4 className="font-medium mb-3">Grade Submission</h4>
                    <div className="space-y-3">
                      <Input
                        label="Points"
                        type="number"
                        value={points.toString()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPoints(parseInt(e.target.value) || 0)
                        }
                        min={0}
                      />
                      <Textarea
                        label="Feedback (Optional)"
                        value={feedback}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setFeedback(e.target.value)
                        }
                        placeholder="Provide feedback to the student"
                        rows={3}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setGradingSubmissionId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleGradeSubmit(submission.id)}
                          loading={loading}
                        >
                          Save Grade
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {viewingAttachment && (
        <DocumentViewer
          url={viewingAttachment.url}
          fileName={viewingAttachment.fileName}
          fileType={viewingAttachment.fileType}
          onClose={() => setViewingAttachment(null)}
        />
      )}
    </div>
  );
};

export default SubmissionsList;
