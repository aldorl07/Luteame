import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  recomendaciones?: string[]; // Product IDs
  timestamp: Date;
}

interface ChatStore {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  toggleChat: () => void;
  setIsOpen: (open: boolean) => void;
  clearChat: () => void;
  sendMessage: (content: string) => Promise<void>;
}

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "¡Hola! Gamer, soy el asesor inteligente de Luteame. 🎮💻\n\n¿Buscas configurar la PC de tus sueños, mejorar tu setup actual, o tienes dudas sobre compatibilidad de componentes? Dime tu presupuesto o lo que necesitas hacer y te guiaré con lo mejor de nuestra tienda en Huancayo.",
  timestamp: new Date(),
};

export const useChatStore = create<ChatStore>((set, get) => ({
  isOpen: false,
  messages: [INITIAL_WELCOME_MESSAGE],
  isLoading: false,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (open) => set({ isOpen: open }),

  clearChat: () => set({
    messages: [{ ...INITIAL_WELCOME_MESSAGE, timestamp: new Date() }],
    isLoading: false,
  }),

  sendMessage: async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Append user message and set loader
    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    try {
      // Get all current messages to send as history context
      const chatHistory = get().messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!res.ok) {
        throw new Error("Falla al conectar con el servidor de IA.");
      }

      const data = await res.json();
      const rawText = data.text || "";

      // Parser logic to extract JSON recommendations if present in response
      let cleanText = rawText;
      let recomendaciones: string[] = [];

      try {
        // Regex to match markdown code block with JSON: ```json ... ```
        const jsonBlockRegex = /```json\s*(\{[\s\S]*?\})\s*```/;
        const match = rawText.match(jsonBlockRegex);

        if (match && match[1]) {
          const parsedJson = JSON.parse(match[1]);
          if (parsedJson && Array.isArray(parsedJson.recomendaciones)) {
            recomendaciones = parsedJson.recomendaciones;
          }
          // Remove the JSON code block from the message body so it looks clean to the user
          cleanText = rawText.replace(jsonBlockRegex, "").trim();
        }
      } catch (err) {
        console.error("Error parsing recommended products JSON block:", err);
      }

      const botMessage: ChatMessage = {
        id: `msg_${Date.now()}_bot`,
        role: "assistant",
        content: cleanText || "Aquí tienes algunas sugerencias:",
        recomendaciones: recomendaciones.length > 0 ? recomendaciones : undefined,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, botMessage],
        isLoading: false,
      }));
    } catch (err: any) {
      console.error("Chat Store Send Error:", err);

      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: "assistant",
        content: "Lo siento, tuve un problema de conexión con mi procesador cerebral Gemini. Por favor, reintenta tu pregunta o contáctanos por WhatsApp.",
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
      }));
    }
  },
}));
