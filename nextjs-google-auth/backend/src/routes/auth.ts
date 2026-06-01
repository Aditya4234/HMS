import { Router } from "express";
import {
  googleLogin,
  refreshTokenHandler,
  logout,
  getMe,
} from "../controllers/authController";
import { authLimiter } from "../middleware/rateLimit";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/google", authLimiter, googleLogin);
router.post("/refresh", authLimiter, refreshTokenHandler);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

export default router;
