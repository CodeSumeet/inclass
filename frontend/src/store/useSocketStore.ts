import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  initialize: () => void;
  disconnect: () => void;
  joinMeeting: (meetingId: string) => void;
  leaveMeeting: (meetingId: string) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,

  initialize: () => {
    const user = useAuthStore.getState().user;

    if (!user) {
      return;
    }

    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }

    const socketInstance = io(
      import.meta.env.VITE_API_URL || "http://localhost:5000",
      {
        auth: {
          userId: user.userId,
        },
      }
    );

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      set({ isConnected: true });
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      set({ isConnected: false });
    });

    set({ socket: socketInstance });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  joinMeeting: (meetingId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit("join-meeting", meetingId);
    }
  },

  leaveMeeting: (meetingId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit("leave-meeting", meetingId);
    }
  },
}));

useAuthStore.subscribe((state, prevState) => {
  if (state.user && !prevState.user) {
    useSocketStore.getState().initialize();
  } else if (!state.user && prevState.user) {
    useSocketStore.getState().disconnect();
  }
});
