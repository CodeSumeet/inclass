import { create } from "zustand";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  signInWithGoogle,
  signUpWithEmail,
  loginWithEmail,
  logout,
} from "../services/authService";
import api from "../services/api";

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  setUser: (user: FirebaseUser | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isInitialized: false,
  error: null,

  setUser: async (firebaseUser) => {
    if (!firebaseUser) {
      set({ user: null, isInitialized: true, isLoading: false });
      return;
    }

    try {
      const response = await api.get(`/user/${firebaseUser.uid}`);

      const userData: User = {
        userId: firebaseUser.uid,
        email: firebaseUser.email || "",
        firstName: response.data.firstName,
        lastName: response.data.lastName,
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
        },
        isInitialized: true,
        isLoading: false,
      });
    }
  },

  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),

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
  store.setLoading(false);
});
