import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meeting Summarizer | AI-Powered Meeting Notes",
  description:
    "Transform messy meeting recordings and transcripts into clean, actionable summaries using local AI. Supports text, file upload, and audio recording.",
  keywords: [
    "meeting notes",
    "AI summarizer",
    "transcription",
    "audio recording",
    "Ollama",
    "local AI",
  ],
  openGraph: {
    title: "Meeting Summarizer",
    description: "AI-powered meeting summarization with local LLM",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
