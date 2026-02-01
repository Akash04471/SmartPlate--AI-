import http from "http";
import app from "./app.js";

const PORT = 5050; // 🔥 change from 5000

const server = http.createServer(app);

server.keepAliveTimeout = 0;
server.headersTimeout = 0;

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
