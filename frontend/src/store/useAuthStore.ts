import { create } from "zustand";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  signInWithGoogle,
  signUpWithEmail,
  loginWithEmail,
  logout,
} from "../services/authService";

// Define types
interface UserData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePic?: string;
}

interface AuthState {
  // State
  user: UserData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: FirebaseUser | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;

  // Auth methods
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
  // Initial state
  user: null,
  isLoading: true,
  error: null,

  // State setters
  setUser: (firebaseUser) => {
    if (!firebaseUser) {
      set({ user: null });
      return;
    }

    const userData: UserData = {
      userId: firebaseUser.uid,
      email: firebaseUser.email || "",
      firstName: firebaseUser.displayName?.split(" ")[0] || "",
      lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
      profilePic: firebaseUser.photoURL || undefined,
    };

    set({ user: userData });
  },

  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),

  // Auth methods
  loginWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await signInWithGoogle();

      if (!user) throw new Error("No user data returned");

      const userData: UserData = {
        userId: user.uid,
        email: user.email || "",
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        profilePic: user.photoURL || undefined,
      };

      set({ user: userData });
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

      const userData: UserData = {
        userId: user.uid,
        email: user.email || "",
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        profilePic: user.photoURL || undefined,
      };

      set({ user: userData });
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

      const userData: UserData = {
        userId: user.uid,
        email: user.email || "",
        firstName,
        lastName,
        profilePic: user.photoURL || undefined,
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

// Initialize auth state listener
auth.onAuthStateChanged((user) => {
  const store = useAuthStore.getState();
  store.setUser(user);
  store.setLoading(false);
});
