import axios from "axios";
import dotenv from "dotenv";
import prisma from "../config/db";
import { sendMeetingStartedEmail } from "./email.service";

dotenv.config();

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = "https://api.daily.co/v1";

export const createRoom = async (
  classroomId: string,
  name: string,
  expiryMinutes = 60
) => {
  try {
    const exp = Math.floor(Date.now() / 1000) + expiryMinutes * 60;

    const response = await axios.post(
      `${DAILY_API_URL}/rooms`,
      {
        name: `classroom-${classroomId}-${Date.now()}`,
        properties: {
          exp,
          enable_chat: true,
          enable_screenshare: true,
          enable_hand_raising: true,
          start_video_off: true,
          start_audio_off: false,
          owner_only_broadcast: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating Daily.co room:",
      error.response?.data || error.message
    );
    throw new Error(`Failed to create video conference room: ${error.message}`);
  }
};

export const createMeetingToken = async (
  roomName: string,
  participantName: string,
  userId: string,
  isOwner: boolean
) => {
  try {
    const response = await axios.post(
      `${DAILY_API_URL}/meeting-tokens`,
      {
        properties: {
          room_name: roomName,
          user_name: participantName,
          user_id: userId,
          is_owner: isOwner,
          enable_screenshare: true,
          start_video_off: true,
          start_audio_off: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating Daily.co token:",
      error.response?.data || error.message
    );
    throw new Error(`Failed to create meeting token: ${error.message}`);
  }
};

export const createVideoConference = async (
  classroomId: string,
  userId: string
) => {
  try {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const dailyRoom = await createRoom(classroomId, `classroom-${classroomId}`);

    const conference = await prisma.videoConference.create({
      data: {
        classroomId,
        createdById: userId,
        status: "ACTIVE",
        startTime: new Date(),
        roomUrl: dailyRoom.url,
        roomName: dailyRoom.name,
      },
    });

    await prisma.videoConferenceParticipant.create({
      data: {
        conferenceId: conference.id,
        userId,
        joinTime: new Date(),
      },
    });

    const tokenData = await createMeetingToken(
      dailyRoom.name,
      `${user.firstName} ${user.lastName}`,
      userId,
      true
    );

    sendMeetingStartedEmail(classroomId, conference.id, {
      firstName: user.firstName,
      lastName: user.lastName,
    }).catch((err) => console.error("Failed to send meeting emails:", err));

    return {
      meeting: conference,
      token: tokenData.token,
      url: dailyRoom.url,
    };
  } catch (error: any) {
    console.error("Error creating video conference:", error);
    throw new Error(`Failed to create video conference: ${error.message}`);
  }
};

export const getClassroomMeetings = async (classroomId: string) => {
  return prisma.videoConference.findMany({
    where: {
      classroomId,
    },
    orderBy: {
      startTime: "desc",
    },
  });
};

export const getMeetingDetails = async (meetingId: string, userId: string) => {
  const meeting = await prisma.videoConference.findUnique({
    where: { id: meetingId },
    include: {
      classroom: {
        select: {
          name: true,
          ownerId: true,
        },
      },
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      firstName: true,
      lastName: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.videoConferenceParticipant.create({
    data: {
      conferenceId: meetingId,
      userId,
      joinTime: new Date(),
    },
  });

  const isOwner =
    meeting.createdById === userId || meeting.classroom.ownerId === userId;

  const tokenData = await createMeetingToken(
    meeting.roomName,
    `${user.firstName} ${user.lastName}`,
    userId,
    isOwner
  );

  return {
    meeting,
    token: tokenData.token,
  };
};

export const endMeeting = async (meetingId: string, userId: string) => {
  const meeting = await prisma.videoConference.findUnique({
    where: { id: meetingId },
    include: {
      classroom: true,
    },
  });

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  const isOwner =
    meeting.createdById === userId || meeting.classroom.ownerId === userId;

  if (!isOwner) {
    throw new Error(
      "Only the meeting creator or classroom owner can end the meeting"
    );
  }

  await prisma.videoConferenceParticipant.updateMany({
    where: {
      conferenceId: meetingId,
      leaveTime: null,
    },
    data: {
      leaveTime: new Date(),
    },
  });

  return prisma.videoConference.update({
    where: { id: meetingId },
    data: {
      status: "ENDED",
      endTime: new Date(),
    },
  });
};

export const leaveMeeting = async (meetingId: string, userId: string) => {
  return prisma.videoConferenceParticipant.updateMany({
    where: {
      conferenceId: meetingId,
      userId,
      leaveTime: null,
    },
    data: {
      leaveTime: new Date(),
    },
  });
};
