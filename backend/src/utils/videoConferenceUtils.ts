import prisma from "../config/db";

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
