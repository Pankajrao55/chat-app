import Message from "../models/Message.js";
import User from "../models/User.js";
import { getIO, getReceiverSocketId } from "../socket/socket.js";
import { SIZE_LIMITS, getMediaType, getCloudinaryResourceType } from "../middleware/uploadMiddleware.js";
import cloudinary from "../config/cloudinary.js";
import { translateText, transcribeAudio } from "../services/geminiService.js";

// Uploads an in-memory buffer to Cloudinary using an upload stream (no temp
// files on disk — the buffer is piped straight to Cloudinary's servers).
const uploadBufferToCloudinary = (buffer, resourceType, folder, originalName = "") => {
  return new Promise((resolve, reject) => {
    const options = { resource_type: resourceType, folder };
    // For raw files (documents/zips) keep the original filename so downloads
    // look right, instead of Cloudinary's random public_id.
    if (resourceType === "raw" && originalName) {
      options.use_filename = true;
      options.unique_filename = true;
      options.filename_override = originalName;
    }
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
};

export const getMessages = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    // Mark messages sent TO me as seen
    await Message.updateMany(
      { sender: otherUserId, receiver: myId, status: { $ne: "seen" } },
      { status: "seen", seenAt: new Date() }
    );

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Get messages error:", error.message);
    res.status(500).json({ message: "Server error fetching messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let media = { url: "", publicId: "", type: "", size: 0 };

    if (req.file) {
      const mediaType = getMediaType(req.file.mimetype);
      if (!mediaType) {
        return res.status(400).json({ message: "Unsupported file type" });
      }

      // Enforce category-specific size limit (multer only enforces a global ceiling)
      const limit = SIZE_LIMITS[mediaType];
      if (req.file.size > limit) {
        const limitLabel =
          limit >= 1024 * 1024 ? `${Math.round(limit / (1024 * 1024))}MB` : `${Math.round(limit / 1024)}KB`;
        return res.status(400).json({ message: `${mediaType} must be under ${limitLabel}` });
      }

      const resourceType = getCloudinaryResourceType(mediaType);
      const result = await uploadBufferToCloudinary(req.file.buffer, resourceType, "chatsphere", req.file.originalname);

      media = {
        url: result.secure_url,
        publicId: result.public_id,
        type: mediaType,
        size: req.file.size,
        originalName: req.file.originalname,
      };
      // Note: transcript is intentionally NOT awaited here — see below, it's
      // generated in the background after the message is already sent.
    }

    if (!text && !media.url) {
      return res.status(400).json({ message: "Message must contain text or media" });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text: text || "",
      media,
      status: "sent",
    });

    await User.findByIdAndUpdate(senderId, {
      $inc: {
        "stats.totalMessagesSent": 1,
        ...(media.url ? { "stats.totalImagesSent": 1 } : {}),
      },
      $set: { "stats.lastActiveDate": new Date() },
    });

    const io = getIO();
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (io && receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(201).json({ message });

    // AI feature: transcribe voice notes in the background, AFTER the response
    // has already been sent — the voice note is never held up waiting on Gemini.
    // Once done, push the transcript to both sides via Socket.io.
    if (media.type === "audio") {
      transcribeAudio(req.file.buffer.toString("base64"), req.file.mimetype)
        .then(async (transcript) => {
          if (!transcript) return;
          message.media.transcript = transcript;
          await message.save();

          const io2 = getIO();
          const senderSocketId = getReceiverSocketId(senderId.toString());
          const receiverSocketIdForUpdate = getReceiverSocketId(receiverId);
          if (io2 && senderSocketId) io2.to(senderSocketId).emit("messageUpdated", message);
          if (io2 && receiverSocketIdForUpdate) io2.to(receiverSocketIdForUpdate).emit("messageUpdated", message);
        })
        .catch((err) => console.error("Voice note transcription failed:", err.message));
    }
  } catch (error) {
    console.error("Send message error:", error.message);
    res.status(500).json({ message: "Server error sending message" });
  }
};

// Stickers are bundled static assets (shipped with the frontend), so sending one
// never touches Cloudinary or disk — only a reference URL is stored.
export const sendSticker = async (req, res) => {
  try {
    const { stickerUrl } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!stickerUrl) {
      return res.status(400).json({ message: "stickerUrl is required" });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text: "",
      media: { url: stickerUrl, publicId: "", type: "sticker", size: 0 },
      status: "sent",
    });

    await User.findByIdAndUpdate(senderId, {
      $inc: { "stats.totalMessagesSent": 1 },
      $set: { "stats.lastActiveDate": new Date() },
    });

    const io = getIO();
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (io && receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error("Send sticker error:", error.message);
    res.status(500).json({ message: "Server error sending sticker" });
  }
};

// Deletes the message document AND its file on Cloudinary (if any), so storage
// actually frees up instead of just hiding the message.
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const myId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== myId.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    // Stickers point to bundled static assets, not Cloudinary uploads — nothing to remove there
    if (message.media?.publicId && message.media.type !== "sticker") {
      const resourceType = getCloudinaryResourceType(message.media.type);
      try {
        await cloudinary.uploader.destroy(message.media.publicId, { resource_type: resourceType });
      } catch (err) {
        console.error("Cloudinary delete failed:", err.message);
      }
    }

    const receiverId = message.receiver;
    await Message.findByIdAndDelete(messageId);

    const io = getIO();
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (io && receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ message: "Message deleted", messageId });
  } catch (error) {
    console.error("Delete message error:", error.message);
    res.status(500).json({ message: "Server error deleting message" });
  }
};

// Resume feature: message search within a conversation
export const searchMessages = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const { query } = req.query;
    const myId = req.user._id;

    if (!query) return res.status(200).json({ messages: [] });

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
      text: { $regex: query, $options: "i" },
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Server error searching messages" });
  }
};

export const markDelivered = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      { sender: otherUserId, receiver: myId, status: "sent" },
      { status: "delivered" }
    );

    res.status(200).json({ message: "Marked as delivered" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// AI feature: on-demand message translation (not persisted — translated fresh
// each time, keeps the schema simple and always reflects the latest wording)
export const translateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { targetLang } = req.body;

    if (!targetLang) {
      return res.status(400).json({ message: "targetLang is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    if (!message.text) {
      return res.status(400).json({ message: "This message has no text to translate" });
    }

    const translated = await translateText(message.text, targetLang);
    res.status(200).json({ translated });
  } catch (error) {
    console.error("Translate error:", error.message);
    res.status(500).json({ message: "Translation failed — check GEMINI_API_KEY is configured" });
  }
};

// Resume feature: unread message counts per contact (for sidebar badges)
export const getUnreadCounts = async (req, res) => {
  try {
    const myId = req.user._id;

    const counts = await Message.aggregate([
      { $match: { receiver: myId, status: { $ne: "seen" } } },
      { $group: { _id: "$sender", count: { $sum: 1 } } },
    ]);

    const result = {};
    counts.forEach((c) => {
      result[c._id.toString()] = c.count;
    });

    res.status(200).json({ unreadCounts: result });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching unread counts" });
  }
};
