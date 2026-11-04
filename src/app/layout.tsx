import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "ROCm Benchmark Hub",
    template: "%s · ROCm Benchmark Hub",
  },
  description:
    "Compare AMD Instinct, Radeon, and NVIDIA GPUs on Llama 3, DeepSeek, Stable Diffusion, PyTorch training, and vLLM serving.",
};

export const instant = false;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--line)] py-8 text-center text-xs text-[var(--muted)]">
          Community benchmark results for AI engineers evaluating AMD GPUs on ROCm.
        </footer>
      </body>
    </html>
  );
}
