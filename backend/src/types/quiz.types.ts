export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  MULTIPLE_ANSWER = "MULTIPLE_ANSWER",
  TRUE_FALSE = "TRUE_FALSE",
  SHORT_ANSWER = "SHORT_ANSWER",
  ESSAY = "ESSAY",
}

export interface CreateQuizDto {
  title: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  dueDate?: Date;
  classroomId: string;
  isPublished?: boolean;
}

export interface UpdateQuizDto {
  title?: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  dueDate?: Date;
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

export interface UpdateQuestionDto {
  questionText?: string;
  questionType?: QuestionType;
  points?: number;
  orderIndex?: number;
}

export interface CreateOptionDto {
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface UpdateOptionDto {
  optionText?: string;
  isCorrect?: boolean;
  orderIndex?: number;
}

export interface SubmitQuizDto {
  quizId: string;
  answers: {
    questionId: string;
    selectedOptions?: string[];
    textAnswer?: string;
  }[];
}
