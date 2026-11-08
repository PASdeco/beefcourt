export type Winner = "plaintiff" | "defendant" | "split";
export type CaseStatus = "OPEN" | "DEFENDED" | "RULED" | "FINAL" | "EXPIRED";

export interface Scores {
  facts: number;
  fairness: number;
  effort: number;
}

export interface Verdict {
  winner: Winner;
  plaintiff_share: number;
  reasoning: string;
  scores: {
    plaintiff: Scores;
    defendant: Scores;
  };
  fallback?: boolean;
  default?: boolean;
}

export interface Payout {
  plaintiff: number;
  defendant: number;
}

export interface CaseLog {
  status: string;
  ts: number;
  by: string;
}

export interface DisputeCase {
  id: number;
  title: string;
  category: string;
  plaintiff: string;
  defendant: string;
  plaintiff_name: string;
  defendant_name: string;
  plaintiff_statement: string;
  defendant_statement: string;
  stake: number;
  pot: number;
  status: CaseStatus;
  created_at: number;
  deadline: number;
  defended_at: number;
  verdict: Verdict | null;
  appeal_verdict: Verdict | null;
  appealed: boolean;
  ruled_at: number;
  appeal_deadline: number;
  settled_at: number;
  payout: Payout;
  logs?: CaseLog[];
}

export interface CaseList {
  cases: DisputeCase[];
  total: number;
}

export interface CourtStats {
  cases: number;
  ruled: number;
  staked: number;
  paid: number;
  open_cases: number;
  participants: number;
}

export interface UserStats {
  address: string;
  balance: number;
  claimed: boolean;
  wins: number;
  losses: number;
  splits: number;
  cases: number;
  earnings: number;
  open_cases: number;
}

export interface LeaderboardRow {
  address: string;
  balance: number;
  wins: number;
  losses: number;
  splits: number;
  cases: number;
  earnings: number;
}

export interface Leaderboard {
  leaders: LeaderboardRow[];
}

export interface OverruledBoard {
  overruled: LeaderboardRow[];
}

export interface BalanceResult {
  address: string;
  balance: number;
  claimed: boolean;
}

export type TxStage =
  | "signing"
  | "submitted"
  | "pending"
  | "proposing"
  | "committing"
  | "revealing"
  | "verifying"
  | "accepted"
  | "finalized"
  | "error";
