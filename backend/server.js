import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";

import connectDB from "./config/db.js";
import { initSocket } from "./socket/socket.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

// Startup diagnostic: flags missing or still-placeholder keys immediately in
// the console, instead of failing silently later when a feature is used.
const checkEnvKey = (key) => {
  const value = process.env[key];
  if (!value || value.startsWith("PASTE_YOUR_") || value.startsWith("your_")) {
    console.warn(`⚠️  ${key} is missing or still a placeholder — related features will fail.`);
    return false;
  }
  return true;
};
["MONGO_URI", "JWT_SECRET", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "GEMINI_API_KEY"].forEach(checkEnvKey);

const app = express();
const httpServer = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Chat API is running" });
});

// Error handling middleware (e.g. multer file errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 5000;

initSocket(httpServer, CLIENT_URL);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
