import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import * as VideoConferenceController from "../controllers/videoConference.controller";

const router = Router();

router.post(
  "/classroom/:classroomId/meeting",
  authenticate,
  VideoConferenceController.createMeeting
);

router.get(
  "/classroom/:classroomId/meetings",
  authenticate,
  VideoConferenceController.getClassroomMeetings
);

router.post(
  "/meeting/:meetingId/join",
  authenticate,
  VideoConferenceController.joinMeeting
);

router.post(
  "/meeting/:meetingId/end",
  authenticate,
  VideoConferenceController.endMeeting
);

export default router;
