import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import * as AnalyticsController from "../controllers/anaytics.controller";

const router = Router();

router.post("/activity", authenticate, AnalyticsController.logActivity);

router.get(
  "/classroom/:classroomId",
  authenticate,
  AnalyticsController.getClassroomAnalytics
);

router.get(
  "/classroom/:classroomId/user/:userId/engagement",
  authenticate,
  AnalyticsController.getUserEngagement
);

router.get(
  "/classroom/:classroomId/user/:userId/performance",
  authenticate,
  AnalyticsController.getUserPerformance
);

router.get(
  "/teacher/dashboard",
  authenticate,
  AnalyticsController.getTeacherDashboardStats
);

router.get(
  "/student/dashboard",
  authenticate,
  AnalyticsController.getStudentDashboardStats
);

export default router;
