import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import * as QuizController from "../controllers/quiz.controller";

const router = Router();

// Quiz routes
router.get(
  "/classroom/:classroomId",
  authenticate,
  QuizController.getClassroomQuizzes
);
router.get("/:quizId", authenticate, QuizController.getQuiz);
router.post("/", authenticate, QuizController.createQuiz);
router.put("/:quizId", authenticate, QuizController.updateQuiz);
router.delete("/:quizId", authenticate, QuizController.deleteQuiz);

// Question routes
router.post("/questions", authenticate, QuizController.createQuestion);
router.put(
  "/questions/:questionId",
  authenticate,
  QuizController.updateQuestion
);
router.delete(
  "/questions/:questionId",
  authenticate,
  QuizController.deleteQuestion
);

// Option routes
router.post("/options", authenticate, QuizController.createOption);
router.put("/options/:optionId", authenticate, QuizController.updateOption);
router.delete("/options/:optionId", authenticate, QuizController.deleteOption);

// Quiz attempt routes
router.post("/attempts/start", authenticate, QuizController.startQuizAttempt);
router.post("/attempts/submit", authenticate, QuizController.submitQuizAttempt);
router.get("/attempts/:attemptId", authenticate, QuizController.getQuizAttempt);
router.get("/:quizId/attempts", authenticate, QuizController.getQuizAttempts);
router.post(
  "/answers/:answerId/grade",
  authenticate,
  QuizController.gradeEssayQuestion
);

export default router;
