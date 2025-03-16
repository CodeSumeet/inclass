import React, { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button/Button";
import { Plus, FileText, Calendar, Clock } from "lucide-react";
import { getClassroomQuizzes } from "@/services/api/quiz";
import { Quiz } from "@/types/quiz.types";
import { format } from "date-fns";
import { toast } from "sonner";
import QuizCreateModal from "./QuizCreateModal";

interface QuizListProps {
  classroomId: string;
  isTeacher: boolean;
}

const QuizList: React.FC<QuizListProps> = ({ classroomId, isTeacher }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClassroomQuizzes(classroomId);
      setQuizzes(data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setError("Failed to load quizzes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [classroomId]);

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return "No due date";
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getStatusBadge = (quiz: Quiz) => {
    if (!quiz.isPublished) {
      return (
        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full">
          Draft
        </span>
      );
    }

    if (isOverdue(quiz.dueDate)) {
      return (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
          Closed
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
        <p className="mt-2 text-gray-600">Loading quizzes...</p>
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
          onClick={fetchQuizzes}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Quizzes</h3>
        {isTeacher && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Quiz
          </Button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium mb-2">No quizzes yet</h4>
          <p className="text-gray-500 mb-4">
            {isTeacher
              ? "Create quizzes for your students to complete."
              : "Your teacher hasn't created any quizzes yet."}
          </p>
          {isTeacher && (
            <Button onClick={() => setIsModalOpen(true)}>
              Create Your First Quiz
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.quizId}
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
                          {quiz.title}
                        </h4>
                        <div className="ml-3">{getStatusBadge(quiz)}</div>
                      </div>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {quiz.description || "No description provided"}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                        {quiz.dueDate && (
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due: {formatDueDate(quiz.dueDate)}
                          </span>
                        )}
                        {quiz.timeLimit && (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Time Limit: {quiz.timeLimit} minutes
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4"
                      onClick={() => {
                        // Navigate to quiz details
                        window.location.href = `/classrooms/${classroomId}/quizzes/${quiz.quizId}`;
                      }}
                    >
                      {isTeacher ? "Manage" : "Take Quiz"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <QuizCreateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          classroomId={classroomId}
          onQuizCreated={fetchQuizzes}
        />
      )}
    </div>
  );
};

export default QuizList;
