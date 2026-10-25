import React, { useState, useRef, useEffect } from 'react';
import { Bot, ShieldCheck } from 'lucide-react';
import {
  ChatMessage,
  MapActionPayload,
  ComplaintDraftPayload,
} from '../../types/copilot';
import { NoiseReading, NoiseIncident } from '../../types';
import { FaqChatbotService } from '../../services/faqChatbotService';
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
  onExecuteMapAction,
  onReviewComplaintDraft,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when messages update or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up any pending typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const handleSendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessageId = `msg_user_${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
      status: 'success',
    };

    // Append user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Provide a short, smooth typing animation (200-250ms) to ensure responsive feel
    typingTimerRef.current = setTimeout(() => {
      const matchResult = FaqChatbotService.matchQuestion(trimmed);

      const assistantMessage: ChatMessage = {
        id: `msg_faq_${Date.now()}`,
        role: 'assistant',
        content: matchResult.answer,
        timestamp: new Date().toISOString(),
        status: 'success',
        relatedQuestions: matchResult.relatedQuestions?.length
          ? matchResult.relatedQuestions
          : matchResult.suggestedQuestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      typingTimerRef.current = null;
    }, 220);
  };

  const handleCancelRequest = () => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleNewConversation = () => {
    handleCancelRequest();
    setMessages([]);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="w-full flex flex-col h-[calc(100dvh-7.5rem)] sm:h-[calc(100dvh-8rem)] max-w-4xl mx-auto px-1 sm:px-2 animate-in fade-in duration-200">
      {/* Top Header with Offline FAQ Mode Indicator and Actions */}
      <CopilotHeader
        onNewConversation={handleNewConversation}
        messageCount={messages.length}
        onOpenSettings={() => setShowDemoModal(true)}
      />

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
                onExecuteMapAction={onExecuteMapAction}
                onReviewComplaintDraft={onReviewComplaintDraft}
                onSelectQuestion={handleSendMessage}
              />
            ))}

            {/* Subtle Typing Animation Indicator */}
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
                    NoiseMap Assistant is searching FAQ...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area & Offline Privacy Notice Footer */}
      <div className="pt-2 pb-1 space-y-1.5 flex-shrink-0">
        <ChatInputArea
          onSendMessage={handleSendMessage}
          onCancelRequest={handleCancelRequest}
          isLoading={isLoading}
        />
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-stone-400 dark:text-night-muted select-none text-center">
          <ShieldCheck className="w-3 h-3 text-forest dark:text-teal-signal" />
          <span>
            Offline FAQ Mode • Instant Predefined Answers • Zero data transmitted to external AI
          </span>
        </div>
      </div>

      {/* Simulated Demonstration Element Modal Dialog */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-graphite-950/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl">
            <ProviderConnectionCard
              isSettingsMode
              onCancel={() => setShowDemoModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
