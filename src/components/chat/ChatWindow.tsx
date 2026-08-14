"use client";
// src/components/chat/ChatWindow.tsx

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import ProductRecommendationCard from "./ProductRecommendationCard";

const SUGGESTIONS = [
  "¿Qué PC me alcanza con S/. 3000?",
  "Armar PC compatible para Arquitectura/3D",
  "¿Placa y RAM DDR5 son compatibles?",
  "Servicio de Mantenimiento en Huancayo",
];

export default function ChatWindow() {
  const isOpen = useChatStore((s) => s.isOpen);
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearChat = useChatStore((s) => s.clearChat);
  const setIsOpen = useChatStore((s) => s.setIsOpen);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages list updates or chat opens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      // Small timeout to let transitions finish
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen, isLoading]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleSuggestionClick = async (text: string) => {
    if (isLoading) return;
    await sendMessage(text);
  };

  // Helper to parse basic markdown (**bold** and lists) into HTML react tags
  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let content: React.ReactNode = line;
      
      // Handle simple bullet lists starting with * or -
      const listRegex = /^[\s]*[\*\-][\s]+(.*)/;
      const isListItem = listRegex.test(line);

      if (isListItem) {
        const match = line.match(listRegex);
        content = match ? match[1] : line;
      }

      // Handle simple bold text **bold**
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        content = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return <strong key={pIdx} className="text-white font-bold">{part}</strong>;
          }
          return part;
        });
      }

      if (isListItem) {
        return (
          <li key={idx} className="ml-4 list-disc mb-1 leading-relaxed text-on-surface-variant">
            {content}
          </li>
        );
      }

      return (
        <p key={idx} className="mb-1.5 last:mb-0 leading-relaxed text-on-surface-variant">
          {content}
        </p>
      );
    });
  };

  return (
    <div
      className="fixed bottom-[96px] right-[24px] z-50 w-[calc(100vw-48px)] sm:w-[380px] h-[520px] flex flex-col rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden animate-slide-in-up"
      style={{
        background: "rgba(24, 17, 28, 0.95)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 10px 40px rgba(167, 0, 254, 0.12)",
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_10px_rgba(167,0,254,0.3)] animate-pulse">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          </div>
          <div>
            <h3 className="font-poppins text-xs font-extrabold text-white uppercase tracking-wider">
              Asistente Luteame AI
            </h3>
            <p className="font-montserrat text-[8px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Asesoría de Setup Activa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset button */}
          <button
            onClick={clearChat}
            className="text-on-surface-variant hover:text-white transition-colors p-1 rounded-full hover:bg-white/5"
            title="Reiniciar Conversación"
          >
            <span className="material-symbols-outlined text-lg">restart_alt</span>
          </button>
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-white/5"
            title="Cerrar Asistente"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>

      {/* Message History area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((m) => {
          const isBot = m.role === "assistant";
          return (
            <div key={m.id} className={`flex ${isBot ? "justify-start" : "justify-end"} animate-fade-in`}>
              <div className="max-w-[85%] space-y-1.5">
                {/* Bubble */}
                <div
                  className={`p-3.5 rounded-2xl font-montserrat text-[11px] leading-relaxed border ${
                    isBot
                      ? "bg-surface-container-low/50 border-outline-variant/10 text-on-surface-variant rounded-tl-sm"
                      : "bg-primary-container/20 border-primary-container/30 text-white rounded-tr-sm"
                  }`}
                >
                  {isBot ? renderFormattedText(m.content) : <p>{m.content}</p>}
                </div>

                {/* Recommendations Cards (If any) */}
                {isBot && m.recomendaciones && m.recomendaciones.length > 0 && (
                  <div className="space-y-1 animate-fade-in mt-2 pl-2 border-l border-primary/30">
                    <p className="font-montserrat text-[9px] text-primary uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">shopping_basket</span>
                      Componentes Recomendados:
                    </p>
                    {m.recomendaciones.map((id) => (
                      <ProductRecommendationCard key={id} productId={id} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Suggestion Chips - Only show at start (when only welcome message exists) */}
        {messages.length === 1 && !isLoading && (
          <div className="pt-2 animate-fade-in text-center space-y-2">
            <p className="font-montserrat text-[9px] text-on-surface-variant uppercase font-bold tracking-widest">
              Preguntas sugeridas
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(sug)}
                  className="font-montserrat text-[10px] text-on-surface-variant font-bold border border-outline-variant/15 rounded-lg py-2 px-3 hover:border-primary-container/30 hover:bg-white/5 hover:text-white transition-all text-left flex justify-between items-center gap-2"
                >
                  <span>{sug}</span>
                  <span className="material-symbols-outlined text-xs text-primary">arrow_forward_ios</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading typing state */}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="p-3 bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl rounded-tl-sm flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <div className="p-3 border-t border-outline-variant/10 bg-surface-container-lowest/60 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          placeholder={isLoading ? "Luteame AI está pensando..." : "Pregúntame sobre componentes, presupuestos..."}
          className="flex-grow bg-surface-container border border-outline-variant/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary-container placeholder:text-[10px] placeholder:text-on-surface-variant/40"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-container text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shrink-0 transition-colors"
          aria-label="Enviar pregunta"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </div>
    </div>
  );
}
