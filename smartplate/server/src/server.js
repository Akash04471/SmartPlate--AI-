import http from "http";
import { execSync } from "child_process";
import app from "./app.js";

const PORT = process.env.PORT || 5051;

const server = http.createServer(app);

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

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
server.listen(PORT, "0.0.0.0", () => {
  console.log("--------------------------------------------------");
  console.log(`🚀 SmartPlate API: http://127.0.0.1:${PORT}`);
  console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log("--------------------------------------------------");
});
