import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import {
  recordParticipantLeave,
  hasActiveParticipants,
} from "../utils/videoConferenceUtils";
import prisma from "../config/db";

export default (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error("Authentication error"));
    }

    socket.data.userId = userId;
    next();
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.data.userId);

    socket.on("join-meeting", (meetingId) => {
      socket.join(`meeting:${meetingId}`);

      socket.to(`meeting:${meetingId}`).emit("user-joined", {
        userId: socket.data.userId,
        timestamp: new Date(),
      });
    });

    socket.on("leave-meeting", async (meetingId) => {
      socket.leave(`meeting:${meetingId}`);

      await recordParticipantLeave(meetingId, socket.data.userId);

      socket.to(`meeting:${meetingId}`).emit("user-left", {
        userId: socket.data.userId,
        timestamp: new Date(),
      });

      const hasParticipants = await hasActiveParticipants(meetingId);
      if (!hasParticipants) {
        await prisma.videoConference.update({
          where: { id: meetingId },
          data: {
            status: "ENDED",
            endTime: new Date(),
          },
        });

        io.to(`meeting:${meetingId}`).emit("meeting-ended", {
          meetingId,
          reason: "All participants left",
          timestamp: new Date(),
        });
      }
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.data.userId);

      const activeParticipations =
        await prisma.videoConferenceParticipant.findMany({
          where: {
            userId: socket.data.userId,
            leaveTime: null,
          },
        });

      for (const participation of activeParticipations) {
        await recordParticipantLeave(
          participation.conferenceId,
          socket.data.userId
        );

        socket.to(`meeting:${participation.conferenceId}`).emit("user-left", {
          userId: socket.data.userId,
          timestamp: new Date(),
        });

        const hasParticipants = await hasActiveParticipants(
          participation.conferenceId
        );
        if (!hasParticipants) {
          await prisma.videoConference.update({
            where: { id: participation.conferenceId },
            data: {
              status: "ENDED",
              endTime: new Date(),
            },
          });

          io.to(`meeting:${participation.conferenceId}`).emit("meeting-ended", {
            meetingId: participation.conferenceId,
            reason: "All participants left",
            timestamp: new Date(),
          });
        }
      }
    });
  });

  return io;
};
