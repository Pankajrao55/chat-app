import { Server } from "socket.io";
import User from "../models/User.js";

// userId -> socketId map to track who is online
const userSocketMap = {};
let ioInstance = null;

export const getReceiverSocketId = (userId) => userSocketMap[userId];
export const getIO = () => ioInstance;

export const initSocket = (httpServer, clientUrl) => {
  const io = new Server(httpServer, {
    cors: {
      origin: clientUrl,
      credentials: true,
    },
  });
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;

      // Broadcast full online users list
      io.emit("getOnlineUsers", Object.keys(userSocketMap));

      // Persist online status
      User.findByIdAndUpdate(userId, { isOnline: true }).catch(() => {});
    }

    // Typing indicator events
    socket.on("typing", ({ receiverId, senderId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { senderId });
      }
    });

    socket.on("stopTyping", ({ receiverId, senderId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { senderId });
      }
    });

    // Message seen event (real-time read receipts)
    socket.on("messageSeen", ({ senderId, receiverId }) => {
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageSeenUpdate", { by: receiverId });
      }
    });

    socket.on("disconnect", async () => {
      console.log("Socket disconnected:", socket.id);
      if (userId && userId !== "undefined") {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        try {
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
        } catch (err) {
          console.error("Error updating lastSeen:", err.message);
        }
      }
    });
  });

  return io;
};
