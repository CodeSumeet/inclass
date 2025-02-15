import { Router } from "express";
import * as UserController from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:userId", authenticate, UserController.getUserProfile);
router.put("/:userId", authenticate, UserController.updateUserProfile);
router.get(
  "/:userId/classrooms",
  authenticate,
  UserController.getUserClassrooms
);

export default router;
