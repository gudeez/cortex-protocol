"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ArrowDown, Loader2, CheckCircle } from "lucide-react";
import { LIVE_MODELS, TOKEN_PRICES, mockSwap } from "@/lib/mock-data";

export function TokenSwap() {
  const { isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState(LIVE_MODELS[0].token);
  const [ethAmount, setEthAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ txHash: string; tokensReceived: number } | null>(null);

  const price = TOKEN_PRICES[selectedToken] || 0.0001;
  const parsedAmount = parseFloat(ethAmount) || 0;
  const tokensOut = parsedAmount > 0 ? parsedAmount / price : 0;

  const selectedModel = LIVE_MODELS.find((m) => m.token === selectedToken)!;

  async function handleSwap() {
    if (!parsedAmount || !isConnected) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await mockSwap(selectedToken, parsedAmount);
      setResult(res);
      setEthAmount("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
      <div className="mb-4">
        <label className="text-xs text-[var(--text-muted)] mb-2 block">You pay</label>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="0.0"
            value={ethAmount}
            onChange={(e) => {
              setEthAmount(e.target.value);
              setResult(null);
            }}
            min="0"
            step="0.001"
            className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-lg font-mono focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
          <div className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm font-medium">
            <div className="w-5 h-5 rounded-full bg-[#627eea]" />
            ETH
          </div>
        </div>
      </div>

      <div className="flex justify-center my-3">
        <ArrowDown className="w-5 h-5 text-[var(--text-muted)]" />
      </div>

      <div className="mb-6">
        <label className="text-xs text-[var(--text-muted)] mb-2 block">You receive</label>
        <div className="flex gap-3">
          <div className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-lg font-mono text-[var(--text-muted)]">
            {tokensOut > 0 ? tokensOut.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0"}
          </div>
          <select
            value={selectedToken}
            onChange={(e) => {
              setSelectedToken(e.target.value);
              setResult(null);
            }}
            className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-3 text-sm font-medium focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer"
          >
            {LIVE_MODELS.map((m) => (
              <option key={m.token} value={m.token}>
                {m.token}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-2 text-xs text-[var(--text-muted)]">
          1 {selectedToken} = {price} ETH
          <span className="mx-2">·</span>
          <span style={{ color: selectedModel.color }}>{selectedModel.name}</span> DAO
        </div>
      </div>

      <button
        onClick={handleSwap}
        disabled={!isConnected || !parsedAmount || loading}
        className="w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Swapping...
          </>
        ) : !isConnected ? (
          "Connect Wallet First"
        ) : (
          `Swap for ${selectedToken}`
        )}
      </button>

      {result && (
        <div className="mt-4 p-3 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-lg text-sm">
          <div className="flex items-center gap-2 text-[var(--success)] font-medium mb-1">
            <CheckCircle className="w-4 h-4" />
            Swap successful!
          </div>
          <div className="text-[var(--text-muted)] font-mono text-xs truncate">
            Received {result.tokensReceived.toLocaleString(undefined, { maximumFractionDigits: 0 })} {selectedToken}
          </div>
          <div className="text-[var(--text-muted)] font-mono text-xs truncate mt-1">
            Tx: {result.txHash}
          </div>
        </div>
      )}
    </div>
  );
}
