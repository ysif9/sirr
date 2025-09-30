//START OF components/chatbot/chat.tsx
"use client";

import { Button } from "@/components/ui/button";
import { RiShining2Line } from "@remixicon/react";
import { ChatMessage } from "@/components/chatbot/chat-message";
import { useRef, useEffect, useState, KeyboardEvent, FormEvent } from "react";
import { SendHorizonalIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sendChatMessage, sendStreamingChatMessage } from "@/lib/rag-api";
import ReactMarkdown from "react-markdown";
import { useLocale } from "next-intl";

type Message = {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  processingTime?: number;
  sources?: any[];
  isStreaming?: boolean;
};

type ChatSession = {
  sessionId: string;
  messages: Message[];
};



const initialMessages: Message[] = [
  {
    id: 'welcome-1',
    text: "مرحباً بك في نظام الاستشارات القانونية المصرية. كيف يمكنني مساعدتك اليوم؟",
    sender: "assistant",
    timestamp: new Date(),
  },
];

export default function Chat() {
  const locale = useLocale();
  const [session, setSession] = useState<ChatSession>({
    sessionId: '',
    messages: initialMessages
  });
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useStreaming, setUseStreaming] = useState(true);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Initialize session ID on component mount
  useEffect(() => {
    if (!session.sessionId) {
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setSession(prev => ({ ...prev, sessionId: newSessionId }));
    }
  }, [session.sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages, isTyping]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const handleScroll = () => {
      if (scrollContainer) {
        setIsScrolled(scrollContainer.scrollTop > 20);
      }
    };
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll();
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Send message to RAG service with streaming support
  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setUserInput("");

    // Add user message to chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: message.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));

    if (useStreaming) {
      await sendStreamingMessage(message.trim());
    } else {
      await sendRegularMessage(message.trim());
    }
  };

  // Regular (non-streaming) message sending
  const sendRegularMessage = async (message: string) => {
    setIsTyping(true);

    try {
      const data = await sendChatMessage({
        message: message,
        sessionId: session.sessionId,
        locale: locale,
      });

      // Add assistant response to chat
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        text: data.response,
        sender: "assistant",
        timestamp: new Date(),
        processingTime: data.processingTime_ms,
        sources: data.sources,
      };

      setSession(prev => ({
        sessionId: data.sessionId || prev.sessionId,
        messages: [...prev.messages, assistantMessage]
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      handleMessageError();
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Streaming message sending
  const sendStreamingMessage = async (message: string) => {
    setIsTyping(true);

    // Create a placeholder message for streaming
    const streamingMessageId = `assistant-${Date.now()}`;
    const streamingMessage: Message = {
      id: streamingMessageId,
      text: '',
      sender: "assistant",
      timestamp: new Date(),
      isStreaming: true,
    };

    setCurrentStreamingMessage(streamingMessage);
    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, streamingMessage]
    }));

    try {
      let finalResponse = '';
      let processingTime = 0;
      let finalSessionId = session.sessionId;

      for await (const chunk of sendStreamingChatMessage({
        message: message,
        sessionId: session.sessionId,
        locale: locale,
      })) {
        if (chunk.response) {
          finalResponse = chunk.response;

          // Update the streaming message
          setSession(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
              msg.id === streamingMessageId
                ? { ...msg, text: finalResponse }
                : msg
            )
          }));
        }

        if (chunk.processingTime_ms) {
          processingTime = chunk.processingTime_ms;
        }

        if (chunk.sessionId) {
          finalSessionId = chunk.sessionId;
        }

        // Handle processing steps for better UX
        if (chunk.processingSteps) {
          // Could show processing steps in UI if desired
          console.log('Processing steps:', chunk.processingSteps);
        }
      }

      // Finalize the message
      setSession(prev => ({
        sessionId: finalSessionId,
        messages: prev.messages.map(msg =>
          msg.id === streamingMessageId
            ? {
                ...msg,
                text: finalResponse,
                isStreaming: false,
                processingTime: processingTime
              }
            : msg
        )
      }));

    } catch (error) {
      console.error('Error sending streaming message:', error);

      // Remove the streaming message and add error message
      setSession(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== streamingMessageId)
      }));

      handleMessageError();
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setCurrentStreamingMessage(null);
    }
  };

  // Handle message errors
  const handleMessageError = () => {
    setError('عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');

    const errorMessage: Message = {
      id: `error-${Date.now()}`,
      text: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
      sender: "assistant",
      timestamp: new Date(),
    };

    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, errorMessage]
    }));
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(userInput);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(userInput);
  };

  const clearChat = () => {
    setSession({
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      messages: initialMessages
    });
    setError(null);
  };

  return (
    <div className="flex-1 relative bg-background">
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-auto px-4 pt-4 md:px-6 lg:px-8 pb-48"
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="my-4 flex items-center justify-center gap-4">
            <div className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80 shadow-xs">
              <RiShining2Line
                className="me-1.5 -ms-1 text-muted-foreground/70"
                size={14}
                aria-hidden="true"
              />
              الاستشارات القانونية
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={clearChat}
                disabled={isLoading}
              >
                محادثة جديدة
              </Button>
              <Button
                size="sm"
                variant={useStreaming ? "default" : "outline"}
                onClick={() => setUseStreaming(!useStreaming)}
                disabled={isLoading}
              >
                {useStreaming ? "البث المباشر" : "الرد العادي"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {session.messages.map((message) => (
              <ChatMessage
                key={message.id}
                isUser={message.sender === "user"}
              >
                <div>
                  <div className="relative">
                    <div
                      className="whitespace-pre-wrap prose prose-sm max-w-none"
                      style={{ wordBreak: "break-word", direction: "rtl" }}
                    >
                      <ReactMarkdown
                        components={{
                          // Custom components for better RTL styling
                          p: ({ children }) => <p className="mb-2 last:mb-0 text-right" dir="rtl">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          ul: ({ children }) => <ul className="mb-2 text-right" dir="rtl" style={{ listStyleType: 'disc', paddingRight: '1.5rem', paddingLeft: '0' }}>{children}</ul>,
                          ol: ({ children }) => <ol className="mb-2 text-right" dir="rtl" style={{ listStyleType: 'decimal', paddingRight: '1.5rem', paddingLeft: '0' }}>{children}</ol>,
                          li: ({ children }) => <li className="mb-1 text-right" dir="rtl">{children}</li>,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                      )}
                    </div>
                    {message.isStreaming && (
                      <div className="mt-1 text-xs text-muted-foreground animate-pulse">
                        جاري الكتابة...
                      </div>
                    )}
                  </div>
                  {message.processingTime && message.sender === "assistant" && !message.isStreaming && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      وقت المعالجة: {Math.round(message.processingTime / 1000)} ثانية
                    </div>
                  )}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      المصادر: {message.sources.length} وثيقة
                    </div>
                  )}
                </div>
              </ChatMessage>
            ))}

            {isTyping && (
              <div className="flex items-end gap-3 animate-pop-in">
                <img
                  className="rounded-full border border-black/[0.08] shadow-sm"
                  src="https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp2/user-01_i5l7tp.png"
                  alt="Legal Assistant"
                  width={40}
                  height={40}
                />
                <div className="typing-indicator">
                  <div className="typing-circle"></div>
                  <div className="typing-circle"></div>
                  <div className="typing-circle"></div>
                  <div className="typing-shadow"></div>
                  <div className="typing-shadow"></div>
                  <div className="typing-shadow"></div>
                </div>
              </div>
            )}

          </div>
          <div ref={messagesEndRef} aria-hidden="true" className="h-4" />
        </div>
      </div>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-background to-transparent transition-opacity duration-300 ease-in-out ${
          isScrolled ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl border-t border-border p-4">
          <form
            className="flex w-full flex-col gap-2"
            onSubmit={handleSubmit}
          >
            <Label htmlFor="user-input">اسأل سؤالاً قانونياً</Label>
            <div className="flex items-center gap-2">
              <Textarea
                id="user-input"
                placeholder="اكتب سؤالك القانوني هنا..."
                className="flex-1 resize-none bg-muted focus-visible:ring-1 focus-visible:ring-ring"
                rows={2}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                dir="rtl"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="إرسال السؤال"
                disabled={isLoading}
              >
                <SendHorizonalIcon className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
//END OF components/chatbot/chat.tsx