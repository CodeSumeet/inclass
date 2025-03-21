import React, { useState, useEffect } from "react";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input";
import { toast } from "sonner";
import { createQuiz } from "@/services/api/quiz";
import { X } from "lucide-react";

// Create Textarea component since it's missing
const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
}: any) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
      />
    </div>
  );
};

// Create a custom DateTimeInput component
const DateTimeInput = ({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="datetime-local"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};

interface QuizCreateModalProps {
  classroomId: string;
  isOpen: boolean;
  onClose: () => void;
  onQuizCreated: () => void;
}

const QuizCreateModal: React.FC<QuizCreateModalProps> = ({
  classroomId,
  isOpen,
  onClose,
  onQuizCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(true);

  // Close modal when escape key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setInstructions("");
    setTimeLimit(undefined);
    setDueDate("");
    setError(null);
    setIsDraft(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (loading) return; // Prevent duplicate submissions

    setLoading(true);
    setError(null);

    try {
      // Create the quiz
      const quizData = {
        classroomId,
        title: title.trim(),
        description: description.trim() || undefined,
        instructions: instructions.trim() || undefined,
        timeLimit,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        isPublished: !isDraft,
      };

      await createQuiz(quizData);

      toast.success(
        `Quiz ${isDraft ? "saved as draft" : "created"} successfully!`
      );
      resetForm();
      onQuizCreated();
      onClose();
    } catch (error) {
      console.error("Error creating quiz:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create quiz. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create New Quiz</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 rounded-full p-0 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <Input
              label="Title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
              required
            />

            <Textarea
              label="Description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              placeholder="Provide a brief description of the quiz"
            />

            <Textarea
              label="Instructions"
              value={instructions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInstructions(e.target.value)
              }
              placeholder="Detailed instructions for students (optional)"
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Time Limit (minutes)"
                type="number"
                value={timeLimit !== undefined ? timeLimit.toString() : ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTimeLimit(
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                min={1}
                placeholder="Leave empty for no time limit"
              />

              <DateTimeInput
                label="Due Date"
                value={dueDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDueDate(e.target.value)
                }
              />
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                id="draft"
                checked={isDraft}
                onChange={(e) => setIsDraft(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="draft"
                className="text-sm text-gray-700"
              >
                Save as draft (won't be visible to students)
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
              >
                {isDraft ? "Save Draft" : "Create Quiz"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizCreateModal;
