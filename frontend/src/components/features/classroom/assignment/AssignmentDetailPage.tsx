import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAssignment,
  getAssignmentSubmissions,
  deleteAssignment,
} from "@/services/api/assignment";
import {
  Assignment,
  Submission,
  AssignmentStatus,
} from "@/types/assignment.types";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import { Button } from "@/components/common/Button/Button";
import { Card } from "@/components/common/Card";
import {
  FileText,
  Calendar,
  Award,
  ArrowLeft,
  Trash2,
  Edit,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import DocumentViewer from "@/components/common/DocumentViewer/DocumentViewer";
import SubmissionForm from "./SubmisionForm";
import SubmissionsList from "./SubmissionList";
import { getDownloadUrl } from "@/utils/cloudinaryUtils";
import API from "@/services/api";

const AssignmentDetailPage: React.FC = () => {
  const { classroomId, assignmentId } = useParams<{
    classroomId: string;
    assignmentId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewingAttachment, setViewingAttachment] = useState<{
    url: string;
    fileName: string;
    fileType: string;
  } | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    const fetchClassroomRole = async () => {
      if (!classroomId || !user) return;

      try {
        // Fetch the user's role in this specific classroom
        const response = await API.get(`/classrooms/${classroomId}/role`);
        setIsTeacher(response.data.role === "TEACHER");
      } catch (error) {
        console.error("Error fetching classroom role:", error);
        setIsTeacher(false);
      }
    };

    fetchClassroomRole();
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

  const formatDueDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM dd, yyyy h:mm a");
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.status === AssignmentStatus.DRAFT) {
      return (
        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full">
          Draft
        </span>
      );
    }

    if (assignment.status === AssignmentStatus.CLOSED) {
      return (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
          Closed
        </span>
      );
    }

    if (isOverdue(assignment.dueDate)) {
      return (
        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
          Past Due
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
        Active
      </span>
    );
  };

  // ... existing code ...
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading assignment details...</p>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error || "Assignment not found"}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => navigate(`/classrooms/${classroomId}`)}
        >
          Back to Classroom
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate(`/classrooms/${classroomId}`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Classroom
      </Button>

      <Card className="p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              <h1 className="text-2xl font-bold">{assignment.title}</h1>
              <div className="ml-3">{getStatusBadge(assignment)}</div>
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-4 space-x-4">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Due: {formatDueDate(assignment.dueDate)}
              </span>
              <span className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                {assignment.points} points
              </span>
            </div>
          </div>

          {isTeacher && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(
                    `/classrooms/${classroomId}/assignments/${assignment.id}/edit`
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
        <SubmissionForm
          assignment={assignment}
          onSubmissionComplete={() =>
            toast.success("Assignment submitted successfully!")
          }
        />
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
