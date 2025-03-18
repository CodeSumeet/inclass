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
    // Get the current user from auth store
    const user = useAuthStore.getState().user;

    if (!user) {
      return;
    }

    // Disconnect existing socket if any
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }

    // Create new socket connection
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

// Create a listener to initialize/disconnect socket when auth state changes
useAuthStore.subscribe((state, prevState) => {
  if (state.user && !prevState.user) {
    // User logged in
    useSocketStore.getState().initialize();
  } else if (!state.user && prevState.user) {
    // User logged out
    useSocketStore.getState().disconnect();
  }
});
