import { Router } from "express";
import * as ClassroomController from "../controllers/classroom.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticate, ClassroomController.createClassroom);
router.post("/join", authenticate, ClassroomController.joinClassroom);
router.get(
  "/user/:userId",
  authenticate,
  ClassroomController.getUserClassrooms
);
router.get(
  "/:classroomId",
  authenticate,
  ClassroomController.getClassroomDetails
);
router.delete("/delete", authenticate, ClassroomController.deleteClassroom);

export default router;
