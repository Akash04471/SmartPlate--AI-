import express from "express";
import {
  signup,
  login,
  verifySignupOTP,
  verifyLogin2FA,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-signup", verifySignupOTP);
router.post("/login", login);
router.post("/verify-2fa", verifyLogin2FA);

export default router;
