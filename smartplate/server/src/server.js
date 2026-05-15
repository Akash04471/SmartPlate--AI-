import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { execSync } from "child_process";
import app from "./app.js";


const PORT = process.env.PORT || 5051;

const server = http.createServer(app);

// ── Port Guardianship ────────────────────────────────────────────────────────
const startServer = () => {
  try {
    if (process.platform === "win32") {
      try {
        execSync(`node scripts/clearPort.js ${PORT}`, { stdio: 'inherit' });
      } catch (e) {
        // Ignore if clearPort fails (e.g. no process found)
      }
    }
    
    server.listen(PORT, "0.0.0.0", () => {
      console.log("--------------------------------------------------");
      console.log(`🚀 SmartPlate API: http://127.0.0.1:${PORT}`);
      console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log("--------------------------------------------------");
    });
  } catch (err) {
    console.error("[FATAL] Server binding failed:", err);
    process.exit(1);
  }
};


// ── Error Handling ───────────────────────────────────────────────────────────
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`[FATAL] Port ${PORT} is already in use. Try starting again.`);
    process.exit(1);
  } else {
    console.error("[FATAL] Server Error:", error);
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[FATAL] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught Exception:", err);
  process.exit(1);
});

// ── Lifecycle Management ─────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n[SIGNAL] Received ${signal}. Closing SmartPlate server...`);
  server.close(() => {
    console.log("[STATUS] Server closed. Port released. Goodbye!");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("[ERROR] Forceful shutdown initiated.");
    process.exit(1);
  }, 5000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ── Initialization ───────────────────────────────────────────────────────────
startServer();

