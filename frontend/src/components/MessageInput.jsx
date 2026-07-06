import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Video, Mic, Square, X, Smile, Paperclip, FileText } from "lucide-react";
import toast from "react-hot-toast";
import StickerPicker from "./StickerPicker.jsx";
import { formatBytes } from "../utils/mediaHelpers.js";

const TYPING_STOP_DELAY = 1500;

// Mirrors backend SIZE_LIMITS so we can reject oversized files before uploading
const CLIENT_SIZE_LIMITS = {
  "image/": 8 * 1024 * 1024,
  "video/": 100 * 1024 * 1024,
  "audio/": 25 * 1024 * 1024,
};
const DOCUMENT_SIZE_LIMIT = 10 * 1024 * 1024; // Cloudinary free-plan raw-file cap

const getLimitFor = (mimetype) => {
  const key = Object.keys(CLIENT_SIZE_LIMITS).find((prefix) => mimetype.startsWith(prefix));
  return key ? CLIENT_SIZE_LIMITS[key] : DOCUMENT_SIZE_LIMIT;
};

const MessageInput = ({ onSend, onSendMultiple, onSendSticker, onTyping, onStopTyping }) => {
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaKind, setMediaKind] = useState(null); // image | video | audio
  const [sending, setSending] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      clearInterval(recordTimerRef.current);
    };
  }, []);

  const handleTextChange = (e) => {
    setText(e.target.value);
    onTyping?.();
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onStopTyping?.(), TYPING_STOP_DELAY);
  };

  const validateFiles = (files, kind) => {
    const valid = [];
    for (const file of files) {
      const limit = getLimitFor(file.type || "application/octet-stream");
      if (file.size > limit) {
        toast.error(`${file.name} skipped — ${kind} must be under ${formatBytes(limit)}`);
        continue;
      }
      valid.push(file);
    }
    return valid;
  };

  // Multiple files selected at once -> send each as its own message immediately
  // (no caption/preview step, matches how WhatsApp/Telegram handle multi-select)
  const handleMultiFileSelect = async (e, kind) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    const validFiles = validateFiles(files, kind);
    if (validFiles.length === 0) return;

    if (validFiles.length === 1) {
      setMediaFile(validFiles[0]);
      setMediaKind(kind);
      setMediaPreview(URL.createObjectURL(validFiles[0]));
      return;
    }

    setSending(true);
    try {
      await onSendMultiple(validFiles);
    } catch (error) {
      toast.error("Some files failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleDocumentSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      if (file.size > DOCUMENT_SIZE_LIMIT) {
        toast.error(`${file.name} skipped — files must be under ${formatBytes(DOCUMENT_SIZE_LIMIT)}`);
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;

    setSending(true);
    try {
      await onSendMultiple(validFiles);
    } catch (error) {
      toast.error("Some files failed to send");
    } finally {
      setSending(false);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaKind(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size > CLIENT_SIZE_LIMITS["audio/"]) {
          toast.error(`Voice note must be under ${formatBytes(CLIENT_SIZE_LIMITS["audio/"])}`);
          return;
        }
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        setMediaFile(file);
        setMediaKind("audio");
        setMediaPreview(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } catch (error) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(recordTimerRef.current);
    setIsRecording(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !mediaFile) return;

    setSending(true);
    try {
      await onSend({ text: text.trim(), file: mediaFile });
      setText("");
      removeMedia();
      onStopTyping?.();
      clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleStickerSelect = async (stickerUrl) => {
    setShowStickers(false);
    try {
      await onSendSticker(stickerUrl);
    } catch (error) {
      toast.error("Failed to send sticker");
    }
  };

  return (
    <div className="border-t border-white/5 bg-surface-panel p-3 relative">
      {showStickers && (
        <StickerPicker onSelect={handleStickerSelect} onClose={() => setShowStickers(false)} />
      )}

      {mediaPreview && (
        <div className="relative inline-flex items-center gap-2 mb-2 ml-1 bg-surface-elevated rounded-lg p-2">
          {mediaKind === "image" && (
            <img src={mediaPreview} alt="preview" className="h-16 w-16 object-cover rounded-lg" />
          )}
          {mediaKind === "video" && (
            <video src={mediaPreview} className="h-16 w-16 object-cover rounded-lg" muted />
          )}
          {mediaKind === "audio" && (
            <audio src={mediaPreview} controls className="h-9 w-48" />
          )}
          <button onClick={removeMedia} className="bg-danger rounded-full p-1 text-white">
            <X size={12} />
          </button>
        </div>
      )}

      {isRecording ? (
        <div className="flex items-center gap-3 bg-surface-elevated rounded-xl px-4 py-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
          <span className="text-sm text-ink-primary font-mono flex-1">
            Recording... {String(Math.floor(recordSeconds / 60)).padStart(2, "0")}:
            {String(recordSeconds % 60).padStart(2, "0")}
          </span>
          <button
            onClick={stopRecording}
            className="p-2 rounded-lg bg-danger text-white hover:opacity-90 transition"
          >
            <Square size={16} fill="white" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-1">
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            multiple
            onChange={(e) => handleMultiFileSelect(e, "image")}
            className="hidden"
          />
          <input
            type="file"
            ref={videoInputRef}
            accept="video/*"
            multiple
            onChange={(e) => handleMultiFileSelect(e, "video")}
            className="hidden"
          />
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.csv"
            multiple
            onChange={handleDocumentSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            title="Photo or GIF (multiple allowed)"
            className="p-2.5 rounded-xl hover:bg-white/5 text-ink-muted hover:text-accent-teal transition flex-shrink-0"
          >
            <ImageIcon size={18} />
          </button>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            title="Video (multiple allowed)"
            className="p-2.5 rounded-xl hover:bg-white/5 text-ink-muted hover:text-accent-teal transition flex-shrink-0"
          >
            <Video size={18} />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Document or file (multiple allowed)"
            className="p-2.5 rounded-xl hover:bg-white/5 text-ink-muted hover:text-accent-teal transition flex-shrink-0"
          >
            <Paperclip size={18} />
          </button>
          <button
            type="button"
            onClick={() => setShowStickers((s) => !s)}
            title="Stickers"
            className="p-2.5 rounded-xl hover:bg-white/5 text-ink-muted hover:text-accent-teal transition flex-shrink-0"
          >
            <Smile size={18} />
          </button>
          <button
            type="button"
            onClick={startRecording}
            title="Record voice note"
            className="p-2.5 rounded-xl hover:bg-white/5 text-ink-muted hover:text-accent-teal transition flex-shrink-0"
          >
            <Mic size={18} />
          </button>

          <input
            value={text}
            onChange={handleTextChange}
            placeholder="Type a message..."
            className="flex-1 bg-surface-elevated border border-white/5 rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent-teal/30 transition"
          />
          <button
            type="submit"
            disabled={sending || (!text.trim() && !mediaFile)}
            className="p-2.5 rounded-xl bg-accent-teal hover:bg-accent-tealDark text-surface disabled:opacity-40 transition flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
};

export default MessageInput;
