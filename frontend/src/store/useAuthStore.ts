import { create } from "zustand";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  signInWithGoogle,
  signUpWithEmail,
  loginWithEmail,
  logout,
} from "../services/api/auth";
import api from "../services/api";
import { User, UpdateProfileData } from "../types/user.types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  setUser: (user: FirebaseUser | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  updateProfilePicture: (url: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: true,
  isInitialized: false,
  error: null,

  updateProfilePicture: async (url: string) => {
    try {
      const user = get().user;
      if (!user) throw new Error("No user logged in");

      const response = await api.put(`/users/${user.userId}`, {
        profilePic: url,
      });

      set({ user: { ...user, profilePic: response.data.profilePic } });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  setUser: async (firebaseUser) => {
    if (!firebaseUser) {
      set({ user: null, isInitialized: true, isLoading: false });
      return;
    }

    try {
      const response = await api.get(`/users/${firebaseUser.uid}`);

      const userData: User = {
        userId: firebaseUser.uid,
        email: firebaseUser.email || "",
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        profilePic: response.data.profilePic,
      };

      set({ user: userData, isInitialized: true, isLoading: false });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      set({
        user: {
          userId: firebaseUser.uid,
          email: firebaseUser.email || "",
          firstName: "",
          lastName: "",
          profilePic: "",
        },
        isInitialized: true,
        isLoading: false,
      });
    }
  },

  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),

  updateProfile: async (data: UpdateProfileData) => {
    try {
      const user = get().user;
      if (!user) throw new Error("No user logged in");

      const response = await api.put(`/users/${user.userId}`, data);
      set({ user: { ...user, ...response.data } });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  loginWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await signInWithGoogle();

      if (!user) throw new Error("No user data returned");
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithEmail: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await loginWithEmail(email, password);

      if (!user) throw new Error("No user data returned");
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signUpWithEmail: async (email, password, firstName, lastName) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await signUpWithEmail(
        email,
        password,
        firstName,
        lastName
      );

      if (!user) throw new Error("No user data returned");

      const userData: User = {
        userId: user.uid,
        email: user.email || "",
        firstName,
        lastName,
      };

      set({ user: userData });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await logout();
      set({ user: null });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

auth.onAuthStateChanged((user) => {
  const store = useAuthStore.getState();
  store.setUser(user);
});
