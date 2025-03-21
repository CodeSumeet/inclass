import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as QuizService from "../services/quiz.service";

export const getClassroomQuizzes = asyncHandler(
  async (req: Request, res: Response) => {
    const { classroomId } = req.params;
    const quizzes = await QuizService.getClassroomQuizzes(classroomId);
    res.status(200).json(quizzes);
  }
);

export const getQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const includeQuestions = req.query.includeQuestions === "true";
  const quiz = await QuizService.getQuiz(quizId, includeQuestions);

  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  res.status(200).json(quiz);
});

export const createQuiz = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    description,
    instructions,
    timeLimit,
    dueDate,
    classroomId,
    isPublished,
    questions = [],
  } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const quiz = await QuizService.createQuiz(userId, {
    title,
    description,
    instructions,
    timeLimit: timeLimit ? Number(timeLimit) : undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    classroomId,
    isPublished,
    questions,
  });

  res.status(201).json(quiz);
});

export const updateQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const { title, description, instructions, timeLimit, dueDate, isPublished } =
    req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const quiz = await QuizService.updateQuiz(userId, quizId, {
    title,
    description,
    instructions,
    timeLimit: timeLimit ? Number(timeLimit) : undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    isPublished,
  });

  res.status(200).json(quiz);
});

export const deleteQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await QuizService.deleteQuiz(userId, quizId);
  res.status(200).json(result);
});

export const createQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    const { quizId, questionText, questionType, points, options, orderIndex } =
      req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const question = await QuizService.createQuestion(userId, {
      quizId,
      questionText,
      questionType,
      points: points ? Number(points) : undefined,
      options,
      orderIndex: Number(orderIndex),
    });

    res.status(201).json(question);
  }
);

export const updateQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    const { questionId } = req.params;
    const { questionText, questionType, points, orderIndex } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const question = await QuizService.updateQuestion(userId, questionId, {
      questionText,
      questionType,
      points: points ? Number(points) : undefined,
      orderIndex: orderIndex ? Number(orderIndex) : undefined,
    });

    res.status(200).json(question);
  }
);

export const deleteQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    const { questionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await QuizService.deleteQuestion(userId, questionId);
    res.status(200).json(result);
  }
);

export const createOption = asyncHandler(
  async (req: Request, res: Response) => {
    const { questionId, optionText, isCorrect, orderIndex } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const option = await QuizService.createOption(userId, {
      questionId,
      optionText,
      isCorrect: Boolean(isCorrect),
      orderIndex: Number(orderIndex),
    });

    res.status(201).json(option);
  }
);

export const updateOption = asyncHandler(
  async (req: Request, res: Response) => {
    const { optionId } = req.params;
    const { optionText, isCorrect, orderIndex } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const option = await QuizService.updateOption(userId, optionId, {
      optionText,
      isCorrect: isCorrect !== undefined ? Boolean(isCorrect) : undefined,
      orderIndex: orderIndex ? Number(orderIndex) : undefined,
    });

    res.status(200).json(option);
  }
);

export const deleteOption = asyncHandler(
  async (req: Request, res: Response) => {
    const { optionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await QuizService.deleteOption(userId, optionId);
    res.status(200).json(result);
  }
);

export const startQuizAttempt = asyncHandler(
  async (req: Request, res: Response) => {
    const { quizId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const attempt = await QuizService.startQuizAttempt(userId, quizId);
    res.status(201).json(attempt);
  }
);

export const submitQuizAttempt = asyncHandler(
  async (req: Request, res: Response) => {
    const { attemptId, answers } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await QuizService.submitQuizAttempt(
      userId,
      attemptId,
      answers
    );
    res.status(200).json(result);
  }
);

export const getQuizAttempt = asyncHandler(
  async (req: Request, res: Response) => {
    const { attemptId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const attempt = await QuizService.getQuizAttempt(userId, attemptId);
    res.status(200).json(attempt);
  }
);

export const getQuizAttempts = asyncHandler(
  async (req: Request, res: Response) => {
    const { quizId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const attempts = await QuizService.getQuizAttempts(userId, quizId);
    res.status(200).json(attempts);
  }
);

export const gradeEssayQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    const { answerId } = req.params;
    const { points } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await QuizService.gradeEssayQuestion(
      userId,
      answerId,
      Number(points)
    );

    res.status(200).json(result);
  }
);
