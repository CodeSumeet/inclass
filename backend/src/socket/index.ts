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
      origin: "*", // Accept requests from any origin
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket.io middleware for authentication
  io.use(async (socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error("Authentication error"));
    }

    // Store the user ID in the socket
    socket.data.userId = userId;
    next();
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.data.userId);

    // Handle joining a meeting room
    socket.on("join-meeting", (meetingId) => {
      socket.join(`meeting:${meetingId}`);

      // Notify others that a user has joined
      socket.to(`meeting:${meetingId}`).emit("user-joined", {
        userId: socket.data.userId,
        timestamp: new Date(),
      });
    });

    // Handle leaving a meeting room
    socket.on("leave-meeting", async (meetingId) => {
      socket.leave(`meeting:${meetingId}`);

      // Record the participant leaving
      await recordParticipantLeave(meetingId, socket.data.userId);

      // Notify others that a user has left
      socket.to(`meeting:${meetingId}`).emit("user-left", {
        userId: socket.data.userId,
        timestamp: new Date(),
      });

      // Check if there are any participants left
      const hasParticipants = await hasActiveParticipants(meetingId);
      if (!hasParticipants) {
        // Auto-end the meeting if everyone has left
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

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.data.userId);

      // Find active meetings for this user
      const activeParticipations =
        await prisma.videoConferenceParticipant.findMany({
          where: {
            userId: socket.data.userId,
            leaveTime: null,
          },
        });

      // Record leave time for all active participations
      for (const participation of activeParticipations) {
        await recordParticipantLeave(
          participation.conferenceId,
          socket.data.userId
        );

        // Notify others that the user has left
        socket.to(`meeting:${participation.conferenceId}`).emit("user-left", {
          userId: socket.data.userId,
          timestamp: new Date(),
        });

        // Check if there are any participants left
        const hasParticipants = await hasActiveParticipants(
          participation.conferenceId
        );
        if (!hasParticipants) {
          // Auto-end the meeting if everyone has left
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
