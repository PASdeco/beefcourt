export const CATEGORIES = ["roommates", "friends", "couple", "group", "other"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  roommates: "Roommates",
  friends: "Friends",
  couple: "Couple",
  group: "Group chat",
  other: "Other",
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  roommates: "House",
  friends: "Crew",
  couple: "Two",
  group: "Group",
  other: "Case",
};

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
export const STUDIONET_CHAIN_ID = 61999;
export const STUDIONET_CHAIN_ID_HEX = "0xF22F";
export const STUDIONET_RPC =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
export const STUDIONET_EXPLORER =
  process.env.NEXT_PUBLIC_GENLAYER_EXPLORER || "https://explorer-studio.genlayer.com";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000");

export const STARTER_CREDITS = 500;
export const MIN_STAKE = 10;
export const MAX_STAKE = 200;
export const MAX_OPEN_CASES = 3;
export const DEFENSE_WINDOW_SECONDS = 3 * 24 * 3600;
export const APPEAL_WINDOW_SECONDS = 24 * 3600;

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "") as `0x${string}` | "";
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
