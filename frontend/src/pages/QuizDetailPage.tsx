import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuiz, deleteQuiz } from "@/services/api/quiz";
import { Quiz, QuestionType } from "@/types/quiz.types";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import { Button } from "@/components/common/Button/Button";
import { Card } from "@/components/common/Card";
import {
  FileText,
  Calendar,
  Clock,
  ArrowLeft,
  Trash2,
  Edit,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import API from "@/services/api";
import QuizQuestionEditor from "@/components/features/classroom/quiz/QuizQuestionEditor";
import QuizTaker from "@/components/features/classroom/quiz/QuizTaker";
import QuizResults from "@/components/features/classroom/quiz/QuizResults";

const QuizDetailPage: React.FC = () => {
  const { classroomId, quizId } = useParams<{
    classroomId: string;
    quizId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [activeTab, setActiveTab] = useState<"questions" | "results">(
    "questions"
  );

  useEffect(() => {
    const fetchClassroomRole = async () => {
      if (!classroomId || !user) return;

      try {
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
    const fetchQuiz = async () => {
      if (!quizId) return;

      setLoading(true);
      setError(null);

      try {
        const quizData = await getQuiz(quizId, true);
        setQuiz(quizData);
      } catch (error) {
        console.error("Error fetching quiz details:", error);
        setError("Failed to load quiz details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleDelete = async () => {
    if (!quiz) return;

    if (
      window.confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone."
      )
    ) {
      setDeleting(true);
      try {
        await deleteQuiz(quiz.quizId);
        toast.success("Quiz deleted successfully");
        navigate(`/classrooms/${classroomId}`);
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast.error("Failed to delete quiz");
      } finally {
        setDeleting(false);
      }
    }
  };

  const handlePublish = async () => {
    if (!quiz) return;

    try {
      const updatedQuiz = await API.put(`/quizzes/${quiz.quizId}`, {
        isPublished: true,
      });
      setQuiz(updatedQuiz.data);
      toast.success("Quiz published successfully");
    } catch (error) {
      console.error("Error publishing quiz:", error);
      toast.error("Failed to publish quiz");
    }
  };

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return "No due date";
    return format(new Date(dateString), "MMMM dd, yyyy h:mm a");
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading quiz details...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error || "Quiz not found"}</p>
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
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              <div className="ml-3">
                {!quiz.isPublished ? (
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full">
                    Draft
                  </span>
                ) : isOverdue(quiz.dueDate) ? (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    Closed
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-4 space-x-4">
              {quiz.dueDate && (
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Due: {formatDueDate(quiz.dueDate)}
                </span>
              )}
              {quiz.timeLimit && (
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Time Limit: {quiz.timeLimit} minutes
                </span>
              )}
            </div>
          </div>

          {isTeacher && (
            <div className="flex space-x-2">
              {!quiz.isPublished && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePublish}
                >
                  Publish Quiz
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(
                    `/classrooms/${classroomId}/quizzes/${quiz.quizId}/edit`
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
          <p>{quiz.description || "No description provided."}</p>

          {quiz.instructions && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Instructions</h3>
              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                {quiz.instructions}
              </div>
            </div>
          )}
        </div>
      </Card>

      {isTeacher ? (
        <div>
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "questions"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("questions")}
            >
              Questions
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "results"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("results")}
            >
              Results
            </button>
          </div>

          {activeTab === "questions" ? (
            <QuizQuestionEditor
              quiz={quiz}
              onQuizUpdated={(updatedQuiz) => setQuiz(updatedQuiz)}
            />
          ) : (
            <QuizResults quizId={quiz.quizId} />
          )}
        </div>
      ) : (
        <QuizTaker quiz={quiz} />
      )}
    </div>
  );
};

export default QuizDetailPage;
