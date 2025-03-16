import API from "@/services/api";
import {
  Quiz,
  Question,
  Option,
  QuizAttempt,
  CreateQuizDto,
  CreateQuestionDto,
  CreateOptionDto,
  SubmitQuizDto,
} from "@/types/quiz.types";

// Quiz APIs
export const getClassroomQuizzes = async (
  classroomId: string
): Promise<Quiz[]> => {
  const response = await API.get(`/quizzes/classroom/${classroomId}`);
  return response.data;
};

export const getQuiz = async (
  quizId: string,
  includeQuestions: boolean = false
): Promise<Quiz> => {
  const response = await API.get(
    `/quizzes/${quizId}?includeQuestions=${includeQuestions}`
  );
  return response.data;
};

export const createQuiz = async (data: CreateQuizDto): Promise<Quiz> => {
  const response = await API.post("/quizzes", data);
  return response.data;
};

export const updateQuiz = async (
  quizId: string,
  data: Partial<CreateQuizDto>
): Promise<Quiz> => {
  const response = await API.put(`/quizzes/${quizId}`, data);
  return response.data;
};

export const deleteQuiz = async (quizId: string): Promise<void> => {
  await API.delete(`/quizzes/${quizId}`);
};

// Question APIs
export const createQuestion = async (
  data: CreateQuestionDto
): Promise<Question> => {
  const response = await API.post("/quizzes/questions", data);
  return response.data;
};

export const updateQuestion = async (
  questionId: string,
  data: Partial<CreateQuestionDto>
): Promise<Question> => {
  const response = await API.put(`/quizzes/questions/${questionId}`, data);
  return response.data;
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  await API.delete(`/quizzes/questions/${questionId}`);
};

// Option APIs
export const createOption = async (data: CreateOptionDto): Promise<Option> => {
  const response = await API.post("/quizzes/options", data);
  return response.data;
};

export const updateOption = async (
  optionId: string,
  data: Partial<CreateOptionDto>
): Promise<Option> => {
  const response = await API.put(`/quizzes/options/${optionId}`, data);
  return response.data;
};

export const deleteOption = async (optionId: string): Promise<void> => {
  await API.delete(`/quizzes/options/${optionId}`);
};

// Quiz Attempt APIs
export const startQuizAttempt = async (
  quizId: string
): Promise<QuizAttempt> => {
  const response = await API.post("/quizzes/attempts/start", { quizId });
  return response.data;
};

export const submitQuizAttempt = async (
  data: SubmitQuizDto
): Promise<QuizAttempt> => {
  const response = await API.post("/quizzes/attempts/submit", data);
  return response.data;
};

export const getQuizAttempt = async (
  attemptId: string
): Promise<QuizAttempt> => {
  const response = await API.get(`/quizzes/attempts/${attemptId}`);
  return response.data;
};

export const getQuizAttempts = async (
  quizId: string
): Promise<QuizAttempt[]> => {
  const response = await API.get(`/quizzes/${quizId}/attempts`);
  return response.data;
};

export const gradeEssayQuestion = async (
  answerId: string,
  points: number
): Promise<void> => {
  await API.post(`/quizzes/answers/${answerId}/grade`, { points });
};
