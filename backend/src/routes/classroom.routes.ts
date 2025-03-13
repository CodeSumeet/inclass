import { Router } from "express";
import * as ClassroomController from "../controllers/classroom.controller";
import { authenticate } from "../middlewares/auth.middleware";
import * as AnnouncementController from "../controllers/announcement.controller";

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
router.delete(
  "/remove-student",
  authenticate,
  ClassroomController.removeStudent
);

router.post(
  "/:classroomId/announcements",
  authenticate,
  AnnouncementController.createAnnouncement
);

router.get(
  "/:classroomId/announcements",
  authenticate,
  AnnouncementController.getClassroomAnnouncements
);

router.delete(
  "/announcements/:announcementId",
  authenticate,
  AnnouncementController.deleteAnnouncement
);

export default router;
