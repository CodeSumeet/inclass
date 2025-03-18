import prisma from "../config/db";

/**
 * Records a participant leaving a meeting
 */
export const recordParticipantLeave = async (
  conferenceId: string,
  userId: string
) => {
  try {
    await prisma.videoConferenceParticipant.updateMany({
      where: {
        conferenceId,
        userId,
        leaveTime: null,
      },
      data: {
        leaveTime: new Date(),
      },
    });
  } catch (error) {
    console.error("Error recording participant leave:", error);
  }
};

/**
 * Checks if a meeting has any active participants
 */
export const hasActiveParticipants = async (
  conferenceId: string
): Promise<boolean> => {
  const activeParticipants = await prisma.videoConferenceParticipant.count({
    where: {
      conferenceId,
      leaveTime: null,
    },
  });

  return activeParticipants > 0;
};
