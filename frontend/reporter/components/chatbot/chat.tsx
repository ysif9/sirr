"use client";

import { Button } from "@/components/ui/button";
import { RiShining2Line } from "@remixicon/react"; // We don't need RiRobot2Line anymore
import { ChatMessage } from "@/components/chatbot/chat-message";
import { useRef, useEffect, useState, KeyboardEvent, FormEvent } from "react";
import { SendHorizonalIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Message = {
  id: number;
  text: string;
  sender: "user" | "chatbot";
};

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hey, can you tell me more about AI Agents?",
    sender: "user",
  },
  {
    id: 2,
    text: "AI agents are software that perceive their environment and act autonomously to achieve goals. For example, an agent might schedule meetings by resolving conflicts and contacting participants, all without constant supervision.",
    sender: "chatbot",
  },
  {
    id: 3,
    text: "All clear, thank you!",
    sender: "user",
  },
  {
    id: 4, text: "That's fascinating. How do they differ from traditional programs?", sender: "user"
  },
  {
    id: 5, text: "Traditional programs follow a fixed set of instructions. AI agents, on the other hand, can learn and adapt their behavior based on new information and experiences, making them more flexible and intelligent.", sender: "chatbot"
  },
  {
    id: 6, text: "Can you give me another example?", sender: "user"
  },
  {
    id: 7, text: "Certainly. A Roomba vacuum cleaner is a simple AI agent. It perceives its environment (the room, obstacles, dirt) and acts autonomously (moves around, cleans) to achieve its goal (a clean floor). More complex agents manage stock portfolios or even drive cars.", sender: "chatbot"
  },
  {
    id: 8, text: "Wow, the applications seem endless. Thanks for the clear explanation!", sender: "user"
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [reporterInput, setReporterInput] = useState("");
  const [chatbotInput, setChatbotInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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

  const handleSendMessage = (text: string, sender: "user" | "chatbot") => {
    if (text.trim() === "") return;
    
    setIsTyping(false);

    const newMessage: Message = {
      id: Date.now(),
      text,
      sender,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    if (sender === "user") {
      setReporterInput("");
    } else {
      setChatbotInput("");
    }
  };

  const handleKeyPress = (
    e: KeyboardEvent<HTMLTextAreaElement>,
    sender: "user" | "chatbot",
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (sender === "user") {
        handleSendMessage(reporterInput, "user");
      } else {
        handleSendMessage(chatbotInput, "chatbot");
      }
    }
  };

  const handleDemoTyping = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 3000);
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
              Today
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDemoTyping}
              disabled={isTyping}
            >
              Demo Typing
            </Button>
          </div>

          <div className="space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                isUser={message.sender === "user"}
              >
                <p
                  className="whitespace-pre-wrap"
                  style={{ wordBreak: "break-word" }}
                >
                  {message.text}
                </p>
              </ChatMessage>
            ))}
            
            {/* CORRECTED: Replicates ChatMessage layout with the correct avatar */}
            {isTyping && (
              <div className="flex items-end gap-3 animate-pop-in">
                {/* Avatar from your ChatMessage component */}
                <img
                  className="rounded-full border border-black/[0.08] shadow-sm"
                  src="https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp2/user-01_i5l7tp.png"
                  alt="Bart logo"
                  width={40}
                  height={40}
                />
                {/* Typing indicator */}
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
        <div className="mx-auto grid max-w-4xl gap-4 border-t border-border p-4 md:grid-cols-2">
          {/* Reporter (User) Input */}
          <form
            className="flex w-full flex-col gap-2"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              handleSendMessage(reporterInput, "user");
            }}
          >
            <Label htmlFor="reporter-input">Reporter (User)</Label>
            <div className="flex items-center gap-2">
              <Textarea
                id="reporter-input"
                placeholder="Type user message..."
                className="flex-1 resize-none bg-muted focus-visible:ring-1 focus-visible:ring-ring"
                rows={2}
                value={reporterInput}
                onChange={(e) => setReporterInput(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, "user")}
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Send as Reporter"
                disabled={!reporterInput.trim()}
              >
                <SendHorizonalIcon className="h-5 w-5" />
              </Button>
            </div>
          </form>

          {/* Chatbot (AI) Input */}
          <form
            className="flex w-full flex-col gap-2"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              handleSendMessage(chatbotInput, "chatbot");
            }}
          >
            <Label htmlFor="chatbot-input">Chatbot (AI)</Label>
            <div className="flex items-center gap-2">
              <Textarea
                id="chatbot-input"
                placeholder="Type AI response..."
                className="flex-1 resize-none bg-muted focus-visible:ring-1 focus-visible:ring-ring"
                rows={2}
                value={chatbotInput}
                onChange={(e) => setChatbotInput(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, "chatbot")}
              />
              <Button
                type="submit"
                size="icon"
                variant="secondary"
                aria-label="Send as Chatbot"
                disabled={!chatbotInput.trim()}
              >
                <SendHorizonalIcon className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}