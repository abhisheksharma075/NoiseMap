import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Loader2 } from 'lucide-react';

interface ChatInputAreaProps {
  onSendMessage: (message: string) => void;
  onCancelRequest?: () => void;
  isLoading: boolean;
  maxLength?: number;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  onSendMessage,
  onCancelRequest,
  isLoading,
  maxLength = 2000,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height to accommodate multiline questions
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    const trimmed = input.trim();
    if (!trimmed) return;

    onSendMessage(trimmed);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isOverLimit = input.length > maxLength;
  const canSubmit = input.trim().length > 0 && !isLoading && !isOverLimit;

  return (
    <div className="w-full bg-paper dark:bg-night-card border border-paper-border dark:border-night-border rounded-2xl p-2.5 sm:p-3 shadow-field-lg transition-colors">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Text Area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about NoiseMap, noise levels, incidents, or reporting..."
            disabled={isLoading}
            maxLength={maxLength + 100}
            className="w-full bg-transparent resize-none text-xs sm:text-sm text-graphite dark:text-night-text placeholder:text-stone-400 dark:placeholder:text-night-muted focus:outline-none py-1.5 px-2 max-h-36 font-sans leading-relaxed disabled:opacity-50"
            aria-label="Message to NoiseMap Copilot"
          />
        </div>

        {/* Controls & Character Counter Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-paper-border/50 dark:border-night-border/60">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-stone-400 dark:text-night-muted select-none">
              <kbd className="px-1 py-0.5 rounded bg-paper-200 dark:bg-night-surface border border-paper-border dark:border-night-border text-[9px]">
                Enter ↵
              </kbd>
              to send,
              <kbd className="px-1 py-0.5 rounded bg-paper-200 dark:bg-night-surface border border-paper-border dark:border-night-border text-[9px]">
                Shift + Enter
              </kbd>
              for new line
            </span>

            <span
              className={`font-mono text-[10px] ${
                isOverLimit
                  ? 'text-rose-500 font-bold'
                  : 'text-stone-400 dark:text-night-muted'
              }`}
            >
              {input.length} / {maxLength}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isLoading && onCancelRequest ? (
              <button
                type="button"
                onClick={onCancelRequest}
                className="px-3 py-1.5 rounded-xl bg-paper-200 hover:bg-paper-300 dark:bg-night-surface dark:hover:bg-night-border text-stone-600 dark:text-night-secondary font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Stop generation"
              >
                <Square className="w-3 h-3 fill-current" />
                <span className="hidden xs:inline">STOP</span>
              </button>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-sm select-none ${
                canSubmit
                  ? 'bg-forest hover:bg-forest-deep dark:bg-teal-600 dark:hover:bg-teal-500 text-paper dark:text-night-bg shadow-md hover:scale-102'
                  : 'bg-paper-200 dark:bg-night-surface text-stone-400 dark:text-night-muted cursor-not-allowed opacity-60'
              }`}
              title={canSubmit ? 'Send message' : 'Type a message to send'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>THINKING...</span>
                </>
              ) : (
                <>
                  <span>SEND</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
