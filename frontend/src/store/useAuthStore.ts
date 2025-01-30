import { create } from "zustand";
import { auth } from "../config/firebase";
import { User, onAuthStateChanged } from "firebase/auth";

type AuthState = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
}));

onAuthStateChanged(auth, (user) => {
  useAuthStore.getState().setUser(user);
});
