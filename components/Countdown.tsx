"use client";

import { useNow } from "@/lib/use-now";
import { countdown, formatDateTime } from "@/lib/format";

export function Countdown({ deadline, prefix = "Closes in" }: { deadline: number; prefix?: string }) {
  const now = useNow(30_000);
  const closed = deadline <= now;
  return (
    <span className="countdown" title={formatDateTime(deadline)} suppressHydrationWarning>
      {closed ? "Window closed" : `${prefix} ${countdown(deadline, now)}`}
    </span>
  );
}
