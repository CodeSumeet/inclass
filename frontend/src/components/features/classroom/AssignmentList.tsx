import React from "react";
import { Card } from "../../common/Card";
import { Button } from "../../common/Button/Button";
import { Plus, Clock } from "lucide-react";
import AssignmentCard from "./AssignmentCard";

interface AssignmentListProps {
  assignments: any[];
  isTeacher?: boolean;
  variant: "compact" | "full";
}

const AssignmentList: React.FC<AssignmentListProps> = ({
  assignments,
  isTeacher = false,
  variant,
}) => {
  if (!assignments || assignments.length === 0) {
    return (
      <Card className="bg-white">
        <div className="p-6 text-center text-gray-500">
          <Clock className="h-10 w-10 mx-auto mb-2 text-gray-400" />
          <p className="font-medium">
            {variant === "full"
              ? "No assignments created yet"
              : "No upcoming work for this classroom."}
          </p>
          {variant === "full" && isTeacher && (
            <>
              <p className="text-sm mb-4">
                Create your first assignment to get started
              </p>
              <Button>Create Assignment</Button>
            </>
          )}
        </div>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            variant="compact"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Class Assignments
        </h3>
        {isTeacher && (
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Create Assignment
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            variant="full"
          />
        ))}
      </div>
    </div>
  );
};

export default AssignmentList;
