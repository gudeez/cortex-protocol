"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageSquare, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MOCK_PROPOSALS, LIVE_MODELS, type ProposalStatus } from "@/lib/mock-data";

const STATUS_STYLES: Record<ProposalStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-[var(--success)]/20", text: "text-[var(--success)]", label: "Active" },
  passed: { bg: "bg-[#3b82f6]/20", text: "text-[#3b82f6]", label: "Passed" },
  defeated: { bg: "bg-[#ef4444]/20", text: "text-[#ef4444]", label: "Defeated" },
  pending: { bg: "bg-[#eab308]/20", text: "text-[#eab308]", label: "Pending" },
};

export default function ProposalsPage() {
  const [filter, setFilter] = useState<ProposalStatus | "all">("all");

  const filtered = filter === "all"
    ? MOCK_PROPOSALS
    : MOCK_PROPOSALS.filter((p) => p.status === filter);

  return (
    <div className="min-h-screen bg-gradient-animated">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="w-6 h-6 text-[var(--accent)]" />
          <h2 className="text-3xl font-bold">Governance Proposals</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(["all", "active", "passed", "defeated", "pending"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === s
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text-muted)]"
              }`}
            >
              {s === "all" ? "All" : STATUS_STYLES[s].label}
              {s === "all" && (
                <span className="ml-1.5 text-xs opacity-70">{MOCK_PROPOSALS.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Proposal List */}
        <div className="space-y-4">
          {filtered.map((proposal) => {
            const style = STATUS_STYLES[proposal.status];
            const model = LIVE_MODELS.find((m) => m.id === proposal.model);
            const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
            const forPct = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
            const againstPct = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;

            return (
              <Link
                key={proposal.id}
                href={`/proposals/${proposal.id}`}
                className="block bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 card-hover hover:border-[var(--primary)]/50"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {model && (
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium text-white"
                        style={{ backgroundColor: model.color }}
                      >
                        {model.name}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-1" />
                </div>

                <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
                <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">
                  {proposal.description.split("\n")[0]}
                </p>

                {totalVotes > 0 && (
                  <div className="mb-3">
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-[var(--background)]">
                      <div
                        className="bg-[var(--success)] rounded-l-full"
                        style={{ width: `${forPct}%` }}
                      />
                      <div
                        className="bg-[#ef4444] rounded-r-full"
                        style={{ width: `${againstPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                      <span>For: {(proposal.votesFor / 1000).toFixed(0)}K</span>
                      <span>Against: {(proposal.votesAgainst / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span>By {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                  <span>·</span>
                  <span>{proposal.token}</span>
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-[var(--text-muted)]">
              No proposals found for this filter.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
