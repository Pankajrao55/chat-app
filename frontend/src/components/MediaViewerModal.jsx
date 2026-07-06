import { useEffect } from "react";
import { X, Download } from "lucide-react";
import { getDownloadUrl } from "../utils/mediaHelpers.js";

const MediaViewerModal = ({ url, type, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/85 z-[60] flex items-center justify-center p-4 animate-popIn"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(getDownloadUrl(url), "_blank");
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          aria-label="Download"
        >
          <Download size={20} />
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          aria-label="Close"
        >
          <X size={22} />
        </button>
      </div>

      <div className="max-w-4xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        {type === "video" ? (
          <video src={url} controls autoPlay className="max-h-[85vh] max-w-full rounded-lg" />
        ) : (
          <img src={url} alt="media" className="max-h-[85vh] max-w-full rounded-lg object-contain" />
        )}
      </div>
    </div>
  );
};

export default MediaViewerModal;
