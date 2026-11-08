"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCase,
  getCases,
  getCasesFor,
  getLeaderboard,
  getMostOverruled,
  getStats,
  getUserStats,
} from "./contract";
import type { CaseList, CourtStats, DisputeCase, Leaderboard, OverruledBoard, UserStats } from "./types";

export const queryKeys = {
  stats: ["court", "stats"] as const,
  case: (id: number) => ["court", "case", id] as const,
  cases: (limit: number) => ["court", "cases", limit] as const,
  userCases: (address: string) => ["court", "user-cases", address.toLowerCase()] as const,
  userStats: (address: string) => ["court", "user-stats", address.toLowerCase()] as const,
  leaderboard: ["court", "leaderboard"] as const,
  overruled: ["court", "overruled"] as const,
};

export function useCourtStats() {
  return useQuery<CourtStats>({
    queryKey: queryKeys.stats,
    queryFn: () => getStats(),
    staleTime: 20_000,
    refetchInterval: 60_000,
  });
}

export function useCase(id: number, initialData?: DisputeCase) {
  return useQuery<DisputeCase>({
    queryKey: queryKeys.case(id),
    queryFn: () => getCase(id),
    enabled: Number.isFinite(id) && id > 0,
    initialData,
    staleTime: 5_000,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "OPEN" || status === "DEFENDED" || status === "RULED") return 6_000;
      return false;
    },
  });
}

export function useCases(limit = 20) {
  return useQuery<CaseList>({
    queryKey: queryKeys.cases(limit),
    queryFn: () => getCases(0, limit),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useCasesFor(address?: string | null) {
  return useQuery<CaseList>({
    queryKey: queryKeys.userCases(address || "none"),
    queryFn: () => getCasesFor(address as string),
    enabled: Boolean(address),
    staleTime: 10_000,
    refetchInterval: 20_000,
  });
}

export function useUserStats(address?: string | null) {
  return useQuery<UserStats>({
    queryKey: queryKeys.userStats(address || "none"),
    queryFn: () => getUserStats(address as string),
    enabled: Boolean(address),
    staleTime: 10_000,
    refetchInterval: 20_000,
  });
}

export function useLeaderboard() {
  return useQuery<Leaderboard>({
    queryKey: queryKeys.leaderboard,
    queryFn: () => getLeaderboard(50),
    staleTime: 30_000,
  });
}

export function useMostOverruled() {
  return useQuery<OverruledBoard>({
    queryKey: queryKeys.overruled,
    queryFn: () => getMostOverruled(50),
    staleTime: 30_000,
  });
}
