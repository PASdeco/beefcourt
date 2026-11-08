"use client";

import { Skeleton } from "@/components/EmptyState";
import { useLeaderboard, useMostOverruled } from "@/lib/queries";
import { STUDIONET_EXPLORER } from "@/lib/constants";
import { formatCredits, shortAddress } from "@/lib/format";
import type { LeaderboardRow } from "@/lib/types";

function Board({
  title,
  subtitle,
  rows,
  mode,
}: {
  title: string;
  subtitle: string;
  rows: LeaderboardRow[] | undefined;
  mode: "earnings" | "losses";
}) {
  return (
    <div className="board">
      <div className="board-head">
        <div>
          <h2>{title}</h2>
          <span className="case-card-meta">{subtitle}</span>
        </div>
      </div>
      {rows && rows.length > 0 ? (
        rows.map((row, index) => (
          <div className="board-row" key={row.address}>
            <span className="rank">{index + 1}</span>
            <div className="who">
              <b>
                <a
                  href={`${STUDIONET_EXPLORER}/address/${row.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {shortAddress(row.address)}
                </a>
              </b>
              <small>
                {row.wins}W · {row.losses}L · {row.splits}S
              </small>
            </div>
            <div className="num">
              {mode === "earnings"
                ? `${row.earnings > 0 ? "+" : ""}${formatCredits(row.earnings)}`
                : `${row.losses} losses`}
              <small>{formatCredits(row.balance)} credits</small>
            </div>
          </div>
        ))
      ) : (
        <div className="board-row">
          <span className="rank">—</span>
          <div className="who">
            <b>No one here yet</b>
            <small>The record starts with the first case.</small>
          </div>
        </div>
      )}
    </div>
  );
}

export function LeaderboardTables() {
  const leaders = useLeaderboard();
  const overruled = useMostOverruled();

  if (leaders.isLoading || overruled.isLoading) {
    return (
      <div className="leader-grid">
        <Skeleton lines={6} />
        <Skeleton lines={6} />
      </div>
    );
  }

  if (leaders.isError || overruled.isError) {
    return (
      <div className="empty-state">
        <span className="empty-seal" aria-hidden="true">
          !
        </span>
        <h3>The record is unavailable</h3>
        <p>StudioNet did not answer. Try again in a moment.</p>
      </div>
    );
  }

  return (
    <div className="leader-grid">
      <Board
        title="The earners"
        subtitle="Ranked by net credits won. Testnet only."
        rows={leaders.data?.leaders}
        mode="earnings"
      />
      <Board
        title="Most overruled"
        subtitle="Ranked by losses. Somebody has to hold this title."
        rows={overruled.data?.overruled}
        mode="losses"
      />
    </div>
  );
}
