"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Message } from "@/config/llm";
import { streamChat, generateId, getAvailableModels } from "@/lib/api";
import { LLM_CONFIG } from "@/config/llm";
import MessageBubble from "@/components/MessageBubble";
import ChatInput from "@/components/ChatInput";
import Sidebar from "@/components/Sidebar";
import styles from "./Chat.module.css";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Check server status on mount
  useEffect(() => {
    getAvailableModels().then((models) => {
      setServerOnline(models.length > 0);
      setAvailableModels(models);
    });
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isGenerating) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    const assistantId = generateId();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsGenerating(true);

    abortRef.current = new AbortController();

    try {
      const history = [...messages, userMessage];
      await streamChat(
        history,
        (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + token } : m
            )
          );
        },
        () => setIsGenerating(false),
        abortRef.current.signal
      );
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: isAbort
                  ? m.content + "\n\n*[Generation stopped]*"
                  : `*Error: ${err instanceof Error ? err.message : "Unknown error"}*`,
              }
            : m
        )
      );
      setIsGenerating(false);
    }
  }, [isGenerating, messages]);

  const handleStop = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
  };

  const handleClear = () => {
    if (!isGenerating) setMessages([]);
  };

  return (
    <div className={styles.layout}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        availableModels={availableModels}
        onClear={handleClear}
      />

      <div className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <span /><span /><span />
          </button>

          <div className={styles.headerCenter}>
            <div className={styles.modelPill}>
              <span className={styles.engineDot} />
              <span>{LLM_CONFIG.modelDisplayName}</span>
            </div>
          </div>

          <div className={styles.serverStatus}>
            <span
              className={`${styles.statusDot} ${
                serverOnline === null
                  ? styles.statusChecking
                  : serverOnline
                  ? styles.statusOnline
                  : styles.statusOffline
              }`}
            />
            <span className={styles.statusLabel}>
              {serverOnline === null
                ? "Checking..."
                : serverOnline
                ? "Online"
                : "Offline"}
            </span>
          </div>
        </header>

        {/* Messages */}
        <main className={styles.messagesArea}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⚡</div>
              <h2 className={styles.emptyTitle}>Local LLM Ready</h2>
              <p className={styles.emptySubtitle}>
                Running <strong>{LLM_CONFIG.modelDisplayName}</strong> via{" "}
                {LLM_CONFIG.engineName} on your RTX 3060.
              </p>
              <div className={styles.suggestions}>
                {[
                  "Explain KV Cache in simple terms",
                  "Write a Python function to calculate VRAM usage",
                  "What is the difference between AWQ and GGUF?",
                  "How does PagedAttention work?",
                ].map((s) => (
                  <button
                    key={s}
                    className={styles.suggestionChip}
                    onClick={() => handleSend(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={
                  isGenerating &&
                  msg.role === "assistant" &&
                  msg.id === messages[messages.length - 1]?.id
                }
              />
            ))
          )}
          <div ref={bottomRef} />
        </main>

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isGenerating={isGenerating}
          disabled={serverOnline === false}
        />
      </div>
    </div>
  );
}
