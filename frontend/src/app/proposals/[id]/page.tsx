"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MOCK_PROPOSALS, LIVE_MODELS, type ProposalStatus } from "@/lib/mock-data";

const STATUS_STYLES: Record<ProposalStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-[var(--success)]/20", text: "text-[var(--success)]", label: "Active" },
  passed: { bg: "bg-[#3b82f6]/20", text: "text-[#3b82f6]", label: "Passed" },
  defeated: { bg: "bg-[#ef4444]/20", text: "text-[#ef4444]", label: "Defeated" },
  pending: { bg: "bg-[#eab308]/20", text: "text-[#eab308]", label: "Pending" },
};

export default function ProposalDetailPage() {
  const params = useParams();
  const { isConnected } = useAccount();
  const [userVote, setUserVote] = useState<"for" | "against" | "abstain" | null>(null);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);

  const proposal = MOCK_PROPOSALS.find((p) => p.id === params.id);

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gradient-animated">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Proposal Not Found</h2>
          <p className="text-[var(--text-muted)] mb-8">
            The proposal you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/proposals"
            className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Proposals
          </Link>
        </div>
      </div>
    );
  }

  const model = LIVE_MODELS.find((m) => m.id === proposal.model);
  const style = STATUS_STYLES[proposal.status];
  const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  const forPct = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  const againstPct = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
  const abstainPct = totalVotes > 0 ? (proposal.votesAbstain / totalVotes) * 100 : 0;

  const endsAt = new Date(proposal.endsAt);
  const now = new Date();
  const timeLeft = endsAt.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

  async function handleVote(choice: "for" | "against" | "abstain") {
    setUserVote(choice);
    setVoting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setVoting(false);
    setVoted(true);
  }

  return (
    <div className="min-h-screen bg-gradient-animated">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/proposals"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Proposals
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {model && (
              <span
                className="text-xs px-2 py-1 rounded-full font-medium text-white"
                style={{ backgroundColor: model.color }}
              >
                {model.name} DAO
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${style.bg} ${style.text}`}>
              {style.label}
            </span>
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-[var(--card)] border border-[var(--border)] text-[var(--text-muted)]">
              {proposal.token}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{proposal.title}</h1>
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <span>Proposed by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {daysLeft > 0 ? `${daysLeft} days left` : "Ended"}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-semibold mb-4">Description</h3>
              <div className="text-[var(--text-muted)] whitespace-pre-line text-sm leading-relaxed">
                {proposal.description}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vote Breakdown */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-semibold mb-4">Vote Breakdown</h3>

              <div className="space-y-4">
                <VoteBar label="For" count={proposal.votesFor} pct={forPct} color="var(--success)" />
                <VoteBar label="Against" count={proposal.votesAgainst} pct={againstPct} color="#ef4444" />
                <VoteBar label="Abstain" count={proposal.votesAbstain} pct={abstainPct} color="var(--text-muted)" />
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)] text-sm text-[var(--text-muted)]">
                Total votes: {totalVotes.toLocaleString()}
              </div>
            </div>

            {/* Cast Vote */}
            {proposal.status === "active" && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
                <h3 className="font-semibold mb-4">Cast Your Vote</h3>

                {!isConnected ? (
                  <p className="text-sm text-[var(--text-muted)]">
                    Connect your wallet to vote on this proposal.
                  </p>
                ) : voted ? (
                  <div className="flex items-center gap-2 text-[var(--success)] text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Vote submitted: <span className="font-medium capitalize">{userVote}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(["for", "against", "abstain"] as const).map((choice) => (
                      <button
                        key={choice}
                        onClick={() => handleVote(choice)}
                        disabled={voting}
                        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all border disabled:opacity-50 ${
                          choice === "for"
                            ? "border-[var(--success)] text-[var(--success)] hover:bg-[var(--success)]/10"
                            : choice === "against"
                            ? "border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10"
                            : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--card-hover)]"
                        }`}
                      >
                        {voting && userVote === choice ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </span>
                        ) : (
                          <span className="capitalize">{choice}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-semibold mb-4">Timeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Created</span>
                  <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Ends</span>
                  <span>{new Date(proposal.endsAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function VoteBar({ label, count, pct, color }: { label: string; count: number; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-[var(--text-muted)]">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--background)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-xs text-[var(--text-muted)] mt-1">
        {count.toLocaleString()} votes
      </div>
    </div>
  );
}
