"use client";

import { LLM_CONFIG } from "@/config/llm";
import styles from "./Sidebar.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  availableModels: string[];
  onClear: () => void;
}

export default function Sidebar({ isOpen, onClose, availableModels, onClear }: Props) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Local LLM</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Model Info */}
        <section className={styles.section}>
          <h3 className={styles.sectionLabel}>Active Model</h3>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Model</span>
              <span className={styles.infoValue}>{LLM_CONFIG.model}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Engine</span>
              <span className={styles.infoValue}>{LLM_CONFIG.engineName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Endpoint</span>
              <span className={styles.infoValueSmall}>{LLM_CONFIG.apiBaseUrl}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Temp</span>
              <span className={styles.infoValue}>{LLM_CONFIG.temperature}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Max Tokens</span>
              <span className={styles.infoValue}>{LLM_CONFIG.maxTokens}</span>
            </div>
          </div>
        </section>

        {/* Available Models */}
        {availableModels.length > 0 && (
          <section className={styles.section}>
            <h3 className={styles.sectionLabel}>Available Models</h3>
            <div className={styles.modelList}>
              {availableModels.map((m) => (
                <div
                  key={m}
                  className={`${styles.modelItem} ${m === LLM_CONFIG.model ? styles.activeModel : ""}`}
                >
                  <span className={styles.modelDot} />
                  {m}
                  {m === LLM_CONFIG.model && (
                    <span className={styles.activeBadge}>active</span>
                  )}
                </div>
              ))}
            </div>
            <p className={styles.switchHint}>
              Edit <code>src/config/llm.ts</code> to switch models.
            </p>
          </section>
        )}

        {/* Actions */}
        <section className={styles.section}>
          <button className={styles.clearBtn} onClick={() => { onClear(); onClose(); }}>
            Clear Conversation
          </button>
        </section>

        <div className={styles.footer}>
          <p>Local LLM · Phase 5</p>
          <p>RTX 3060 · 6GB VRAM</p>
        </div>
      </aside>
    </>
  );
}
