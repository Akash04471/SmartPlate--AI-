import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

const app = express();

/**
 * 🔥 Node v24 compatibility fix
 * Disable keep-alive to prevent socket reset
 */
app.use((req, res, next) => {
  res.setHeader("Connection", "close");
  next();
});

app.use(cors());
app.use(express.json());

/**
 * Health check (use this for testing)
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * Auth routes
 */
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
