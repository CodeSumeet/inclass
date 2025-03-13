import React from "react";
import { Card } from "../../common/Card";
import { Button } from "../../common/Button/Button";
import { Calendar } from "lucide-react";

interface AssignmentCardProps {
  assignment: any;
  variant: "compact" | "full";
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  variant,
}) => {
  const statusClasses = {
    submitted: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    default: "bg-red-100 text-red-800",
  };

  const statusText = {
    submitted: "Submitted",
    pending: "In Progress",
    default: "Not Started",
  };

  const status = assignment.status || "default";
  const statusClass =
    statusClasses[status as keyof typeof statusClasses] ||
    statusClasses.default;
  const statusDisplay =
    statusText[status as keyof typeof statusText] || statusText.default;

  if (variant === "compact") {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="border-l-4 border-primary p-4">
          <h4 className="font-medium text-lg text-gray-800">
            {assignment.title}
          </h4>
          <div className="flex items-center text-gray-600 mt-2">
            <Calendar className="h-4 w-4 mr-2" />
            <p>
              Due:{" "}
              {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </p>
          </div>
          <div className="mt-3 flex justify-end">
            <span className={`${statusClass} px-2 py-1 rounded-full text-xs`}>
              {statusDisplay}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all hover:translate-y-[-2px]">
      <div className="bg-primary h-2"></div>
      <div className="p-5">
        <h3 className="font-medium text-lg mb-2">{assignment.title}</h3>
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <Calendar className="h-4 w-4 mr-2" />
          <p>
            Due:{" "}
            {new Date(assignment.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className={`${statusClass} px-2 py-1 rounded-full text-xs`}>
            {statusDisplay}
          </span>
          <Button className="text-sm">View Details</Button>
        </div>
      </div>
    </Card>
  );
};

export default AssignmentCard;
