import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    // Generalized media support: image, video, audio (voice note), gif, sticker
    media: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" }, // Cloudinary asset id, needed to delete the file later
      type: {
        type: String,
        enum: ["image", "video", "audio", "gif", "sticker", "file", ""],
        default: "",
      },
      size: { type: Number, default: 0 }, // bytes
      duration: { type: Number, default: 0 }, // for audio/video, in seconds (optional)
      originalName: { type: String, default: "" }, // original filename, shown for document/file messages
      transcript: { type: String, default: "" }, // AI-generated transcript, for audio (voice note) messages only
    },
    // Resume feature: Read Receipts (sent -> delivered -> seen)
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    seenAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
