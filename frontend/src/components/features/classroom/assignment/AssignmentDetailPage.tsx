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
  const [classStats, setClassStats] = useState({
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    submissionCount: 0,
    gradedCount: 0,
  });

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

          // Calculate class statistics
          if (submissionsData.length > 0) {
            const gradedSubmissions = submissionsData.filter(
              (sub) => sub.grade && sub.grade.points !== undefined
            );

            if (gradedSubmissions.length > 0) {
              const scores = gradedSubmissions.map((sub) => sub.grade?.points);
              const total = scores.reduce((sum, score) => sum! + score!, 0);

              setClassStats({
                averageScore:
                  Math.round((total! / gradedSubmissions.length) * 10) / 10,
                highestScore: Math.max(
                  ...scores.filter((score) => score !== undefined)
                ),
                lowestScore: Math.min(
                  ...scores.filter((score) => score !== undefined)
                ),
                submissionCount: submissionsData.length,
                gradedCount: gradedSubmissions.length,
              });
            }
          }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          {error || "Assignment not found"}
        </div>
        <Button
          onClick={() => navigate(`/classrooms/${classroomId}`)}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Classroom
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate(`/classrooms/${classroomId}`)}
          variant="ghost"
          className="text-gray-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Classroom
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{assignment.title}</h1>
              <div className="flex items-center mt-2 text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {assignment.dueDate
                    ? `Due ${format(
                        new Date(assignment.dueDate),
                        "MMM dd, yyyy h:mm a"
                      )}`
                    : "No due date"}
                </span>
                <span className="mx-2">•</span>
                <Award className="h-4 w-4 mr-1" />
                <span className="text-sm">{assignment.points} points</span>
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
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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

          {isTeacher && classStats.submissionCount > 0 && (
            <div className="mt-6 mb-6 bg-blue-50 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-3">Class Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-sm text-gray-500">Average Score</div>
                  <div className="text-xl font-semibold">
                    {classStats.averageScore} / {assignment.points}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-sm text-gray-500">Submissions</div>
                  <div className="text-xl font-semibold">
                    {classStats.submissionCount} submitted •{" "}
                    {classStats.gradedCount} graded
                  </div>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-sm text-gray-500">Score Range</div>
                  <div className="text-xl font-semibold">
                    {classStats.lowestScore} - {classStats.highestScore}
                  </div>
                </div>
              </div>
            </div>
          )}

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
