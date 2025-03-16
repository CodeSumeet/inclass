import { User } from "./user.types";

export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  MULTIPLE_ANSWER = "MULTIPLE_ANSWER",
  TRUE_FALSE = "TRUE_FALSE",
  SHORT_ANSWER = "SHORT_ANSWER",
  ESSAY = "ESSAY",
}

export interface Option {
  optionId: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface Question {
  questionId: string;
  quizId: string;
  questionText: string;
  questionType: QuestionType;
  points: number;
  orderIndex: number;
  options: Option[];
}

export interface Quiz {
  quizId: string;
  title: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  dueDate?: string;
  classroomId: string;
  isPublished: boolean;
  questions?: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  answerId: string;
  attemptId: string;
  questionId: string;
  selectedOptions: string[];
  textAnswer?: string;
  isCorrect?: boolean;
  points?: number;
}

export interface QuizAttempt {
  attemptId: string;
  quizId: string;
  userId: string;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  answers: Answer[];
  user?: User;
  quiz?: Quiz;
}

export interface CreateQuizDto {
  title: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  dueDate?: string;
  classroomId: string;
  isPublished?: boolean;
}

export interface CreateQuestionDto {
  quizId: string;
  questionText: string;
  questionType: QuestionType;
  points?: number;
  options?: CreateOptionDto[];
  orderIndex: number;
}

export interface CreateOptionDto {
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface SubmitQuizDto {
  attemptId: string;
  answers: {
    questionId: string;
    selectedOptions?: string[];
    textAnswer?: string;
  }[];
}
