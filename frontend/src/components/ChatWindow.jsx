import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../utils/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import MessageBubble from "./MessageBubble.jsx";
import MessageInput from "./MessageInput.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import MediaViewerModal from "./MediaViewerModal.jsx";

const ChatWindow = ({ selectedUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [viewerMedia, setViewerMedia] = useState(null); // { url, type }
  const { authUser } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const scrollRef = useRef(null);

  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/messages/${selectedUser._id}`);
        setMessages(data.messages);
      } catch (error) {
        toast.error("Could not load messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.sender === selectedUser?._id) {
        setMessages((prev) => [...prev, message]);
        socket.emit("messageSeen", {
          senderId: selectedUser._id,
          receiverId: authUser._id,
        });
      }
    };

    const handleTyping = ({ senderId }) => {
      if (senderId === selectedUser?._id) setIsTyping(true);
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId === selectedUser?._id) setIsTyping(false);
    };

    const handleSeenUpdate = ({ by }) => {
      if (by === selectedUser?._id) {
        setMessages((prev) =>
          prev.map((m) => (m.sender === authUser._id ? { ...m, status: "seen" } : m))
        );
      }
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    // AI feature: voice note transcript arrives a moment after the message
    // itself (generated in the background) — merge it in when it shows up
    const handleMessageUpdated = (updatedMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m))
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messageSeenUpdate", handleSeenUpdate);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageUpdated", handleMessageUpdated);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("messageSeenUpdate", handleSeenUpdate);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageUpdated", handleMessageUpdated);
    };
  }, [socket, selectedUser, authUser]);

  const handleSend = async ({ text, file }) => {
    // Text-only messages: show them instantly (optimistic update) instead of
    // waiting for the server round-trip — feels instant even if the backend
    // is slow to respond (e.g. Render free-tier cold starts after sleeping).
    if (!file && text) {
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        _id: tempId,
        sender: authUser._id,
        receiver: selectedUser._id,
        text,
        media: {},
        status: "sending",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const { data } = await api.post(`/messages/${selectedUser._id}`, { text });
        setMessages((prev) => prev.map((m) => (m._id === tempId ? data.message : m)));
      } catch (error) {
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        throw error;
      }
      return;
    }

    // Media messages: the upload itself takes real time, so there's nothing
    // meaningful to fake here — send normally and wait for the real response.
    const formData = new FormData();
    if (text) formData.append("text", text);
    if (file) formData.append("media", file);

    const { data } = await api.post(`/messages/${selectedUser._id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setMessages((prev) => [...prev, data.message]);
  };

  // Sends each selected file as its own message, one after another, so the
  // conversation shows them in order without racing uploads against each other
  const handleSendMultiple = async (files) => {
    let successCount = 0;
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("media", file);
        const { data } = await api.post(`/messages/${selectedUser._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessages((prev) => [...prev, data.message]);
        successCount += 1;
      } catch (error) {
        toast.error(`Failed to send ${file.name}: ${error.response?.data?.message || "error"}`);
      }
    }
    if (successCount > 0) {
      toast.success(`Sent ${successCount} file${successCount > 1 ? "s" : ""}`);
    }
  };

  const handleSendSticker = async (stickerUrl) => {
    const { data } = await api.post(`/messages/${selectedUser._id}/sticker`, { stickerUrl });
    setMessages((prev) => [...prev, data.message]);
  };

  const handleDelete = async (messageId) => {
    const previous = messages;
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    try {
      await api.delete(`/messages/${messageId}`);
    } catch (error) {
      toast.error("Could not delete message");
      setMessages(previous);
    }
  };

  const handleTyping = () => {
    socket?.emit("typing", { receiverId: selectedUser._id, senderId: authUser._id });
  };

  const handleStopTyping = () => {
    socket?.emit("stopTyping", { receiverId: selectedUser._id, senderId: authUser._id });
  };

  if (!selectedUser) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-surface text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center mb-4">
          <MessageCircle className="text-accent-teal" size={28} />
        </div>
        <h3 className="font-display text-lg font-semibold text-ink-primary mb-1">
          Select a conversation
        </h3>
        <p className="text-ink-muted text-sm max-w-xs">
          Pick someone from the list to start chatting in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-surface h-full">
      <div className="flex items-center gap-3 p-3.5 border-b border-white/5 bg-surface-panel">
        <button
          onClick={onBack}
          className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-ink-muted"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-teal to-accent-cyan flex items-center justify-center font-display font-semibold text-surface text-sm">
            {selectedUser.fullName.charAt(0).toUpperCase()}
          </div>
          {isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-online border-2 border-surface-panel" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-ink-primary">{selectedUser.fullName}</p>
          <p className="text-xs text-ink-faint">
            {isTyping ? (
              <span className="text-accent-teal">typing...</span>
            ) : isOnline ? (
              <span className="text-online">Online</span>
            ) : (
              `Last seen ${format(new Date(selectedUser.lastSeen), "dd MMM, HH:mm")}`
            )}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <p className="text-center text-ink-faint text-sm mt-10">Loading messages...</p>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-center text-ink-faint text-sm mt-10">
            No messages yet. Say hi 👋
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwn={msg.sender === authUser._id}
            onDelete={handleDelete}
            onOpenMedia={(url, type) => setViewerMedia({ url, type })}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={scrollRef} />
      </div>

      <MessageInput
        onSend={handleSend}
        onSendMultiple={handleSendMultiple}
        onSendSticker={handleSendSticker}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
      />

      {viewerMedia && (
        <MediaViewerModal
          url={viewerMedia.url}
          type={viewerMedia.type}
          onClose={() => setViewerMedia(null)}
        />
      )}
    </div>
  );
};

export default ChatWindow;
