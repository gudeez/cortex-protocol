"use client";

import Link from "next/link";
import { Github } from "lucide-react";
import { XIcon, DiscordIcon, TelegramIcon } from "./SocialIcons";

export function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
          <span>Cortex Protocol 2026</span>
          <span className="hidden md:inline">·</span>
          <Link href="/about" className="hover:text-[var(--primary)] transition-colors">
            About
          </Link>
          <Link href="/docs" className="hover:text-[var(--primary)] transition-colors">
            Docs
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/gudeez/cortex-protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-[var(--text-muted)]"
            aria-label="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href="#"
            className="w-9 h-9 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-[var(--text-muted)]"
            aria-label="X (Twitter)"
          >
            <XIcon className="w-4 h-4" />
          </a>
          <a
            href="#"
            className="w-9 h-9 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-[var(--text-muted)]"
            aria-label="Discord"
          >
            <DiscordIcon className="w-4 h-4" />
          </a>
          <a
            href="#"
            className="w-9 h-9 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-[var(--text-muted)]"
            aria-label="Telegram"
          >
            <TelegramIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
