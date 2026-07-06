import { useState, useRef } from "react";
import { format } from "date-fns";
import { Check, CheckCheck, Trash2, Play, Download, FileText, Languages, Clock } from "lucide-react";
import { getDownloadUrl, formatBytes, getFileExtension } from "../utils/mediaHelpers.js";
import DeleteConfirmPopover from "./DeleteConfirmPopover.jsx";
import api from "../utils/axios.js";
import { useClickOutside } from "../utils/useClickOutside.js";

const LANGUAGES = ["Hindi", "English", "Spanish", "French","German","Japanese","Russian","Korean","Bengali","Tamil","Arabic","Portuguese","Chinese","Urdu"];
const MENU_WIDTH = 128;

const MessageBubble = ({ message, isOwn, onDelete, onOpenMedia }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const [translating, setTranslating] = useState(false);
  const [translation, setTranslation] = useState(null); // { lang, text }
  const media = message.media || {};
  const isPending = message.status === "sending"; // optimistic message, not yet confirmed by the server

  const deleteContainerRef = useRef(null);
  const translateBtnRef = useRef(null);
  const translateMenuRef = useRef(null);

  useClickOutside([deleteContainerRef], () => setShowConfirm(false), showConfirm);
  useClickOutside([translateBtnRef, translateMenuRef], () => setShowLangPicker(false), showLangPicker);

  // Computes a fixed-position spot for the language dropdown so it always
  // stays inside the visible viewport — flips upward if there isn't room
  // below, and never runs off the right edge.
  const openLangPicker = () => {
    const rect = translateBtnRef.current.getBoundingClientRect();
    const estimatedMenuHeight = LANGUAGES.length * 32 + 12;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < estimatedMenuHeight + 10;

    const top = openUpward ? rect.top - estimatedMenuHeight - 6 : rect.bottom + 6;
    let left = rect.left;
    if (left + MENU_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - MENU_WIDTH - 8;
    }

    setMenuStyle({ position: "fixed", top: Math.max(8, top), left: Math.max(8, left) });
    setShowLangPicker(true);
  };

  const handleTranslate = async (lang) => {
    setShowLangPicker(false);
    setTranslating(true);
    try {
      const { data } = await api.post(`/messages/${message._id}/translate`, { targetLang: lang });
      setTranslation({ lang, text: data.translated });
    } catch (error) {
      setTranslation({ lang, text: "Translation failed" });
    } finally {
      setTranslating(false);
    }
  };

  const StatusIcon = () => {
    if (!isOwn) return null;
    if (message.status === "sending") {
      return <Clock size={12} className="text-ink-faint/70 animate-pulse" />;
    }
    if (message.status === "seen") {
      return <CheckCheck size={14} className="text-accent-cyan" />;
    }
    if (message.status === "delivered") {
      return <CheckCheck size={14} className="text-ink-faint" />;
    }
    return <Check size={14} className="text-ink-faint" />;
  };

  const confirmDelete = () => {
    onDelete(message._id);
    setShowConfirm(false);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    window.open(getDownloadUrl(media.url, media.originalName), "_blank");
  };

  const DeleteButton = ({ className = "" }) =>
    isOwn &&
    !isPending && (
      <div ref={deleteContainerRef} className={className}>
        <button
          onClick={() => setShowConfirm(true)}
          title="Delete message"
          className="p-1.5 rounded-full bg-surface-elevated hover:bg-danger text-white transition opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={12} />
        </button>
        {showConfirm && (
          <DeleteConfirmPopover onConfirm={confirmDelete} onCancel={() => setShowConfirm(false)} />
        )}
      </div>
    );

  // Stickers render bare, no bubble chrome — matches how WhatsApp shows them
  if (media.type === "sticker") {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 animate-popIn group`}>
        <div className="relative">
          <img src={media.url} alt="sticker" className="w-24 h-24" />
          <DeleteButton className="absolute -top-1 -left-1" />
        </div>
      </div>
    );
  }

  // Documents/files render as a compact card, not inline media
  if (media.type === "file") {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 animate-popIn group`}>
        <div className="relative max-w-[80%] md:max-w-[60%]">
          <DeleteButton className="absolute -top-2 -left-2 z-10" />
          <div
            className={`rounded-2xl px-3.5 py-3 flex items-center gap-3 ${
              isOwn
                ? "bg-gradient-to-br from-accent-teal to-accent-tealDark text-surface rounded-br-sm"
                : "bg-surface-elevated text-ink-primary rounded-bl-sm"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isOwn ? "bg-black/10" : "bg-white/5"}`}>
              <FileText size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{media.originalName || "File"}</p>
              <p className={`text-[11px] ${isOwn ? "text-surface/70" : "text-ink-faint"}`}>
                {getFileExtension(media.originalName)} · {formatBytes(media.size)}
              </p>
            </div>
            <button
              onClick={handleDownload}
              className={`p-2 rounded-lg flex-shrink-0 ${isOwn ? "hover:bg-black/10" : "hover:bg-white/10"}`}
              title="Download"
            >
              <Download size={16} />
            </button>
          </div>
          <div className="flex items-center gap-1 justify-end mt-0.5 px-1 text-ink-faint">
            <span className="text-[10px] font-mono">{format(new Date(message.createdAt), "HH:mm")}</span>
            <StatusIcon />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 animate-popIn group`}>
      <div className="relative max-w-[75%] md:max-w-[60%]">
        {media.type !== "image" && media.type !== "gif" && media.type !== "video" && (
          <DeleteButton className="absolute -top-2 -left-2 z-10" />
        )}

        <div
          className={`rounded-2xl px-3.5 py-2.5 ${
            isOwn
              ? "bg-gradient-to-br from-accent-teal to-accent-tealDark text-surface rounded-br-sm"
              : "bg-surface-elevated text-ink-primary rounded-bl-sm"
          }`}
        >
          {(media.type === "image" || media.type === "gif") && (
            <div className="relative mb-1.5 group/media">
              <img
                src={media.url}
                alt="shared"
                className="rounded-lg max-h-64 object-cover w-full cursor-pointer"
                onClick={() => onOpenMedia(media.url, "image")}
              />
              <button
                onClick={handleDownload}
                className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover/media:opacity-100 transition"
                title="Download"
              >
                <Download size={14} />
              </button>
              {isOwn && !isPending && (
                <div ref={deleteContainerRef} className="absolute bottom-1.5 left-1.5">
                  <button
                    onClick={() => setShowConfirm(true)}
                    title="Delete message"
                    className="p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover/media:opacity-100 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                  {showConfirm && (
                    <DeleteConfirmPopover onConfirm={confirmDelete} onCancel={() => setShowConfirm(false)} />
                  )}
                </div>
              )}
            </div>
          )}

          {media.type === "video" && (
            <div className="relative mb-1.5 group/video">
              <div className="rounded-lg overflow-hidden cursor-pointer" onClick={() => onOpenMedia(media.url, "video")}>
                <video src={media.url} className="max-h-64 w-full object-cover" muted />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <Play size={18} className="text-black ml-0.5" fill="black" />
                  </div>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover/video:opacity-100 transition"
                title="Download"
              >
                <Download size={14} />
              </button>
              {isOwn && !isPending && (
                <div ref={deleteContainerRef} className="absolute bottom-1.5 left-1.5">
                  <button
                    onClick={() => setShowConfirm(true)}
                    title="Delete message"
                    className="p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover/video:opacity-100 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                  {showConfirm && (
                    <DeleteConfirmPopover onConfirm={confirmDelete} onCancel={() => setShowConfirm(false)} />
                  )}
                </div>
              )}
            </div>
          )}

          {media.type === "audio" && (
            <div className="mb-1.5">
              <div className="flex items-center gap-2">
                <audio src={media.url} controls className="h-10 w-52 max-w-full" />
                <button onClick={handleDownload} className="p-1.5 rounded-lg hover:bg-white/10" title="Download">
                  <Download size={14} />
                </button>
              </div>
              {media.transcript && (
                <p className={`text-xs italic mt-1.5 ${isOwn ? "text-surface/80" : "text-ink-muted"}`}>
                  "{media.transcript}"
                </p>
              )}
            </div>
          )}

          {message.text && (
            <>
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {message.text}
              </p>

              {translation && (
                <div className={`mt-1.5 pt-1.5 border-t ${isOwn ? "border-surface/20" : "border-white/10"}`}>
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed opacity-90">
                    {translation.text}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${isOwn ? "text-surface/60" : "text-ink-faint"}`}>
                    Translated to {translation.lang}
                  </p>
                </div>
              )}

              <div className="relative mt-1">
                <button
                  ref={translateBtnRef}
                  onClick={() => (showLangPicker ? setShowLangPicker(false) : openLangPicker())}
                  disabled={translating || isPending}
                  className={`flex items-center gap-1 text-[11px] ${
                    isOwn ? "text-surface/70 hover:text-surface" : "text-ink-faint hover:text-ink-muted"
                  } transition disabled:opacity-50`}
                >
                  <Languages size={12} />
                  {translating ? "Translating..." : translation ? "Translate again" : "Translate"}
                </button>
                {showLangPicker && (
                  <div
                    ref={translateMenuRef}
                    style={menuStyle}
                    className="bg-surface-elevated border border-white/10 rounded-lg shadow-panel p-1 z-50 w-32 animate-popIn"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleTranslate(lang)}
                        className="block w-full text-left text-xs px-2 py-1.5 rounded-md text-ink-primary hover:bg-white/10 transition"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div
            className={`flex items-center gap-1 justify-end mt-1 ${
              isOwn ? "text-surface/70" : "text-ink-faint"
            }`}
          >
            <span className="text-[10px] font-mono">
              {format(new Date(message.createdAt), "HH:mm")}
            </span>
            <StatusIcon />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
