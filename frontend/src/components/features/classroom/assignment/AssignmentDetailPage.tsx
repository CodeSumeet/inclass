import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button/Button";
import {
  ArrowLeft,
  Calendar,
  Award,
  Edit,
  Trash2,
  FileText,
  Download,
} from "lucide-react";
import {
  getAssignment,
  getAssignmentSubmissions,
  deleteAssignment,
  updateAssignment,
} from "@/services/api/assignment";
import {
  Assignment,
  AssignmentStatus,
  Submission,
} from "@/types/assignment.types";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import SubmissionsList from "./SubmissionList";
import SubmissionForm from "./SubmisionForm";
import DocumentViewer from "@/components/common/DocumentViewer/DocumentViewer";
import { getDownloadUrl } from "@/utils/cloudinaryUtils";
import API from "@/services/api";

interface AttachmentViewerProps {
  url: string;
  fileName: string;
  fileType: string;
}

const AssignmentDetailPage = () => {
  const { classroomId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [viewingAttachment, setViewingAttachment] =
    useState<AttachmentViewerProps | null>(null);

  useEffect(() => {
    const checkTeacherStatus = async () => {
      if (!classroomId || !user) return;

      try {
        const response = await API.get(`/classrooms/${classroomId}`);
        const classroom = response.data;

        if (classroom) {
          setIsTeacher(classroom.ownerId === user.userId);
        }
      } catch (error) {
        console.error("Error checking teacher status:", error);
        setIsTeacher(false);
      }
    };

    checkTeacherStatus();
  }, [classroomId, user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!assignmentId) return;

      setLoading(true);
      setError(null);

      try {
        const assignmentData = await getAssignment(assignmentId);
        setAssignment(assignmentData);

        if (isTeacher) {
          const submissionsData = await getAssignmentSubmissions(assignmentId);
          setSubmissions(submissionsData);
        }
      } catch (error) {
        console.error("Error fetching assignment details:", error);
        setError("Failed to load assignment details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId, isTeacher]);

  const handleDelete = async () => {
    if (!assignment) return;

    if (
      window.confirm(
        "Are you sure you want to delete this assignment? This action cannot be undone."
      )
    ) {
      setDeleting(true);
      try {
        await deleteAssignment(assignment.id);
        toast.success("Assignment deleted successfully");
        navigate(`/classrooms/${classroomId}`);
      } catch (error) {
        console.error("Error deleting assignment:", error);
        toast.error("Failed to delete assignment");
      } finally {
        setDeleting(false);
      }
    }
  };

  const handlePublish = async () => {
    if (!assignment || !assignmentId) return;

    if (!assignment.dueDate) {
      toast.error("Please set a due date before publishing");
      navigate(`/classrooms/${classroomId}/assignments/edit/${assignmentId}`);
      return;
    }

    setPublishing(true);
    try {
      const updatedAssignment = await updateAssignment(assignmentId, {
        status: AssignmentStatus.ACTIVE,
      });
      setAssignment(updatedAssignment);
      toast.success("Assignment published successfully");
    } catch (error) {
      console.error("Error publishing assignment:", error);
      toast.error("Failed to publish assignment");
    } finally {
      setPublishing(false);
    }
  };

  const formatDueDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        {error || "Assignment not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/classrooms/${classroomId}`)}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Classroom
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{assignment.title}</h2>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    assignment.status === AssignmentStatus.DRAFT
                      ? "bg-gray-100 text-gray-800"
                      : assignment.status === AssignmentStatus.ACTIVE
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {assignment.status === AssignmentStatus.DRAFT
                    ? "Draft"
                    : assignment.status === AssignmentStatus.ACTIVE
                    ? "Active"
                    : "Closed"}
                </span>
                {assignment.dueDate && (
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Due: {formatDueDate(assignment.dueDate)}
                  </span>
                )}
                <span className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  {assignment.points} points
                </span>
              </div>
            </div>

            {isTeacher && (
              <div className="flex space-x-2">
                {assignment.status === AssignmentStatus.DRAFT && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handlePublish}
                    disabled={publishing}
                  >
                    {publishing ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                    ) : null}
                    Publish
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(
                      `/classrooms/${classroomId}/assignments/edit/${assignmentId}`
                    )
                  }
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-6">
            <p>{assignment.description}</p>

            {assignment.instructions && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Instructions</h3>
                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                  {assignment.instructions}
                </div>
              </div>
            )}
          </div>

          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Attachments</h3>
              <div className="space-y-2">
                {assignment.attachments.map((attachment) => (
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
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {isTeacher ? (
        <SubmissionsList
          assignmentId={assignment.id}
          submissions={submissions}
          onSubmissionsUpdated={(updatedSubmissions) =>
            setSubmissions(updatedSubmissions)
          }
        />
      ) : (
        assignment.status !== AssignmentStatus.DRAFT && (
          <SubmissionForm
            assignment={assignment}
            onSubmissionComplete={() =>
              toast.success("Assignment submitted successfully!")
            }
          />
        )
      )}

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

export default AssignmentDetailPage;
