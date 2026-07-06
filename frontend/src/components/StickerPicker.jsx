const STICKERS = [
  "wave", "heart", "laugh", "thumbsup", "fire", "clap", "ok", "sad",
];

const StickerPicker = ({ onSelect, onClose }) => {
  return (
    <div className="absolute bottom-full mb-2 left-0 bg-surface-elevated border border-white/10 rounded-2xl p-3 shadow-panel animate-popIn z-20 w-64">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-ink-muted">Stickers</p>
        <button onClick={onClose} className="text-ink-faint hover:text-ink-primary text-xs">
          Close
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {STICKERS.map((name) => (
          <button
            key={name}
            onClick={() => onSelect(`/stickers/${name}.svg`)}
            className="p-1.5 rounded-xl hover:bg-white/10 transition"
          >
            <img src={`/stickers/${name}.svg`} alt={name} className="w-full h-auto" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default StickerPicker;
