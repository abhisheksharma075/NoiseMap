import React, { useState } from 'react';
import { Bot, User, Copy, Check, AlertCircle, RotateCcw, Database, MapPin, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { ChatMessage, MapActionPayload, ComplaintDraftPayload } from '../../types/copilot';

interface ChatMessageItemProps {
  message: ChatMessage;
  onRetry?: (message: ChatMessage) => void;
  onExecuteMapAction?: (action: MapActionPayload) => void;
  onReviewComplaintDraft?: (draft: ComplaintDraftPayload) => void;
}

/**
 * Lightweight safe markdown renderer that safely formats markdown elements
 * without injecting raw executable HTML or scripts.
 */
const SafeMarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  const paragraphs = content.split(/\n\n+/);

  return (
    <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed break-words font-sans">
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={pIdx} className="font-mono font-bold text-sm sm:text-base text-graphite dark:text-night-text pt-1">
              {renderFormattedInline(trimmed.replace(/^###\s+/, ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={pIdx} className="font-mono font-bold text-base sm:text-lg text-graphite dark:text-night-text pt-1.5">
              {renderFormattedInline(trimmed.replace(/^##\s+/, ''))}
            </h3>
          );
        }

        // Unordered List
        if (/^[-*]\s+/m.test(trimmed)) {
          const lines = trimmed.split('\n');
          return (
            <ul key={pIdx} className="space-y-1 pl-4 list-disc marker:text-forest dark:marker:text-teal-signal">
              {lines.map((line, lIdx) => {
                const cleanLine = line.replace(/^[-*]\s+/, '').trim();
                return <li key={lIdx}>{renderFormattedInline(cleanLine)}</li>;
              })}
            </ul>
          );
        }

        // Ordered List
        if (/^\d+\.\s+/m.test(trimmed)) {
          const lines = trimmed.split('\n');
          return (
            <ol key={pIdx} className="space-y-1 pl-4 list-decimal marker:text-forest dark:marker:text-teal-signal">
              {lines.map((line, lIdx) => {
                const cleanLine = line.replace(/^\d+\.\s+/, '').trim();
                return <li key={lIdx}>{renderFormattedInline(cleanLine)}</li>;
              })}
            </ol>
          );
        }

        // Normal paragraph with possible internal line breaks
        const lines = trimmed.split('\n');
        return (
          <p key={pIdx}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderFormattedInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Handles inline formatting: **bold**, *italic*, `code`.
 */
function renderFormattedInline(text: string): React.ReactNode[] {
  // Regex to match **bold**, *italic*, and `code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-graphite dark:text-night-text">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-paper-200 dark:bg-night-surface font-mono text-xs text-forest dark:text-teal-signal border border-paper-border dark:border-night-border"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRetry,
  onExecuteMapAction,
  onReviewComplaintDraft,
}) => {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const [copied, setCopied] = useState(false);

  // Extract any map action or complaint draft suggested by AI tools
  const mapActionTool = message.toolsUsed?.find((t) => t.tool === 'suggest_map_action');
  const suggestedAction: MapActionPayload | undefined =
    message.suggestedAction ||
    (mapActionTool?.args
      ? {
          type: mapActionTool.args.action_type || 'focus_location',
          params: {
            lat: mapActionTool.args.lat,
            lng: mapActionTool.args.lng,
            zoom: mapActionTool.args.zoom,
            incident_id: mapActionTool.args.target_id || mapActionTool.args.incident_id,
          },
          label: mapActionTool.args.label,
        }
      : undefined);

  const complaintTool = message.toolsUsed?.find((t) => t.tool === 'draft_noise_complaint');
  const complaintDraft: ComplaintDraftPayload | undefined =
    message.complaintDraft ||
    (complaintTool?.args
      ? {
          locationName: complaintTool.args.location_name,
          dominantSource: complaintTool.args.dominant_source || 'traffic',
          description: complaintTool.args.description || '',
          incidentId: complaintTool.args.incident_id,
          zoneType: complaintTool.args.zone_type,
        }
      : undefined);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`w-full flex gap-2.5 sm:gap-3.5 my-3 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-forest/10 dark:bg-teal-500/15 border border-forest/30 dark:border-teal-500/40 flex items-center justify-center text-forest dark:text-teal-signal flex-shrink-0 mt-0.5 shadow-sm">
          <Bot className="w-4 h-4" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div
        className={`max-w-[88%] sm:max-w-[78%] flex flex-col ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`p-3.5 sm:p-4 rounded-2xl shadow-sm transition-colors ${
            isUser
              ? 'bg-forest dark:bg-teal-700 text-[#FBF9F2] rounded-tr-sm'
              : isError
              ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 rounded-tl-sm'
              : 'bg-paper dark:bg-night-card border border-paper-border dark:border-night-border text-graphite dark:text-night-text rounded-tl-sm shadow-field'
          }`}
        >
          {isUser ? (
            <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans font-medium">
              {message.content}
            </p>
          ) : (
            <>
              <SafeMarkdownContent content={message.content} />

              {/* Interactive Citizen Action Pills (Map Navigation & Grievance Review) */}
              {(suggestedAction || complaintDraft) && (
                <div className="mt-3 pt-2.5 border-t border-paper-border/70 dark:border-night-border/70 flex flex-wrap items-center gap-2">
                  {suggestedAction && onExecuteMapAction && (
                    <button
                      type="button"
                      onClick={() => onExecuteMapAction(suggestedAction)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest/10 hover:bg-forest/20 dark:bg-teal-500/15 dark:hover:bg-teal-500/25 border border-forest/30 dark:border-teal-500/30 text-forest dark:text-teal-300 font-mono text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-forest dark:text-teal-signal" />
                      <span>{suggestedAction.label || 'View on NoiseMap'}</span>
                      <ArrowRight className="w-3 h-3 opacity-70" />
                    </button>
                  )}

                  {complaintDraft && onReviewComplaintDraft && (
                    <button
                      type="button"
                      onClick={() => onReviewComplaintDraft(complaintDraft)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-terracotta/10 hover:bg-terracotta/20 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 border border-terracotta/30 dark:border-rose-500/30 text-terracotta dark:text-rose-300 font-mono text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-terracotta dark:text-rose-400" />
                      <span>Review Grievance Draft</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </button>
                  )}
                </div>
              )}

              {/* Stage 2 Evidence-grounded Tool Execution Badge */}
              {message.toolsUsed && message.toolsUsed.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-paper-border/70 dark:border-night-border/70 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                  <span className="text-stone-500 dark:text-night-muted flex items-center gap-1 font-semibold">
                    <Database className="w-3 h-3 text-forest dark:text-teal-signal" />
                    NOISEMAP DATA TOOLS:
                  </span>
                  {message.toolsUsed.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-forest/10 dark:bg-teal-500/15 border border-forest/30 dark:border-teal-500/30 text-forest dark:text-teal-300 font-semibold"
                    >
                      {t.tool}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Error Message Details & Retry Trigger */}
          {isError && message.errorMessage && (
            <div className="mt-2.5 pt-2 border-t border-rose-200 dark:border-rose-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {message.errorMessage}
              </span>
              {onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(message)}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono text-[11px] font-bold flex items-center gap-1 self-start sm:self-auto cursor-pointer shadow-sm transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  RETRY
                </button>
              )}
            </div>
          )}
        </div>

        {/* Message Metadata Footer */}
        <div className="flex items-center gap-2 mt-1 px-1 font-mono text-[10px] text-stone-500 dark:text-night-muted select-none">
          <span>{formattedTime}</span>

          {!isUser && !isError && (
            <button
              type="button"
              onClick={handleCopy}
              className="hover:text-forest dark:hover:text-teal-signal flex items-center gap-0.5 transition-colors cursor-pointer"
              title="Copy message text"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}

          {isUser && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-forest dark:text-teal-signal" />
              You
            </span>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-forest dark:bg-teal-600 text-paper dark:text-night-bg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <User className="w-4 h-4 text-lime-signal dark:text-teal-200" />
        </div>
      )}
    </div>
  );
};
