"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Wallet, LogOut } from "lucide-react";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] px-4 py-2 rounded-lg font-medium transition-colors text-sm"
      >
        <Wallet className="w-4 h-4 text-[var(--success)]" />
        {address.slice(0, 6)}...{address.slice(-4)}
        <LogOut className="w-3 h-3 text-[var(--text-muted)]" />
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] px-4 py-2 rounded-lg font-medium transition-colors"
    >
      Connect Wallet
    </button>
  );
}
