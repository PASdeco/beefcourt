"use client";

import Link from "next/link";
import { useCases } from "@/lib/queries";
import { Skeleton } from "@/components/EmptyState";
import { SplitBar } from "@/components/StatusChip";
import { caseNumber, formatCredits, timeAgo, winnerLabel } from "@/lib/format";

export function RecentVerdicts() {
  const { data, isLoading, isError } = useCases(20);

  if (isLoading) {
    return (
      <div className="case-grid">
        <Skeleton lines={4} />
        <Skeleton lines={4} />
        <Skeleton lines={4} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="empty-state">
        <span className="empty-seal" aria-hidden="true">
          !
        </span>
        <h3>The court is being rebuilt</h3>
        <p>StudioNet reads are unavailable right now. Try again in a moment.</p>
      </div>
    );
  }

  const ruled = (data?.cases ?? [])
    .filter((item) => item.verdict && ["RULED", "FINAL", "EXPIRED"].includes(item.status))
    .slice(0, 4);

  if (!ruled.length) {
    return (
      <div className="empty-state">
        <span className="empty-seal" aria-hidden="true">
          §
        </span>
        <h3>No verdicts yet</h3>
        <p>Cases are on the docket, but the bench has not ruled yet. Answer an open case or file your own.</p>
        <Link className="btn brass" href="/verdicts">
          See the live docket
        </Link>
      </div>
    );
  }

  return (
    <div className="case-grid">
      {ruled.map((item) => {
        const verdict = item.appeal_verdict ?? item.verdict;
        if (!verdict) return null;
        return (
          <Link className="case-card" href={`/case/${item.id}`} key={item.id}>
            <div className="case-card-top">
              <span className="case-id">{caseNumber(item.id)}</span>
              <span className="status-chip final">{item.status === "EXPIRED" ? "Default" : "Ruled"}</span>
            </div>
            <h3>{item.title}</h3>
            <p className="case-card-meta">
              {formatCredits(item.stake)} credits · {timeAgo(item.settled_at || item.ruled_at || item.created_at)}
            </p>
            <div className="case-card-verdict">
              <span>{winnerLabel(verdict.winner)}</span>
              <SplitBar share={verdict.plaintiff_share} label={false} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
