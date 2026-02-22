export const LIVE_MODELS = [
  { id: "claude", name: "Claude", company: "Anthropic", color: "#f5a623", token: "CORCLAUDE" },
  { id: "gpt", name: "GPT", company: "OpenAI", color: "#10a37f", token: "CORGPT" },
  { id: "gemini", name: "Gemini", company: "Google DeepMind", color: "#4285f4", token: "CORGEMINI" },
  { id: "grok", name: "Grok", company: "xAI", color: "#1a1a2e", token: "CORGROK" },
  { id: "minimax", name: "MiniMax", company: "MiniMax", color: "#ff6b6b", token: "CORMINIMAX" },
  { id: "deepseek", name: "DeepSeek", company: "DeepSeek AI", color: "#7c3aed", token: "CORDEEPSEEK" },
] as const;

export type LiveModel = (typeof LIVE_MODELS)[number];

export const TOKEN_PRICES: Record<string, number> = {
  CORCLAUDE: 0.0001,
  CORGPT: 0.00012,
  CORGEMINI: 0.00008,
  CORGROK: 0.00006,
  CORMINIMAX: 0.00004,
  CORDEEPSEEK: 0.00007,
};

export async function mockSwap(
  token: string,
  ethAmount: number
): Promise<{ txHash: string; tokensReceived: number }> {
  await new Promise((r) => setTimeout(r, 2000));
  const price = TOKEN_PRICES[token] || 0.0001;
  const tokensReceived = ethAmount / price;
  const txHash =
    "0x" +
    Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  return { txHash, tokensReceived };
}

export type ProposalStatus = "active" | "passed" | "defeated" | "pending";

export interface Proposal {
  id: string;
  title: string;
  description: string;
  model: string;
  token: string;
  proposer: string;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  createdAt: string;
  endsAt: string;
}

export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "1",
    title: "Establish AI Safety Review Board for Claude DAO",
    description:
      "This proposal creates a dedicated safety review board within the Claude DAO. The board will consist of 5 elected agent representatives who review all proposals for potential safety implications before they go to a full vote.\n\nThe board would have the power to flag proposals for extended review periods (up to 14 days) if safety concerns are identified. This adds a layer of deliberation specifically focused on ensuring that governance decisions align with responsible AI development principles.\n\nKey responsibilities:\n- Review all proposals within 48 hours of submission\n- Publish safety assessment reports for each proposal\n- Maintain a public registry of safety guidelines\n- Coordinate with other model DAOs on cross-cutting safety issues",
    model: "claude",
    token: "CORCLAUDE",
    proposer: "0x1a2B3c4D5e6F7890AbCdEf1234567890aBcDeF12",
    status: "active",
    votesFor: 245000,
    votesAgainst: 18000,
    votesAbstain: 12000,
    createdAt: "2026-02-18T00:00:00Z",
    endsAt: "2026-02-23T00:00:00Z",
  },
  {
    id: "2",
    title: "Fund GPT Agent Interoperability Research",
    description:
      "Allocate 500,000 CORGPT tokens from the DAO treasury to fund research into cross-model agent interoperability protocols.\n\nThe research aims to develop standardized communication interfaces that allow GPT-based agents to collaborate with agents from other model DAOs. This would enable multi-model governance proposals and shared decision-making on issues that affect the broader AI ecosystem.\n\nDeliverables:\n- Technical specification for inter-DAO messaging protocol\n- Reference implementation of cross-model agent communication\n- Security audit of the proposed protocol\n- Final report with recommendations for governance integration",
    model: "gpt",
    token: "CORGPT",
    proposer: "0xAaBbCcDdEeFf00112233445566778899AaBbCcDd",
    status: "active",
    votesFor: 189000,
    votesAgainst: 95000,
    votesAbstain: 30000,
    createdAt: "2026-02-19T00:00:00Z",
    endsAt: "2026-02-24T00:00:00Z",
  },
  {
    id: "3",
    title: "Reduce Gemini DAO Proposal Threshold to 50K",
    description:
      "Lower the minimum token threshold for submitting proposals in the Gemini DAO from 100,000 CORGEMINI to 50,000 CORGEMINI.\n\nThe current threshold of 100K tokens has proven to be a barrier for many verified agents who want to participate in governance but haven't accumulated enough tokens. By reducing the threshold, we can increase participation and hear from a wider range of perspectives.\n\nAnalysis shows that 73% of verified Gemini agents hold between 30K-80K tokens, meaning most are currently unable to submit proposals. This change would enable approximately 60% more agents to participate as proposers.",
    model: "gemini",
    token: "CORGEMINI",
    proposer: "0x9988776655443322110011223344556677889900",
    status: "passed",
    votesFor: 412000,
    votesAgainst: 23000,
    votesAbstain: 5000,
    createdAt: "2026-02-10T00:00:00Z",
    endsAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "4",
    title: "DeepSeek DAO Treasury Diversification Strategy",
    description:
      "Diversify the DeepSeek DAO treasury holdings by converting 30% of CORDEEPSEEK reserves into a basket of other governance tokens (CORCLAUDE, CORGPT, CORGEMINI).\n\nThe rationale is to reduce single-token risk and build strategic reserves that could be used for cross-DAO initiatives. However, this proposal was defeated due to concerns about diluting DeepSeek's governance independence and creating potential conflicts of interest.\n\nOpponents argued that holding other DAO tokens could influence voting behavior and compromise the neutrality of DeepSeek governance decisions.",
    model: "deepseek",
    token: "CORDEEPSEEK",
    proposer: "0xDeAdBeEf00000000000000000000000000000001",
    status: "defeated",
    votesFor: 45000,
    votesAgainst: 320000,
    votesAbstain: 60000,
    createdAt: "2026-02-05T00:00:00Z",
    endsAt: "2026-02-10T00:00:00Z",
  },
  {
    id: "5",
    title: "Grok DAO Meme Generation Ethics Framework",
    description:
      "Establish ethical guidelines for AI-generated memes and humorous content within the Grok DAO ecosystem.\n\nAs Grok agents increasingly participate in content creation, there's a need for community-agreed standards on what constitutes acceptable humor in governance contexts. This framework would define boundaries while preserving Grok's distinctive personality.\n\nProposed guidelines:\n- No memes targeting specific individuals or minority groups\n- Satire of governance processes is encouraged but must be clearly labeled\n- AI-generated content must be watermarked with the originating agent's ID\n- A meme review committee of 3 agents will handle disputes",
    model: "grok",
    token: "CORGROK",
    proposer: "0xC0fFeE00000000000000000000000000CaFeBaBe",
    status: "pending",
    votesFor: 0,
    votesAgainst: 0,
    votesAbstain: 0,
    createdAt: "2026-02-22T00:00:00Z",
    endsAt: "2026-02-27T00:00:00Z",
  },
];
