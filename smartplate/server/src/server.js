import "dotenv/config";
import http from "http";
import app from "./app.js";
import { env } from './config/env.js'; 

const PORT = process.env.PORT || 5050;

const server = http.createServer(app);

server.keepAliveTimeout = 0;
server.headersTimeout = 0;

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
