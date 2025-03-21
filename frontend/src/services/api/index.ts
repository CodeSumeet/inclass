import axios from "axios";
import { auth } from "../../config/firebase";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
export * from "./auth";
export * from "./user";
export * from "./classroom";
export * from "./announcement";
export * from "./material";
export * from "./assignment";
export * from "./quiz";
