import React from "react";
import { useParams } from "react-router-dom";
import AssignmentEditForm from "@/components/features/classroom/assignment/AssignmentEditForm";
import AppLayout from "@/layouts/AppLayout";

const AssignmentEditPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <AssignmentEditForm />
    </div>
  );
};

export default AssignmentEditPage;
