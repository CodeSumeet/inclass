import React, { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button/Button";
import {
  getQuizAttempts,
  getQuizAttempt,
  gradeEssayQuestion,
} from "@/services/api/quiz";
import { QuizAttempt, Answer, QuestionType } from "@/types/quiz.types";
import { format } from "date-fns";
import { toast } from "sonner";
import { Input } from "@/components/common/Input";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";

interface QuizResultsProps {
  quizId: string;
}

const QuizResults: React.FC<QuizResultsProps> = ({ quizId }) => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(
    null
  );
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(
    null
  );
  const [loadingAttempt, setLoadingAttempt] = useState(false);
  const [gradingAnswerId, setGradingAnswerId] = useState<string | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [savingGrade, setSavingGrade] = useState(false);

  useEffect(() => {
    const fetchAttempts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getQuizAttempts(quizId);
        setAttempts(data);
      } catch (error) {
        console.error("Error fetching quiz attempts:", error);
        setError("Failed to load quiz attempts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [quizId]);

  const handleExpandAttempt = async (attemptId: string) => {
    if (expandedAttemptId === attemptId) {
      setExpandedAttemptId(null);
      setSelectedAttempt(null);
      return;
    }

    setExpandedAttemptId(attemptId);
    setLoadingAttempt(true);

    try {
      const attempt = await getQuizAttempt(attemptId);
      setSelectedAttempt(attempt);
    } catch (error) {
      console.error("Error fetching attempt details:", error);
      toast.error("Failed to load attempt details");
    } finally {
      setLoadingAttempt(false);
    }
  };

  const handleGradeEssay = async (answerId: string, maxPoints: number) => {
    if (points < 0 || points > maxPoints) {
      toast.error(`Points must be between 0 and ${maxPoints}`);
      return;
    }

    setSavingGrade(true);
    try {
      await gradeEssayQuestion(answerId, points);

      // Refresh the attempt data
      if (expandedAttemptId) {
        const updatedAttempt = await getQuizAttempt(expandedAttemptId);
        setSelectedAttempt(updatedAttempt);

        // Also update the attempts list
        const updatedAttempts = attempts.map((attempt) =>
          attempt.attemptId === expandedAttemptId
            ? { ...attempt, score: updatedAttempt.score }
            : attempt
        );
        setAttempts(updatedAttempts);
      }

      setGradingAnswerId(null);
      toast.success("Answer graded successfully");
    } catch (error) {
      console.error("Error grading essay:", error);
      toast.error("Failed to grade essay");
    } finally {
      setSavingGrade(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading quiz results...</p>
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
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">
          No students have attempted this quiz yet.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quiz Results</h2>

      <div className="space-y-4">
        {attempts.map((attempt) => (
          <Card
            key={attempt.attemptId}
            className="overflow-hidden"
          >
            <div
              className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => handleExpandAttempt(attempt.attemptId)}
            >
              <div className="flex items-center">
                <div className="mr-4">
                  {attempt.user?.profilePic ? (
                    <img
                      src={attempt.user.profilePic}
                      alt={`${attempt.user.firstName} ${attempt.user.lastName}`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {attempt.user?.firstName} {attempt.user?.lastName}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      Submitted{" "}
                      {attempt.submittedAt
                        ? formatDate(attempt.submittedAt)
                        : "Not submitted"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                {attempt.score !== null && attempt.score !== undefined ? (
                  <div className="mr-4 text-lg font-medium">
                    {attempt.score.toFixed(1)}%
                  </div>
                ) : (
                  <div className="mr-4 text-sm text-gray-500">Not graded</div>
                )}
                {expandedAttemptId === attempt.attemptId ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {expandedAttemptId === attempt.attemptId && (
              <div className="border-t p-4 bg-gray-50">
                {loadingAttempt ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-gray-600">
                      Loading attempt details...
                    </p>
                  </div>
                ) : selectedAttempt ? (
                  <div className="space-y-6">
                    {selectedAttempt.quiz?.questions?.map(
                      (question: any, index: any) => {
                        const answer = selectedAttempt.answers.find(
                          (a) => a.questionId === question.questionId
                        );

                        return (
                          <div
                            key={question.questionId}
                            className="border-b pb-4 last:border-b-0 last:pb-0"
                          >
                            <div className="flex items-start mb-2">
                              <span className="font-medium text-gray-500 mr-2">
                                {index + 1}.
                              </span>
                              <div>
                                <h4 className="font-medium">
                                  {question.questionText}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {question.points}{" "}
                                  {question.points === 1 ? "point" : "points"}
                                </p>
                              </div>
                            </div>

                            {/* Answer display */}
                            <div className="ml-6">
                              {/* Multiple Choice or True/False */}
                              {(question.questionType ===
                                QuestionType.MULTIPLE_CHOICE ||
                                question.questionType ===
                                  QuestionType.TRUE_FALSE) && (
                                <div className="space-y-2">
                                  {question.options.map((option: any) => {
                                    const isSelected =
                                      answer?.selectedOptions.includes(
                                        option.optionId
                                      );
                                    const isCorrect = option.isCorrect;

                                    return (
                                      <div
                                        key={option.optionId}
                                        className={`flex items-center p-2 rounded ${
                                          isSelected && isCorrect
                                            ? "bg-green-50"
                                            : isSelected && !isCorrect
                                            ? "bg-red-50"
                                            : !isSelected && isCorrect
                                            ? "bg-blue-50"
                                            : ""
                                        }`}
                                      >
                                        {isSelected ? (
                                          isCorrect ? (
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                          ) : (
                                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                          )
                                        ) : (
                                          <div className="w-5 h-5 mr-2" />
                                        )}
                                        <span>{option.optionText}</span>
                                        {!isSelected && isCorrect && (
                                          <span className="ml-2 text-sm text-blue-500">
                                            (Correct answer)
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Multiple Answer */}
                              {question.questionType ===
                                QuestionType.MULTIPLE_ANSWER && (
                                <div className="space-y-2">
                                  {question.options.map((option: any) => {
                                    const isSelected =
                                      answer?.selectedOptions.includes(
                                        option.optionId
                                      );
                                    const isCorrect = option.isCorrect;

                                    return (
                                      <div
                                        key={option.optionId}
                                        className={`flex items-center p-2 rounded ${
                                          isSelected && isCorrect
                                            ? "bg-green-50"
                                            : isSelected && !isCorrect
                                            ? "bg-red-50"
                                            : !isSelected && isCorrect
                                            ? "bg-blue-50"
                                            : ""
                                        }`}
                                      >
                                        {isSelected ? (
                                          isCorrect ? (
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                          ) : (
                                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                          )
                                        ) : (
                                          <div className="w-5 h-5 mr-2" />
                                        )}
                                        <span>{option.optionText}</span>
                                        {!isSelected && isCorrect && (
                                          <span className="ml-2 text-sm text-blue-500">
                                            (Correct answer)
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Short Answer */}
                              {question.questionType ===
                                QuestionType.SHORT_ANSWER && (
                                <div>
                                  <div className="mb-2">
                                    <p className="text-sm font-medium text-gray-700">
                                      Student's Answer:
                                    </p>
                                    <div className="p-3 bg-white rounded border">
                                      {answer?.textAnswer ||
                                        "(No answer provided)"}
                                    </div>
                                  </div>

                                  <div className="mb-2">
                                    <p className="text-sm font-medium text-gray-700">
                                      Correct Answer:
                                    </p>
                                    <div className="p-3 bg-blue-50 rounded border border-blue-100">
                                      {question.options.find(
                                        (o: any) => o.isCorrect
                                      )?.optionText ||
                                        "(No correct answer provided)"}
                                    </div>
                                  </div>

                                  <div className="flex items-center mt-2">
                                    {answer?.isCorrect === true ? (
                                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    ) : answer?.isCorrect === false ? (
                                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                    ) : (
                                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                                    )}
                                    <span
                                      className={`text-sm ${
                                        answer?.isCorrect === true
                                          ? "text-green-600"
                                          : answer?.isCorrect === false
                                          ? "text-red-600"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {answer?.isCorrect === true
                                        ? `Correct (${answer.points} points)`
                                        : answer?.isCorrect === false
                                        ? `Incorrect (0 points)`
                                        : "Not graded yet"}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Essay */}
                              {question.questionType === QuestionType.ESSAY && (
                                <div>
                                  <div className="mb-2">
                                    <p className="text-sm font-medium text-gray-700">
                                      Student's Answer:
                                    </p>
                                    <div className="p-3 bg-white rounded border whitespace-pre-wrap">
                                      {answer?.textAnswer ||
                                        "(No answer provided)"}
                                    </div>
                                  </div>

                                  {gradingAnswerId === answer?.answerId ? (
                                    <div className="mt-4 p-3 bg-gray-100 rounded">
                                      <p className="text-sm font-medium mb-2">
                                        Grade Essay:
                                      </p>
                                      <div className="flex items-center">
                                        <Input
                                          type="number"
                                          value={points}
                                          onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>
                                          ) =>
                                            setPoints(
                                              parseInt(e.target.value) || 0
                                            )
                                          }
                                          min={0}
                                          max={question.points}
                                          className="w-24 mr-2"
                                        />
                                        <span className="text-sm text-gray-500 mr-4">
                                          / {question.points} points
                                        </span>
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleGradeEssay(
                                              answer.answerId,
                                              question.points
                                            )
                                          }
                                          loading={savingGrade}
                                          disabled={savingGrade}
                                        >
                                          <Save className="h-4 w-4 mr-1" /> Save
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            setGradingAnswerId(null)
                                          }
                                          className="ml-2"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between mt-2">
                                      <div className="flex items-center">
                                        {answer?.points !== null &&
                                        answer?.points !== undefined ? (
                                          <div className="flex items-center">
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                            <span className="text-sm text-green-600">
                                              Graded: {answer.points} /{" "}
                                              {question.points} points
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center">
                                            <Clock className="h-5 w-5 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-500">
                                              Not graded yet
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setGradingAnswerId(
                                            answer?.answerId || null
                                          );
                                          setPoints(answer?.points || 0);
                                        }}
                                      >
                                        {answer?.points !== null &&
                                        answer?.points !== undefined
                                          ? "Edit Grade"
                                          : "Grade"}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">
                    Failed to load attempt details. Please try again.
                  </p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizResults;
