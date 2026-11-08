import { readContract, submitWrite } from "./genlayer";
import { ZERO_ADDRESS } from "./constants";
import type {
  BalanceResult,
  CaseList,
  CourtStats,
  DisputeCase,
  Leaderboard,
  OverruledBoard,
  TxStage,
  UserStats,
} from "./types";

export async function getStats(): Promise<CourtStats> {
  return readContract<CourtStats>("get_stats");
}

export async function getCase(id: number): Promise<DisputeCase> {
  return readContract<DisputeCase>("get_case", [id]);
}

export async function getCases(offset = 0, limit = 20): Promise<CaseList> {
  return readContract<CaseList>("get_cases", [offset, limit]);
}

export async function getCasesFor(address: string): Promise<CaseList> {
  return readContract<CaseList>("get_cases_for", [address]);
}

export async function getUserStats(address: string): Promise<UserStats> {
  return readContract<UserStats>("get_user_stats", [address]);
}

export async function getBalance(address: string): Promise<BalanceResult> {
  return readContract<BalanceResult>("get_balance", [address]);
}

export async function getLeaderboard(limit = 50): Promise<Leaderboard> {
  return readContract<Leaderboard>("get_leaderboard", [limit]);
}

export async function getMostOverruled(limit = 50): Promise<OverruledBoard> {
  return readContract<OverruledBoard>("get_most_overruled", [limit]);
}

type Writer = (
  provider: EthereumProvider,
  from: string,
  functionName: string,
  args: unknown[],
  onStage?: (stage: TxStage, detail?: string) => void,
) => Promise<{ hash: string; execution: string }>;

const write: Writer = (provider, from, functionName, args, onStage) =>
  submitWrite(provider, from, functionName, args, onStage);

export function claimStarterCredits(
  provider: EthereumProvider,
  from: string,
  onStage?: (stage: TxStage, detail?: string) => void,
) {
  return write(provider, from, "claim_starter_credits", [], onStage);
}

export function createCase(
  provider: EthereumProvider,
  from: string,
  input: {
    title: string;
    category: string;
    plaintiffName: string;
    statement: string;
    defendantAddress: string;
    stake: number;
  },
  onStage?: (stage: TxStage, detail?: string) => void,
) {
  return write(
    provider,
    from,
    "create_case",
    [
      input.title,
      input.category,
      input.plaintiffName,
      input.statement,
      input.defendantAddress,
      input.stake,
    ],
    onStage,
  );
}

export function submitDefense(
  provider: EthereumProvider,
  from: string,
  caseId: number,
  defendantName: string,
  statement: string,
  onStage?: (stage: TxStage, detail?: string) => void,
) {
  return write(provider, from, "submit_defense", [caseId, defendantName, statement], onStage);
}

export function requestRuling(
  provider: EthereumProvider,
  from: string,
  caseId: number,
  onStage?: (stage: TxStage, detail?: string) => void,
) {
  return write(provider, from, "request_ruling", [caseId], onStage);
}

export function appealCase(
  provider: EthereumProvider,
  from: string,
  caseId: number,
  onStage?: (stage: TxStage, detail?: string) => void,
) {
  return write(provider, from, "appeal", [caseId], onStage);
}

export function finalizeCase(
  provider: EthereumProvider,
  from: string,
  caseId: number,
  onStage?: (stage: TxStage, detail?: string) => void,
) {
  return write(provider, from, "finalize", [caseId], onStage);
}

export function claimDefault(
  provider: EthereumProvider,
  from: string,
  caseId: number,
  onStage?: (stage: TxStage, detail?: string) => void,
) {
  return write(provider, from, "claim_default", [caseId], onStage);
}

export function inviteAddress(): string {
  return ZERO_ADDRESS;
}
