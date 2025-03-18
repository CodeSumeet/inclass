import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = "https://api.daily.co/v1";

/**
 * Creates a new video conference room
 */
export const createRoom = async (
  classroomId: string,
  name: string,
  expiryMinutes = 60
) => {
  try {
    // Calculate expiry time (default: 60 minutes from now)
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

/**
 * Creates a meeting token for a participant
 */
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
