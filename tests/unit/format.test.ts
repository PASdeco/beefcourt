import { describe, expect, it } from "vitest";
import {
  caseNumber,
  countdown,
  formatCredits,
  sameAddress,
  shortAddress,
  statusLabel,
  truncate,
  winnerLabel,
} from "@/lib/format";

describe("formatCredits", () => {
  it("groups thousands", () => {
    expect(formatCredits(500)).toBe("500");
    expect(formatCredits(12500)).toBe("12,500");
  });
});

describe("countdown", () => {
  const now = 1_700_000_000;
  it("reports days and hours", () => {
    expect(countdown(now + 2 * 86400 + 3 * 3600, now)).toBe("2d 3h");
  });
  it("reports hours and minutes", () => {
    expect(countdown(now + 3 * 3600 + 14 * 60, now)).toBe("3h 14m");
  });
  it("reports minutes", () => {
    expect(countdown(now + 9 * 60, now)).toBe("9m");
  });
  it("closes at the deadline", () => {
    expect(countdown(now, now)).toBe("closed");
    expect(countdown(now - 1, now)).toBe("closed");
  });
});

describe("labels", () => {
  it("formats case numbers", () => {
    expect(caseNumber(7)).toBe("Case No. 0007");
    expect(caseNumber(1234)).toBe("Case No. 1234");
  });
  it("labels winners", () => {
    expect(winnerLabel("plaintiff")).toBe("Plaintiff wins");
    expect(winnerLabel("defendant")).toBe("Defendant wins");
    expect(winnerLabel("split")).toBe("Split decision");
    expect(winnerLabel(null)).toBe("Awaiting ruling");
  });
  it("labels statuses", () => {
    expect(statusLabel("OPEN")).toBe("Open for answer");
    expect(statusLabel("RULED")).toBe("Ruled, appeal window");
    expect(statusLabel("EXPIRED")).toBe("Expired, default");
  });
});

describe("addresses", () => {
  it("shortens an address", () => {
    expect(shortAddress("0xD0b8aEEdf195499773415323cae517e5b8369F94")).toBe("0xD0b8…9F94");
  });
  it("compares addresses case-insensitively", () => {
    expect(sameAddress("0xABC", "0xabc")).toBe(true);
    expect(sameAddress("0xABC", "0xdef")).toBe(false);
    expect(sameAddress(null, "0xabc")).toBe(false);
  });
});

describe("truncate", () => {
  it("keeps short text unchanged", () => {
    expect(truncate("short", 10)).toBe("short");
  });
  it("adds an ellipsis when trimming", () => {
    expect(truncate("abcdefghij", 5)).toBe("abcd…");
  });
});
