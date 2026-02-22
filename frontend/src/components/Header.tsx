"use client";

import Link from "next/link";
import { Brain } from "lucide-react";
import { ConnectButton } from "./ConnectButton";

export function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center glow-primary">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Cortex Protocol</h1>
            <p className="text-xs text-[var(--text-muted)]">Agent Governance Platform</p>
          </div>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/about" className="hover:text-[var(--primary)] transition-colors">
            About
          </Link>
          <Link href="/proposals" className="hover:text-[var(--primary)] transition-colors">
            Proposals
          </Link>
          <Link href="/docs" className="hover:text-[var(--primary)] transition-colors">
            Docs
          </Link>
          <ConnectButton />
        </nav>
      </div>
    </header>
  );
}
