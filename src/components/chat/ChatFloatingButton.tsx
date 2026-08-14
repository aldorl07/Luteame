"use client";
// src/components/chat/ChatFloatingButton.tsx

import { useChatStore } from "@/store/chatStore";

export default function ChatFloatingButton() {
  const isOpen = useChatStore((s) => s.isOpen);
  const toggleChat = useChatStore((s) => s.toggleChat);

  return (
    <button
      onClick={toggleChat}
      className={`fixed bottom-[24px] right-[24px] z-50 w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 transform hover:-translate-y-1 active:scale-95 ${
        isOpen
          ? "bg-surface-container-lowest border-outline-variant/30 text-primary shadow-lg"
          : "bg-primary border-primary-container/20 text-white shadow-[0_0_25px_rgba(167,0,254,0.35)] hover:shadow-[0_0_35px_rgba(167,0,254,0.5)]"
      }`}
      aria-label="Alternar Asistente de IA"
    >
      {/* Pulse effect rings around button when closed */}
      {!isOpen && (
        <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping pointer-events-none" style={{ animationDuration: "2s" }} />
      )}

      {/* Morphing Icons */}
      <span className={`material-symbols-outlined text-[26px] transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}>
        {isOpen ? "close" : "smart_toy"}
      </span>

      {/* Hover tooltip label */}
      {!isOpen && (
        <span className="absolute right-16 bg-surface-container-low border border-outline-variant/10 text-white font-montserrat text-[10px] uppercase font-bold tracking-wider py-1.5 px-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap hidden sm:inline-block">
          Asistente IA Setup
        </span>
      )}
    </button>
  );
}
