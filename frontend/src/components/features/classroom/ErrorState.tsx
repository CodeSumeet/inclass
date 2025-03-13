import React from "react";
import { Button } from "../../common/Button/Button";
import { ChevronLeft } from "lucide-react";

interface ErrorStateProps {
  error: string | null;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600 mb-6">{error || "Classroom not found."}</p>
        <Button
          className="mt-2"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Classes
        </Button>
      </div>
    </div>
  );
};

export default ErrorState;
