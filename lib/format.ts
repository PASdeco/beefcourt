export function shortAddress(address?: string | null): string {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function sameAddress(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

export function formatCredits(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function creditsLabel(value: number): string {
  return `${formatCredits(value)} GEN credits`;
}

export function formatDate(ts: number): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(ts: number): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeAgo(ts: number): string {
  if (!ts) return "—";
  const diff = Math.max(1, Math.floor(Date.now() / 1000 - ts));
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(ts);
}

export function countdown(ts: number, now = Math.floor(Date.now() / 1000)): string {
  const diff = ts - now;
  if (diff <= 0) return "closed";
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function caseNumber(id: number): string {
  return `Case No. ${String(id).padStart(4, "0")}`;
}

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function winnerLabel(winner?: string | null): string {
  if (winner === "plaintiff") return "Plaintiff wins";
  if (winner === "defendant") return "Defendant wins";
  if (winner === "split") return "Split decision";
  return "Awaiting ruling";
}

export function statusLabel(status: string): string {
  if (status === "OPEN") return "Open for answer";
  if (status === "DEFENDED") return "Ready for the bench";
  if (status === "RULED") return "Ruled, appeal window";
  if (status === "FINAL") return "Final";
  if (status === "EXPIRED") return "Expired, default";
  return status;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}
