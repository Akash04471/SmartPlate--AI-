import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", authenticate, (req, res) => {
  res.json({ userId: req.user.userId });
});

export default router;
