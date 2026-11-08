import Link from "next/link";
import { StatusChip, SplitBar } from "@/components/StatusChip";
import { caseNumber, formatCredits, timeAgo, titleCase, winnerLabel } from "@/lib/format";
import type { DisputeCase } from "@/lib/types";

export function CaseCard({ item }: { item: DisputeCase }) {
  const verdict = item.appeal_verdict ?? item.verdict;
  return (
    <Link href={`/case/${item.id}`} className="case-card">
      <div className="case-card-top">
        <span className="case-id">{caseNumber(item.id)}</span>
        <StatusChip status={item.status} />
      </div>
      <h3>{item.title}</h3>
      <p className="case-card-meta">
        {titleCase(item.category)} · {formatCredits(item.stake)} credits · {timeAgo(item.created_at)}
      </p>
      {verdict ? (
        <div className="case-card-verdict">
          <span>{winnerLabel(verdict.winner)}</span>
          <SplitBar share={verdict.plaintiff_share} label={false} />
        </div>
      ) : (
        <p className="case-card-wait">
          {item.status === "OPEN" ? "Waiting for the other side to answer." : "Waiting for the bench."}
        </p>
      )}
    </Link>
  );
}
