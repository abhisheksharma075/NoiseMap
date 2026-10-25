import React, { useState, useRef, useEffect } from 'react';
import { Bot, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import {
  ChatMessage,
  MapActionPayload,
  ComplaintDraftPayload,
  ProviderSessionInfo,
} from '../../types/copilot';
import { NoiseReading, NoiseIncident } from '../../types';
import { AiCopilotService } from '../../services/aiCopilotService';
import { CopilotHeader } from './CopilotHeader';
import { WelcomeSection } from './WelcomeSection';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInputArea } from './ChatInputArea';
import { ProviderConnectionCard } from './ProviderConnectionCard';

interface CopilotViewProps {
  readings?: NoiseReading[];
  incidents?: NoiseIncident[];
  selectedIncident?: NoiseIncident | null;
  selectedGrid?: string | null;
  onExecuteMapAction?: (action: MapActionPayload) => void;
  onReviewComplaintDraft?: (draft: ComplaintDraftPayload) => void;
}

export const CopilotView: React.FC<CopilotViewProps> = ({
  readings,
  incidents,
  selectedIncident,
  selectedGrid,
  onExecuteMapAction,
  onReviewComplaintDraft,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bannerError, setBannerError] = useState<{ message: string; code?: string; retryable?: boolean } | null>(null);

  // Active AI provider session state (ephemeral)
  const [session, setSession] = useState<ProviderSessionInfo | null>(() =>
    AiCopilotService.getActiveSession()
  );
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [isCheckingInitialStatus, setIsCheckingInitialStatus] = useState<boolean>(true);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastFailedMessageRef = useRef<string | null>(null);

  // Auto-scroll to bottom when messages update or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up any ongoing request if component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Probe server connectivity on boot to see if server default exists or session active
  useEffect(() => {
    let isMounted = true;
    AiCopilotService.checkProviderStatus()
      .then((status) => {
        if (isMounted) {
          if (status.connected) {
            setSession(AiCopilotService.getActiveSession());
          }
        }
      })
      .catch(() => {
        // Fallback gracefully
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingInitialStatus(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setBannerError(null);
    lastFailedMessageRef.current = trimmed;

    const userMessageId = `msg_user_${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
      status: 'success',
    };

    // Append user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await AiCopilotService.sendMessage(
        trimmed,
        updatedMessages,
        controller.signal,
        {
          readings,
          incidents,
          selectedIncident,
          selectedGrid,
        }
      );

      const assistantMessage: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        status: 'success',
        toolsUsed: response.toolsUsed,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      lastFailedMessageRef.current = null;
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'Request was canceled.') {
        // User deliberately stopped generation
        setIsLoading(false);
        return;
      }

      const errorMessage = err.message || 'Failed to generate AI response.';
      const code = err.code;

      // Handle session expiration
      if (code === 'SESSION_EXPIRED' || code === 'NO_PROVIDER_CONNECTED') {
        setSession(null);
        setShowSettingsModal(true);
      }

      setBannerError({
        message: errorMessage,
        code,
        retryable: err.retryable !== false,
      });

      // Mark the user message with error state so it shows an inline retry button
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessageId
            ? { ...msg, status: 'error', errorMessage }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetry = (failedMessage?: ChatMessage) => {
    const textToRetry = failedMessage?.content || lastFailedMessageRef.current;
    if (!textToRetry) return;

    // Filter out the failed message from history before retrying
    if (failedMessage) {
      setMessages((prev) => prev.filter((m) => m.id !== failedMessage.id));
    }

    handleSendMessage(textToRetry);
  };

  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleNewConversation = () => {
    handleCancelRequest();
    setMessages([]);
    setBannerError(null);
    lastFailedMessageRef.current = null;
  };

  const handleDisconnect = async () => {
    await AiCopilotService.disconnectProvider();
    setSession(null);
    setShowSettingsModal(false);
    setBannerError(null);
  };

  const hasMessages = messages.length > 0;

  // If initial connection status check is running, show subtle loading state
  if (isCheckingInitialStatus) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-[calc(100dvh-7.5rem)] sm:h-[calc(100dvh-8rem)]">
        <div className="flex items-center gap-2 font-mono text-xs text-stone-500 dark:text-night-muted animate-pulse">
          <Bot className="w-4 h-4 text-forest dark:text-teal-signal animate-bounce" />
          <span>Initializing NoiseMap AI Copilot...</span>
        </div>
      </div>
    );
  }

  // If no user session is active and no server environment key is available, show the Provider Connection Card
  if (!session) {
    return (
      <div className="w-full flex flex-col h-[calc(100dvh-7.5rem)] sm:h-[calc(100dvh-8rem)] max-w-4xl mx-auto px-1 sm:px-2 animate-in fade-in duration-200">
        <CopilotHeader
          onNewConversation={handleNewConversation}
          messageCount={0}
          session={null}
          onOpenSettings={() => setShowSettingsModal(true)}
          onDisconnect={handleDisconnect}
        />
        <div className="flex-1 flex items-center justify-center py-4 overflow-y-auto">
          <ProviderConnectionCard
            onConnected={(newSession) => {
              setSession(newSession);
              setBannerError(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-[calc(100dvh-7.5rem)] sm:h-[calc(100dvh-8rem)] max-w-4xl mx-auto px-1 sm:px-2 animate-in fade-in duration-200">
      {/* Top Header Strip with Connection Pill & Actions */}
      <CopilotHeader
        onNewConversation={handleNewConversation}
        messageCount={messages.length}
        session={session}
        onOpenSettings={() => setShowSettingsModal(true)}
        onDisconnect={handleDisconnect}
      />

      {/* Global Error Banner */}
      {bannerError && (
        <div className="my-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 flex items-start justify-between gap-3 text-xs animate-in fade-in shadow-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{bannerError.message}</p>
              {bannerError.code === 'CONFIG_MISSING' && (
                <p className="text-[11px] text-rose-600 dark:text-rose-300 mt-0.5">
                  Connect your Google Gemini or OpenAI API key in settings to enable live AI responses.
                </p>
              )}
            </div>
          </div>
          {bannerError.retryable && (
            <button
              type="button"
              onClick={() => handleRetry()}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm flex-shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              RETRY
            </button>
          )}
        </div>
      )}

      {/* Main Conversation & Scroll Area */}
      <div className="flex-1 overflow-y-auto px-1 py-2 sm:py-4 scroll-smooth">
        {!hasMessages ? (
          <WelcomeSection
            onSelectQuestion={handleSendMessage}
            disabled={isLoading}
          />
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <ChatMessageItem
                key={message.id}
                message={message}
                onRetry={handleRetry}
                onExecuteMapAction={onExecuteMapAction}
                onReviewComplaintDraft={onReviewComplaintDraft}
              />
            ))}

            {/* Live Typing / Thinking Indicator */}
            {isLoading && (
              <div className="w-full flex items-center gap-2.5 my-2 animate-in fade-in">
                <div className="w-8 h-8 rounded-xl bg-forest/10 dark:bg-teal-500/15 border border-forest/30 dark:border-teal-500/40 flex items-center justify-center text-forest dark:text-teal-signal flex-shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-paper dark:bg-night-card border border-paper-border dark:border-night-border rounded-tl-sm flex items-center gap-2 shadow-field">
                  <div className="flex items-center gap-1.5 h-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-teal-signal animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-teal-signal animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-teal-signal animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs font-mono text-stone-500 dark:text-night-muted">
                    NoiseMap AI ({session.provider === 'openai' ? 'OpenAI GPT' : 'Gemini'}) is analyzing...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area & Privacy Guarantee Footer */}
      <div className="pt-2 pb-1 space-y-1.5 flex-shrink-0">
        <ChatInputArea
          onSendMessage={handleSendMessage}
          onCancelRequest={handleCancelRequest}
          isLoading={isLoading}
        />
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-stone-400 dark:text-night-muted select-none text-center">
          <ShieldCheck className="w-3 h-3 text-forest dark:text-teal-signal" />
          <span>
            {session.provider === 'openai' ? 'OpenAI GPT' : 'Google Gemini'} • Ephemeral session in server memory • Zero raw audio uploaded
          </span>
        </div>
      </div>

      {/* Settings / Change Provider Modal Dialog */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-graphite-950/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl">
            <ProviderConnectionCard
              isSettingsMode
              currentSession={session}
              onConnected={(newSession) => {
                setSession(newSession);
                setShowSettingsModal(false);
                setBannerError(null);
              }}
              onCancel={() => setShowSettingsModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
