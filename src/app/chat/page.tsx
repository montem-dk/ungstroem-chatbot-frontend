"use client";
import { useEffect, useState, useRef } from "react";
import { useChatStore } from "@/lib/store";
import { useAuthStore } from "@/lib/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const { messages, addMessage } = useChatStore();
  const { token } = useAuthStore();
  const router = useRouter();

  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  interface ChatMessage {
    id: string;
    sender: "user" | "bot";
    text: string;
  }
  
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (!storedToken) router.push("/auth/login");
  }, [token, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    // capture existing messages BEFORE adding the new one to avoid duplicating in payload
    const prevMsgs = useChatStore.getState().messages;

    const userMsg = { id: Date.now().toString(), sender: "user" as const, text: input } as ChatMessage;
    addMessage(userMsg); // render immediately

    const allMessages = [...prevMsgs, userMsg];

    setInput("");
    setIsSending(true);
    setIsStreaming(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: allMessages }),
    }).catch(() => null);

    setIsSending(false);
    if (!res || !res.body) {
      setIsStreaming(false);
      console.error("No response body from backend");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let botMessage = "";
    const messageId = Math.random().toString();
    let created = false; // <-- local flag ensures a single bot bubble

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (!chunk) continue;

      botMessage += chunk;

      if (!created) {
        created = true;
        addMessage({ id: messageId, sender: "bot" as const, text: botMessage } as ChatMessage);
      } else {
        useChatStore.setState((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, text: botMessage } : m
          ),
        }));
      }
    }

    setIsStreaming(false);
  };

  const newChat = () => {
    try {
      useChatStore.getState().clearMessages();
    } catch {}
  };

  const logout = () => {
    try {
      localStorage.removeItem("auth_token");
      (useAuthStore as any).setState?.({ user: null, token: null });
    } catch {}
    router.push("/auth/login");
  };

  const renderMessage = (text: string) => {
    const parts = text.split("```");
    if (parts.length === 1) return <span>{text}</span>;
    return (
      <div className="space-y-3">
        {parts.map((p, i) =>
          i % 2 === 1 ? (
            <pre
              key={i}
              className="overflow-x-auto rounded-xl border border-black bg-gray-50 px-3 py-2 text-[13px] leading-relaxed"
            >
              <code>{p}</code>
            </pre>
          ) : (
            <p key={i} className="whitespace-pre-wrap">{p}</p>
          )
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-white border border-black shadow-sm"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white border-r border-black transition-transform duration-200 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:translate-x-0`}
      >
        {/* Top: logo */}
        <div className="h-[64px] flex items-center gap-3 px-4 border-b border-black">
          <img src="/ungstrøm.avif" alt="Logo" className="h-7 w-7" />
          <span className="text-sm font-semibold text-gray-900">Ungstrøm</span>
        </div>

        <div className="flex flex-col h-[calc(100%-64px)]">
          <div className="p-4 space-y-3 overflow-y-auto">
            <button
              onClick={newChat}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#153f68] text-white px-3 py-2.5 text-sm font-medium shadow-sm hover:opacity-95"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 11V5a1 1 0 1 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6z" />
              </svg>
              New chat
            </button>

            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-600">
              Chat history
              <span className="block text-xs text-gray-500 mt-1">Feature coming soon</span>
            </div>
          </div>

          {/* Logout at bottom */}
          <div className="p-4 mt-auto border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full inline-flex items-center text-white justify-center gap-2 rounded-xl border border-black bg-[#153f68] px-3 py-2.5 text-sm font-medium hover:bg-gray-50 hover:text-black"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 17v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2h-2V5H7v14h7v-2h2z" />
                <path d="M21 12l-4-4v3h-7v2h7v3l4-4z" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                {m.sender !== "user" && (
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#153f68] text-white text-xs font-bold shadow-sm">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm
                    ${m.sender === "user" ? "bg-[#153f68] text-white rounded-br-none" : "bg-white border border-black text-gray-800 rounded-bl-none"}`}
                >
                  {renderMessage(m.text)}
                </div>
                {m.sender === "user" && (
                  <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-gray-700 text-xs font-semibold shadow-sm">U</div>
                )}
              </div>
            ))}

            {/* Single typing indicator until the first chunk arrives */}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#153f68] text-white text-xs font-bold shadow-sm">AI</div>
                <div className="rounded-2xl rounded-bl-none border border-black bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Composer (bigger input) */}
        <div className="border-t border-black bg-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Send a message..."
                  className="h-12 text-[15px] bg-gray-50 border-black focus-visible:ring-[#153f68] focus-visible:border-[#153f68] rounded-xl px-4"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                {/* <div className="mt-2 text-xs text-gray-500">
                  Press <kbd className="rounded border bg-gray-50 px-1">Enter</kbd> to send.
                </div> */}
              </div>

              <Button
                onClick={sendMessage}
                className="h-12 rounded-xl bg-[#153f68] hover:bg-[#124366] text-white px-5 min-w-[110px] flex items-center justify-center gap-2"
                disabled={isStreaming}
              >
                {isSending || isStreaming ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending
                  </>
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
