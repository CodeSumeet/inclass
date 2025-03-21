import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import * as AssignmentController from "../controllers/assignment.controller";

const router = Router();

router.get("/:assignmentId", authenticate, AssignmentController.getAssignment);
router.post("/", authenticate, AssignmentController.createAssignment);
router.put(
  "/:assignmentId",
  authenticate,
  AssignmentController.updateAssignment
);
router.delete(
  "/:assignmentId",
  authenticate,
  AssignmentController.deleteAssignment
);
router.post(
  "/:assignmentId/attachments",
  authenticate,
  AssignmentController.addAssignmentAttachment
);

router.get(
  "/:assignmentId/submissions",
  authenticate,
  AssignmentController.getAssignmentSubmissions
);
router.get(
  "/:assignmentId/submissions/:studentId",
  authenticate,
  AssignmentController.getStudentSubmission
);
router.post(
  "/submissions",
  authenticate,
  AssignmentController.createSubmission
);
router.post(
  "/submissions/:submissionId/attachments",
  authenticate,
  AssignmentController.addSubmissionAttachment
);
router.post(
  "/submissions/:submissionId/grade",
  authenticate,
  AssignmentController.gradeSubmission
);

export default router;
