import React, { useState } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input";
import {
  Quiz,
  Question,
  QuestionType,
  CreateQuestionDto,
} from "@/types/quiz.types";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createOption,
  updateOption,
  deleteOption,
  getQuiz,
} from "@/services/api/quiz";
import { Plus, Trash2, GripVertical, Check, X, Edit, Save } from "lucide-react";
import { toast } from "sonner";

// Create Textarea component since it's missing
const Textarea = ({ label, value, onChange, placeholder, rows = 3 }: any) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium">{label}</label>
      )}
      <textarea
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
};

interface QuizQuestionEditorProps {
  quiz: Quiz;
  onQuizUpdated: (quiz: Quiz) => void;
}

const QuizQuestionEditor: React.FC<QuizQuestionEditorProps> = ({
  quiz,
  onQuizUpdated,
}) => {
  const [questions, setQuestions] = useState<Question[]>(quiz.questions || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    questionType: QuestionType.MULTIPLE_CHOICE,
    points: 1,
  });
  const [newOptions, setNewOptions] = useState<
    { text: string; isCorrect: boolean }[]
  >([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ]);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editOptionText, setEditOptionText] = useState("");

  const handleAddQuestion = async () => {
    if (!newQuestion.questionText.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (
      (newQuestion.questionType === QuestionType.MULTIPLE_CHOICE ||
        newQuestion.questionType === QuestionType.MULTIPLE_ANSWER ||
        newQuestion.questionType === QuestionType.TRUE_FALSE) &&
      newOptions.filter((o) => o.text.trim()).length < 2
    ) {
      toast.error("At least two options are required");
      return;
    }

    if (
      (newQuestion.questionType === QuestionType.MULTIPLE_CHOICE ||
        newQuestion.questionType === QuestionType.TRUE_FALSE) &&
      !newOptions.some((o) => o.isCorrect)
    ) {
      toast.error("At least one option must be marked as correct");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const questionData: CreateQuestionDto = {
        quizId: quiz.quizId,
        questionText: newQuestion.questionText,
        questionType: newQuestion.questionType,
        points: newQuestion.points,
        orderIndex: questions.length,
      };

      // Create the question
      const createdQuestion = await createQuestion(questionData);

      // Create options if needed
      if (
        newQuestion.questionType === QuestionType.MULTIPLE_CHOICE ||
        newQuestion.questionType === QuestionType.MULTIPLE_ANSWER ||
        newQuestion.questionType === QuestionType.TRUE_FALSE
      ) {
        const validOptions = newOptions.filter((o) => o.text.trim());

        for (let i = 0; i < validOptions.length; i++) {
          await createOption({
            questionId: createdQuestion.questionId,
            optionText: validOptions[i].text,
            isCorrect: validOptions[i].isCorrect,
            orderIndex: i,
          });
        }
      } else if (newQuestion.questionType === QuestionType.SHORT_ANSWER) {
        // For short answer, create a single "correct answer" option
        if (newOptions[0]?.text) {
          await createOption({
            questionId: createdQuestion.questionId,
            optionText: newOptions[0].text,
            isCorrect: true,
            orderIndex: 0,
          });
        }
      }

      // Refresh the quiz data
      const updatedQuiz = await getQuiz(quiz.quizId, true);
      onQuizUpdated(updatedQuiz);
      setQuestions(updatedQuiz.questions || []);

      // Reset form
      setNewQuestion({
        questionText: "",
        questionType: QuestionType.MULTIPLE_CHOICE,
        points: 1,
      });
      setNewOptions([
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ]);

      toast.success("Question added successfully");
    } catch (error) {
      console.error("Error adding question:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add question. Please try again."
      );
      toast.error("Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this question? This action cannot be undone."
      )
    ) {
      try {
        await deleteQuestion(questionId);

        // Refresh the quiz data
        const updatedQuiz = await getQuiz(quiz.quizId, true);
        onQuizUpdated(updatedQuiz);
        setQuestions(updatedQuiz.questions || []);

        toast.success("Question deleted successfully");
      } catch (error) {
        console.error("Error deleting question:", error);
        toast.error("Failed to delete question");
      }
    }
  };

  const handleAddOption = () => {
    setNewOptions([...newOptions, { text: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (newOptions.length <= 2) {
      toast.error("At least two options are required");
      return;
    }

    const updatedOptions = [...newOptions];
    updatedOptions.splice(index, 1);
    setNewOptions(updatedOptions);
  };

  const handleOptionTextChange = (index: number, text: string) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index].text = text;
    setNewOptions(updatedOptions);
  };

  const handleOptionCorrectChange = (index: number, isCorrect: boolean) => {
    const updatedOptions = [...newOptions];

    // For multiple choice and true/false, only one option can be correct
    if (
      (newQuestion.questionType === QuestionType.MULTIPLE_CHOICE ||
        newQuestion.questionType === QuestionType.TRUE_FALSE) &&
      isCorrect
    ) {
      updatedOptions.forEach((option, i) => {
        option.isCorrect = i === index;
      });
    } else {
      updatedOptions[index].isCorrect = isCorrect;
    }

    setNewOptions(updatedOptions);
  };

  const handleEditOption = async (
    optionId: string,
    questionId: string,
    newText: string
  ) => {
    try {
      await updateOption(optionId, { optionText: newText });

      // Refresh the quiz data
      const updatedQuiz = await getQuiz(quiz.quizId, true);
      onQuizUpdated(updatedQuiz);
      setQuestions(updatedQuiz.questions || []);

      setEditingOptionId(null);
      setEditOptionText("");

      toast.success("Option updated successfully");
    } catch (error) {
      console.error("Error updating option:", error);
      toast.error("Failed to update option");
    }
  };

  const handleDeleteOption = async (optionId: string, questionId: string) => {
    // Find the question and check if it has more than 2 options
    const question = questions.find((q) => q.questionId === questionId);
    if (question && question.options.length <= 2) {
      toast.error("At least two options are required");
      return;
    }

    try {
      await deleteOption(optionId);

      // Refresh the quiz data
      const updatedQuiz = await getQuiz(quiz.quizId, true);
      onQuizUpdated(updatedQuiz);
      setQuestions(updatedQuiz.questions || []);

      toast.success("Option deleted successfully");
    } catch (error) {
      console.error("Error deleting option:", error);
      toast.error("Failed to delete option");
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        return "Multiple Choice";
      case QuestionType.MULTIPLE_ANSWER:
        return "Multiple Answer";
      case QuestionType.TRUE_FALSE:
        return "True/False";
      case QuestionType.SHORT_ANSWER:
        return "Short Answer";
      case QuestionType.ESSAY:
        return "Essay";
      default:
        return type;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quiz Questions</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Existing Questions */}
      {questions.length === 0 ? (
        <Card className="p-6 text-center mb-6">
          <p className="text-gray-500">
            No questions yet. Add your first question below.
          </p>
        </Card>
      ) : (
        <div className="space-y-4 mb-6">
          {questions.map((question, index) => (
            <Card
              key={question.questionId}
              className="p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-gray-500 mr-2">
                      {index + 1}.
                    </span>
                    <h3 className="font-medium">{question.questionText}</h3>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="mr-4">
                      {getQuestionTypeLabel(question.questionType)}
                    </span>
                    <span>
                      {question.points}{" "}
                      {question.points === 1 ? "point" : "points"}
                    </span>
                  </div>

                  {/* Options */}
                  {question.options.length > 0 && (
                    <div className="ml-6 space-y-2 mt-3">
                      {question.options.map((option) => (
                        <div
                          key={option.optionId}
                          className="flex items-center"
                        >
                          {editingOptionId === option.optionId ? (
                            <div className="flex items-center flex-grow">
                              <Input
                                value={editOptionText}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => setEditOptionText(e.target.value)}
                                className="flex-grow"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 text-green-600"
                                onClick={() =>
                                  handleEditOption(
                                    option.optionId,
                                    question.questionId,
                                    editOptionText
                                  )
                                }
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-1 text-red-600"
                                onClick={() => {
                                  setEditingOptionId(null);
                                  setEditOptionText("");
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div
                                className={`w-5 h-5 flex-shrink-0 border rounded-sm mr-2 flex items-center justify-center ${
                                  option.isCorrect
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "border-gray-300"
                                }`}
                              >
                                {option.isCorrect && (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                              <span className="flex-grow">
                                {option.optionText}
                              </span>
                              <div className="flex items-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600"
                                  onClick={() => {
                                    setEditingOptionId(option.optionId);
                                    setEditOptionText(option.optionText);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() =>
                                    handleDeleteOption(
                                      option.optionId,
                                      question.questionId
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => handleDeleteQuestion(question.questionId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Question Form */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Add New Question</h3>
        <div className="space-y-4">
          <Textarea
            label="Question Text"
            value={newQuestion.questionText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNewQuestion({ ...newQuestion, questionText: e.target.value })
            }
            placeholder="Enter your question here"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Question Type
              </label>
              <select
                value={newQuestion.questionType}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    questionType: e.target.value as QuestionType,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={QuestionType.MULTIPLE_CHOICE}>
                  Multiple Choice
                </option>
                <option value={QuestionType.MULTIPLE_ANSWER}>
                  Multiple Answer
                </option>
                <option value={QuestionType.TRUE_FALSE}>True/False</option>
                <option value={QuestionType.SHORT_ANSWER}>Short Answer</option>
                <option value={QuestionType.ESSAY}>Essay</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Points</label>
              <Input
                type="number"
                value={newQuestion.points}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewQuestion({
                    ...newQuestion,
                    points: parseInt(e.target.value) || 1,
                  })
                }
                // ... continuing from previous code

                min={1}
              />
            </div>
          </div>

          {/* Options for Multiple Choice, Multiple Answer, and True/False */}
          {(newQuestion.questionType === QuestionType.MULTIPLE_CHOICE ||
            newQuestion.questionType === QuestionType.MULTIPLE_ANSWER ||
            newQuestion.questionType === QuestionType.TRUE_FALSE) && (
            <div>
              <label className="block mb-2 text-sm font-medium">Options</label>
              <div className="space-y-2">
                {newOptions.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center"
                  >
                    <div className="flex-shrink-0 mr-2">
                      {newQuestion.questionType ===
                        QuestionType.MULTIPLE_CHOICE ||
                      newQuestion.questionType === QuestionType.TRUE_FALSE ? (
                        <input
                          type="radio"
                          checked={option.isCorrect}
                          onChange={() =>
                            handleOptionCorrectChange(index, true)
                          }
                          className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) =>
                            handleOptionCorrectChange(index, e.target.checked)
                          }
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      )}
                    </div>
                    <Input
                      value={option.text}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleOptionTextChange(index, e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      className="flex-grow"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-red-500"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Correct Answer for Short Answer */}
          {newQuestion.questionType === QuestionType.SHORT_ANSWER && (
            <div>
              <label className="block mb-2 text-sm font-medium">
                Correct Answer
              </label>
              <Input
                value={newOptions[0]?.text || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleOptionTextChange(0, e.target.value)
                }
                placeholder="Enter the correct answer"
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleAddQuestion}
              loading={loading}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Question
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizQuestionEditor;
