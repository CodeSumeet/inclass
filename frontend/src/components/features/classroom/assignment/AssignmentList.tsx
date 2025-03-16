import React, { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button/Button";
import { Plus, FileText, Calendar, Clock, Award } from "lucide-react";
import { getClassroomAssignments } from "@/services/api/assignment";
import { Assignment, AssignmentStatus } from "@/types/assignment.types";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import AssignmentCreateModal from "./AssignmentCreateModal";
import { toast } from "sonner";

interface AssignmentsListProps {
  classroomId: string;
  isTeacher: boolean;
}

const AssignmentsList: React.FC<AssignmentsListProps> = ({
  classroomId,
  isTeacher,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClassroomAssignments(classroomId);
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setError("Failed to load assignments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [classroomId]);

  const formatDueDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
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

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={fetchAssignments}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Assignments</h3>
        {isTeacher && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Assignment
          </Button>
        )}
      </div>

      {assignments.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium mb-2">No assignments yet</h4>
          <p className="text-gray-500 mb-4">
            {isTeacher
              ? "Create assignments for your students to complete."
              : "Your teacher hasn't created any assignments yet."}
          </p>
          {isTeacher && (
            <Button onClick={() => setIsModalOpen(true)}>
              Create Your First Assignment
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start">
                <div className="mr-4 flex-shrink-0 mt-1">
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-blue-600">
                          {assignment.title}
                        </h4>
                        <div className="ml-3">{getStatusBadge(assignment)}</div>
                      </div>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {assignment.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due: {formatDueDate(assignment.dueDate)}
                        </span>
                        <span className="flex items-center">
                          <Award className="h-3 w-3 mr-1" />
                          {assignment.points} points
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4"
                      onClick={() => {
                        // Navigate to assignment details
                        window.location.href = `/classrooms/${classroomId}/assignments/${assignment.id}`;
                      }}
                    >
                      {isTeacher ? "Manage" : "View"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AssignmentCreateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          classroomId={classroomId}
          onAssignmentCreated={fetchAssignments}
        />
      )}
    </div>
  );
};

export default AssignmentsList;
