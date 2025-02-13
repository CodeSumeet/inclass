import { auth } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import API from "./api";

const googleProvider = new GoogleAuthProvider();

export const loginWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUid = userCredential.user.uid;

    await API.post("/auth/sign-up", {
      firebaseUid,
      email,
      firstName,
      lastName,
    });

    return {
      user: userCredential.user,
      message: "User signed up successfully!",
    };
  } catch (error: any) {
    throw new Error(`Sign-up failed: ${error.message}`);
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const firebaseUid = user.uid;
    const email = user.email;
    const firstName = user.displayName?.split(" ")[0];
    const lastName = user.displayName?.split(" ")[1];

    const { data } = await API.get(
      `/auth/check-user-exists?firebaseUid=${firebaseUid}`
    );

    if (!data.exists) {
      await API.post("/auth/sign-up", {
        firebaseUid,
        email,
        firstName,
        lastName,
      });
    }

    return {
      user: result.user,
      message: "User signed in with Google!",
    };
  } catch (error: any) {
    throw new Error(`Google sign-in failed: ${error.message}`);
  }
};

export const logout = async () => {
  return signOut(auth);
};
