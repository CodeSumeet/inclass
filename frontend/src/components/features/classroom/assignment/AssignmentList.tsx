import React, { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button/Button";
import { Plus, FileText, Calendar, Clock, Award, Edit } from "lucide-react";
import { getClassroomAssignments } from "@/services/api/assignment";
import { Assignment, AssignmentStatus } from "@/types/assignment.types";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import AssignmentCreateModal from "./AssignmentCreateModal";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await getClassroomAssignments(classroomId);
      setAssignments(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load assignments");
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [classroomId]);

  const getStatusBadgeClass = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.DRAFT:
        return "bg-gray-100 text-gray-800";
      case AssignmentStatus.ACTIVE:
        return "bg-green-100 text-green-800";
      case AssignmentStatus.CLOSED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusText = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.DRAFT:
        return "Draft";
      case AssignmentStatus.ACTIVE:
        return "Active";
      case AssignmentStatus.CLOSED:
        return "Closed";
      default:
        return status;
    }
  };

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

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading assignments...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
      ) : assignments.length === 0 ? (
        <Card className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No assignments yet
          </h3>
          <p className="text-gray-500 mb-4">
            {isTeacher
              ? "Create your first assignment to get started"
              : "Your teacher hasn't created any assignments yet"}
          </p>
          {isTeacher && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Assignment
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="overflow-hidden"
            >
              <div className="flex items-start">
                <div className="p-4 bg-gray-50 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-grow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium mb-1">
                        {assignment.title}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">
                        {assignment.description || "No description provided"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/classrooms/${classroomId}/assignments/${assignment.id}`
                          )
                        }
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="flex items-center text-sm text-gray-600">
                      <Award className="h-4 w-4 mr-1" />
                      {assignment.points} points
                    </span>
                    {assignment.dueDate && (
                      <span className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        Due:{" "}
                        {format(new Date(assignment.dueDate), "MMM d, yyyy")}
                      </span>
                    )}
                    {assignment.dueDate && (
                      <span className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(assignment.dueDate), "h:mm a")}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(
                        assignment.status
                      )}`}
                    >
                      {getStatusText(assignment.status)}
                    </span>
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
