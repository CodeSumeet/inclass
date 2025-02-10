import { Router } from "express";
import { checkUserExists, signUp } from "../controllers/auth.controller";

const router = Router();

router.post("/sign-up", signUp);
router.get("/check-user-exists", checkUserExists);

export default router;
