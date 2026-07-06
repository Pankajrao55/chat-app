const DeleteConfirmPopover = ({ onConfirm, onCancel }) => {
  return (
    <div
      // POSITION: opens below (top-full) and grows LEFTWARD from the button's
      // right edge (right-0) — since own-messages sit near the right side of
      // the screen, growing left keeps this safely inside the visible chat area.
      // SIZE: change w-40 (=10rem=160px) below to resize the box.
      className="absolute top-full mt-2 right-0 bg-surface-elevated border border-white/10 rounded-xl shadow-panel p-2.5 z-50 w-40 animate-popIn"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-xs text-ink-primary mb-2 text-center">Delete this message?</p>
      <div className="flex gap-1.5">
        <button
          onClick={onCancel}
          className="flex-1 text-xs py-1.5 rounded-lg bg-white/5 text-ink-muted hover:bg-white/10 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 text-xs py-1.5 rounded-lg bg-danger text-white hover:opacity-90 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmPopover;
