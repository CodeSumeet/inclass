import { Router } from "express";
import * as ClassroomController from "../controllers/classroom.controller";
import { authenticate } from "../middlewares/auth.middleware";
import * as AnnouncementController from "../controllers/announcement.controller";
import * as MaterialController from "../controllers/material.controller";

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

// Material routes
router.post(
  "/:classroomId/materials",
  authenticate,
  MaterialController.createMaterial
);

router.get(
  "/:classroomId/materials",
  authenticate,
  MaterialController.getClassroomMaterials
);

router.delete(
  "/materials/:materialId",
  authenticate,
  MaterialController.deleteMaterial
);

export default router;
