import { Router } from "express";
import authRoutes from "./auth.routes";
import classroomRoutes from "./classroom.routes";
import userRoutes from "./users.routes";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Inclass API Running" });
});

router.use("/auth", authRoutes);
router.use("/classrooms", classroomRoutes);
router.use("/users", userRoutes);
export default router;
