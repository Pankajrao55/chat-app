const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 bg-surface-elevated px-3.5 py-2.5 rounded-2xl rounded-bl-sm w-fit">
      <span className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-bounce" />
    </div>
  );
};

export default TypingIndicator;
