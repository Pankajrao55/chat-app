import express from "express";
import {
  getMessages,
  sendMessage,
  sendSticker,
  deleteMessage,
  searchMessages,
  markDelivered,
  getUnreadCounts,
  translateMessage,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/unread-counts", protect, getUnreadCounts);
router.get("/:id", protect, getMessages);
router.get("/:id/search", protect, searchMessages);
router.post("/:id", protect, upload.single("media"), sendMessage);
router.post("/:id/sticker", protect, sendSticker);
router.post("/:messageId/translate", protect, translateMessage);
router.put("/:id/delivered", protect, markDelivered);
router.delete("/:messageId", protect, deleteMessage);

export default router;
