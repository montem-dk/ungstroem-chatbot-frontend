import { create } from "zustand";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [{ id: "1", sender: "bot", text: "Hvilken afdeling er du i? Vælg blandt: Brandelev, City, Solo 11C, Solo 11D, Solo 11E, Solo 11F, Solo Villavej."}],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearMessages: () => set({ messages: [{ id: "1", sender: "bot", text: "Hvilken afdeling er du i? Vælg blandt: Brandelev, City, Solo 11C, Solo 11D, Solo 11E, Solo 11F, Solo Villavej."}]}),
}));
