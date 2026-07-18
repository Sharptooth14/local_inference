"use client";

import { useRef, useEffect, KeyboardEvent } from "react";
import styles from "./ChatInput.module.css";

interface Props {
  onSend: (text: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, onStop, isGenerating, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  });

  // Focus on mount
  useEffect(() => {
    if (!isGenerating) textareaRef.current?.focus();
  }, [isGenerating]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const el = textareaRef.current;
    if (!el || !el.value.trim() || isGenerating) return;
    onSend(el.value);
    el.value = "";
    el.style.height = "auto";
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder={
            disabled
              ? "Server offline — start Ollama first"
              : "Message your local LLM... (Enter to send, Shift+Enter for new line)"
          }
          onKeyDown={handleKeyDown}
          disabled={isGenerating || disabled}
          rows={1}
        />
        <div className={styles.actions}>
          {isGenerating ? (
            <button
              className={`${styles.btn} ${styles.stopBtn}`}
              onClick={onStop}
              aria-label="Stop generation"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Stop
            </button>
          ) : (
            <button
              className={`${styles.btn} ${styles.sendBtn}`}
              onClick={handleSend}
              disabled={disabled}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send
            </button>
          )}
        </div>
      </div>
      <p className={styles.hint}>
        Running locally · No data leaves your machine
      </p>
    </div>
  );
}
