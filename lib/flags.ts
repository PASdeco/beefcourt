"use client";

const PREFIX = "bc-flagged-v1";

function readSet(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(PREFIX);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => typeof n === "number"));
  } catch {
    return new Set();
  }
}

function writeSet(ids: Set<number>) {
  try {
    window.localStorage.setItem(PREFIX, JSON.stringify([...ids]));
    window.dispatchEvent(new Event("bc-flags-changed"));
  } catch {
    // Storage can be unavailable; the UI still hides the case for this session.
  }
}

export function isFlagged(id: number): boolean {
  return readSet().has(id);
}

export function flagCase(id: number) {
  const ids = readSet();
  ids.add(id);
  writeSet(ids);
}

export function unflagCase(id: number) {
  const ids = readSet();
  ids.delete(id);
  writeSet(ids);
}
