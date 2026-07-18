import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Local LLM — Chat",
  description: "A local AI chat UI running on your RTX 3060 via Ollama. Phase 5 of the Local LLM MLOps learning roadmap.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
