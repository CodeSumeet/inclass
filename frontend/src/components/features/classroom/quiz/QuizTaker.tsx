import React, { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input";
import { Quiz, Question, QuestionType, QuizAttempt } from "@/types/quiz.types";
import {
  startQuizAttempt,
  submitQuizAttempt,
  getQuizAttempt,
} from "@/services/api/quiz";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Create Textarea component since it's missing
const Textarea = ({ value, onChange, placeholder, rows = 3 }: any) => {
  return (
    <textarea
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
    />
  );
};

interface QuizTakerProps {
  quiz: Quiz;
}

const QuizTaker: React.FC<QuizTakerProps> = ({ quiz }) => {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{
    [questionId: string]: {
      selectedOptions: string[];
      textAnswer?: string;
    };
  }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    // Check if there's an existing attempt
    const checkExistingAttempt = async () => {
      if (!quiz || !quiz.quizId) return;

      setLoading(true);
      try {
        const response = await startQuizAttempt(quiz.quizId);
        setAttempt(response);

        // Initialize answers
        if (quiz.questions) {
          const initialAnswers: {
            [questionId: string]: {
              selectedOptions: string[];
              textAnswer?: string;
            };
          } = {};

          quiz.questions.forEach((question) => {
            initialAnswers[question.questionId] = {
              selectedOptions: [],
              textAnswer: "",
            };
          });

          setAnswers(initialAnswers);
        }

        // If the quiz has a time limit, start the timer
        if (quiz.timeLimit) {
          const startTime = new Date(response.startedAt).getTime();
          const currentTime = new Date().getTime();
          const elapsedMinutes = (currentTime - startTime) / (1000 * 60);
          const remainingMinutes = quiz.timeLimit - elapsedMinutes;

          if (remainingMinutes <= 0) {
            // Time's up, submit the quiz
            handleSubmitQuiz();
          } else {
            setTimeLeft(Math.floor(remainingMinutes * 60));
          }
        }

        setQuizStarted(true);
      } catch (error) {
        console.error("Error starting quiz:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to start quiz. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    checkExistingAttempt();
  }, [quiz]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || !quizStarted || quizSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          // Time's up, submit the quiz
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizStarted, quizSubmitted]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    const question = quiz.questions?.find((q) => q.questionId === questionId);

    if (!question) return;

    setAnswers((prev) => {
      const currentAnswer = prev[questionId] || { selectedOptions: [] };

      // For multiple choice and true/false, only one option can be selected
      if (
        question.questionType === QuestionType.MULTIPLE_CHOICE ||
        question.questionType === QuestionType.TRUE_FALSE
      ) {
        return {
          ...prev,
          [questionId]: {
            ...currentAnswer,
            selectedOptions: [optionId],
          },
        };
      }

      // For multiple answer, toggle the selection
      const selectedOptions = [...currentAnswer.selectedOptions];
      const optionIndex = selectedOptions.indexOf(optionId);

      if (optionIndex === -1) {
        selectedOptions.push(optionId);
      } else {
        selectedOptions.splice(optionIndex, 1);
      }

      return {
        ...prev,
        [questionId]: {
          ...currentAnswer,
          selectedOptions,
        },
      };
    });
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        textAnswer: text,
      },
    }));
  };

  const handleNextQuestion = () => {
    if (!quiz.questions) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!attempt || !quiz.questions) return;

    setLoading(true);
    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, answer]) => {
          const question = quiz.questions?.find(
            (q) => q.questionId === questionId
          );

          return {
            questionId,
            selectedOptions: answer.selectedOptions,
            textAnswer:
              question?.questionType === QuestionType.SHORT_ANSWER ||
              question?.questionType === QuestionType.ESSAY
                ? answer.textAnswer
                : undefined,
          };
        }
      );

      const result = await submitQuizAttempt({
        attemptId: attempt.attemptId,
        answers: formattedAnswers,
      });

      setQuizSubmitted(true);
      setQuizResult(result);
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit quiz. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLeft = () => {
    if (timeLeft === null) return "";

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading && !quizStarted) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => navigate(`/classrooms/${quiz.classroomId}`)}>
          Back to Classroom
        </Button>
      </Card>
    );
  }

  if (quizSubmitted && quizResult) {
    return (
      <Card className="p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Quiz Completed!</h3>
        <p className="text-gray-600 mb-2">Thank you for completing the quiz.</p>

        {quizResult.score !== null && quizResult.score !== undefined && (
          <div className="mb-4">
            <p className="text-lg font-medium">
              Your Score: {quizResult.score.toFixed(1)}%
            </p>
          </div>
        )}

        <Button onClick={() => navigate(`/classrooms/${quiz.classroomId}`)}>
          Back to Classroom
        </Button>
      </Card>
    );
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Questions</h3>
        <p className="text-gray-600 mb-4">
          This quiz doesn't have any questions yet.
        </p>
        <Button onClick={() => navigate(`/classrooms/${quiz.classroomId}`)}>
          Back to Classroom
        </Button>
      </Card>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </h3>
        {timeLeft !== null && (
          <div className="flex items-center text-sm font-medium">
            <Clock className="h-4 w-4 mr-1" />
            Time Left: {formatTimeLeft()}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3">
          {currentQuestion.questionText}
        </h4>

        {/* Multiple Choice or True/False */}
        {(currentQuestion.questionType === QuestionType.MULTIPLE_CHOICE ||
          currentQuestion.questionType === QuestionType.TRUE_FALSE) && (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <div
                key={option.optionId}
                className="flex items-center"
              >
                <input
                  type="radio"
                  id={option.optionId}
                  checked={answers[
                    currentQuestion.questionId
                  ]?.selectedOptions.includes(option.optionId)}
                  onChange={() =>
                    handleOptionSelect(
                      currentQuestion.questionId,
                      option.optionId
                    )
                  }
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                />
                <label
                  htmlFor={option.optionId}
                  className="ml-2 text-gray-700"
                >
                  {option.optionText}
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Multiple Answer */}
        {currentQuestion.questionType === QuestionType.MULTIPLE_ANSWER && (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <div
                key={option.optionId}
                className="flex items-center"
              >
                <input
                  type="checkbox"
                  id={option.optionId}
                  checked={answers[
                    currentQuestion.questionId
                  ]?.selectedOptions.includes(option.optionId)}
                  onChange={() =>
                    handleOptionSelect(
                      currentQuestion.questionId,
                      option.optionId
                    )
                  }
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label
                  htmlFor={option.optionId}
                  className="ml-2 text-gray-700"
                >
                  {option.optionText}
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Short Answer */}
        {currentQuestion.questionType === QuestionType.SHORT_ANSWER && (
          <Input
            value={answers[currentQuestion.questionId]?.textAnswer || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleTextAnswerChange(currentQuestion.questionId, e.target.value)
            }
            placeholder="Enter your answer"
          />
        )}

        {/* Essay */}
        {currentQuestion.questionType === QuestionType.ESSAY && (
          <Textarea
            value={answers[currentQuestion.questionId]?.textAnswer || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleTextAnswerChange(currentQuestion.questionId, e.target.value)
            }
            placeholder="Enter your answer"
            rows={6}
          />
        )}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <Button onClick={handleNextQuestion}>Next</Button>
        ) : (
          <Button
            onClick={handleSubmitQuiz}
            loading={loading}
            disabled={loading}
          >
            Submit Quiz
          </Button>
        )}
      </div>
    </Card>
  );
};

export default QuizTaker;
