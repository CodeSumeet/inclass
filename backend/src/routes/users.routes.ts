import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserClassrooms,
  getUserEnrollments,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:userId", authenticate, getUserProfile);
router.put("/:userId", authenticate, updateUserProfile);
router.get("/:userId/classrooms", authenticate, getUserClassrooms);
router.get("/:userId/enrollments", authenticate, getUserEnrollments);

export default router;
