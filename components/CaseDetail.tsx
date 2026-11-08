"use client";

import Link from "next/link";
import type { DisputeCase, Verdict } from "@/lib/types";
import { useCase } from "@/lib/queries";
import { useNow } from "@/lib/use-now";
import { CaseActions } from "@/components/CaseActions";
import { Countdown } from "@/components/Countdown";
import { JudgeBench } from "@/components/JudgeBench";
import { ShareButtons } from "@/components/ShareButtons";
import { ReportButton } from "@/components/ReportButton";
import { SplitBar, StatusChip } from "@/components/StatusChip";
import { CATEGORY_LABELS, ZERO_ADDRESS, type Category } from "@/lib/constants";
import { caseNumber, formatCredits, formatDateTime, shortAddress, timeAgo, winnerLabel } from "@/lib/format";
import { explorerAddress } from "@/lib/genlayer";

function winnerName(caseData: DisputeCase, verdict: Verdict): string {
  if (verdict.winner === "split") return "Split decision";
  if (verdict.winner === "plaintiff") return `${caseData.plaintiff_name} wins`;
  return `${caseData.defendant_name || "Defendant"} wins`;
}

function VerdictPanel({
  label,
  verdict,
  caseData,
  settled,
}: {
  label: string;
  verdict: Verdict;
  caseData: DisputeCase;
  settled: boolean;
}) {
  return (
    <div className="verdict-card">
      <span className="stamp">{label}</span>
      <h2>{winnerName(caseData, verdict)}</h2>
      <p>{verdict.reasoning}</p>

      {verdict.default && (
        <p className="verdict-note">
          Default judgment: the defendant did not answer before the deadline.
        </p>
      )}
      {verdict.fallback && (
        <p className="verdict-note">
          The bench could not produce a reliable split, so the case fell back to an even 50/50.
        </p>
      )}

      <SplitBar share={verdict.plaintiff_share} />

      <div className="payout">
        {settled ? (
          <>
            <span>
              {caseData.plaintiff_name}: {formatCredits(caseData.payout.plaintiff)} credits
            </span>
            <span>
              {caseData.defendant_name || "Defendant"}: {formatCredits(caseData.payout.defendant)} credits
            </span>
          </>
        ) : (
          <>
            <span>Pot: {formatCredits(caseData.pot)} credits</span>
            <span>Pays out when the ruling is final.</span>
          </>
        )}
      </div>

      <div className="score-grid">
        <div>
          <h4 className="p">{caseData.plaintiff_name}</h4>
          <div className="meter p">
            <span>Facts</span>
            <div>
              <i style={{ width: `${verdict.scores.plaintiff.facts}%` }} />
            </div>
            <span>{verdict.scores.plaintiff.facts}</span>
          </div>
          <div className="meter p">
            <span>Fairness</span>
            <div>
              <i style={{ width: `${verdict.scores.plaintiff.fairness}%` }} />
            </div>
            <span>{verdict.scores.plaintiff.fairness}</span>
          </div>
          <div className="meter p">
            <span>Effort</span>
            <div>
              <i style={{ width: `${verdict.scores.plaintiff.effort}%` }} />
            </div>
            <span>{verdict.scores.plaintiff.effort}</span>
          </div>
        </div>
        <div>
          <h4 className="d">{caseData.defendant_name || "Defendant"}</h4>
          <div className="meter d">
            <span>Facts</span>
            <div>
              <i style={{ width: `${verdict.scores.defendant.facts}%` }} />
            </div>
            <span>{verdict.scores.defendant.facts}</span>
          </div>
          <div className="meter d">
            <span>Fairness</span>
            <div>
              <i style={{ width: `${verdict.scores.defendant.fairness}%` }} />
            </div>
            <span>{verdict.scores.defendant.fairness}</span>
          </div>
          <div className="meter d">
            <span>Effort</span>
            <div>
              <i style={{ width: `${verdict.scores.defendant.effort}%` }} />
            </div>
            <span>{verdict.scores.defendant.effort}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CaseDetail({ initialCase }: { initialCase: DisputeCase }) {
  const { data, isError } = useCase(initialCase.id, initialCase);
  const now = useNow(15_000);
  const caseData = data ?? initialCase;
  const settled = caseData.status === "FINAL" || caseData.status === "EXPIRED";
  const finalVerdict = caseData.appeal_verdict ?? caseData.verdict;
  const benchState: "idle" | "deliberating" | "done" =
    caseData.status === "RULED" || settled ? "done" : caseData.status === "DEFENDED" ? "deliberating" : "idle";

  const statusNote = (() => {
    if (caseData.status === "OPEN") {
      return now > caseData.deadline
        ? "The defense window has closed. The plaintiff can claim by default."
        : "The case is open. The other side must answer before the deadline.";
    }
    if (caseData.status === "DEFENDED") {
      return "Both sides are on the record. A party can now call the bench.";
    }
    if (caseData.status === "RULED") {
      return now < caseData.appeal_deadline
        ? "The bench has ruled. The losing side may appeal while the window is open."
        : "The appeal window has closed. Anyone can finalize the ruling and release the pot.";
    }
    if (caseData.status === "EXPIRED") {
      return "Default judgment: the defendant never answered. The plaintiff took the pot.";
    }
    return "This ruling is final and the pot has been paid out.";
  })();

  return (
    <div className="wrap">
      <div className="case-page">
        <div className="case-top">
          <div>
            <span className="eyebrow">
              {CATEGORY_LABELS[caseData.category as Category] ?? caseData.category} ·{" "}
              {caseNumber(caseData.id)}
            </span>
            <h1>{caseData.title}</h1>
            <div className="case-meta">
              <span>Filed {timeAgo(caseData.created_at)}</span>
              <span>Stake {formatCredits(caseData.stake)} credits</span>
              <span>Pot {formatCredits(caseData.pot)} credits</span>
              {caseData.status === "OPEN" && <Countdown deadline={caseData.deadline} prefix="Answer window" />}
              {caseData.status === "RULED" && (
                <Countdown deadline={caseData.appeal_deadline} prefix="Appeal window" />
              )}
            </div>
          </div>
          <StatusChip status={caseData.status} />
        </div>

        {isError && (
          <p className="form-error" role="status">
            Unable to refresh from StudioNet. Showing the last known state.
          </p>
        )}

        <div className="case-layout">
          <div className="case-main">
            <div className="panel-card">
              <h2>Where this stands</h2>
              <p>{statusNote}</p>
            </div>

            <div className="statements">
              <div className="statement-card a">
                <div className="tag">
                  Plaintiff <span>{shortAddress(caseData.plaintiff)}</span>
                </div>
                <h3>{caseData.plaintiff_name}</h3>
                <p>{caseData.plaintiff_statement}</p>
              </div>
              <div className={`statement-card b ${caseData.defendant_statement ? "" : "empty"}`}>
                <div className="tag">
                  Defendant{" "}
                  <span>
                    {caseData.defendant === ZERO_ADDRESS ? "Open seat" : shortAddress(caseData.defendant)}
                  </span>
                </div>
                <h3>{caseData.defendant_name || "Awaiting an answer"}</h3>
                {caseData.defendant_statement ? (
                  <p>{caseData.defendant_statement}</p>
                ) : (
                  <p>
                    The defendant has not answered yet. The seat is open until the deadline; the first
                    non-plaintiff to take it files their side.
                  </p>
                )}
              </div>
            </div>

            {finalVerdict && (
              <VerdictPanel
                label={caseData.appeal_verdict ? "Appeal ruling" : caseData.status === "RULED" ? "Ruled" : "Final"}
                verdict={finalVerdict}
                caseData={caseData}
                settled={settled}
              />
            )}

            {caseData.appeal_verdict && caseData.verdict && (
              <div className="panel-card">
                <h2>Original ruling</h2>
                <p>
                  {winnerLabel(caseData.verdict.winner)} · Plaintiff{" "}
                  {caseData.verdict.plaintiff_share}% / Defendant {100 - caseData.verdict.plaintiff_share}%
                </p>
                <p>{caseData.verdict.reasoning}</p>
              </div>
            )}

            <JudgeBench state={benchState} />

            <div className="panel-card">
              <h2>Case record</h2>
              {caseData.logs && caseData.logs.length > 0 ? (
                <ol className="timeline">
                  {caseData.logs.map((entry, index) => (
                    <li className="done" key={`${entry.ts}-${index}`}>
                      <span className="dot" />
                      <div>
                        <b>{entry.status.charAt(0) + entry.status.slice(1).toLowerCase()}</b>
                        <small>
                          {formatDateTime(entry.ts)} · {shortAddress(entry.by)}
                        </small>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No events recorded yet.</p>
              )}
            </div>
          </div>

          <aside className="case-side">
            <div className="panel-card">
              <h2>The pot</h2>
              <div className="balance-line">
                <b>{formatCredits(caseData.pot)}</b>
                <span>credits at stake</span>
              </div>
              <p className="helper">Each side put up {formatCredits(caseData.stake)} credits. Testnet only.</p>
              <CaseActions caseData={caseData} now={now} />
              {caseData.status === "OPEN" && (
                <p className="helper">
                  Send this link to the other side. The first non-plaintiff wallet to answer claims the
                  open seat.
                </p>
              )}
            </div>

            <div className="panel-card">
              <h2>The parties</h2>
              <p>
                <a href={explorerAddress(caseData.plaintiff)} target="_blank" rel="noopener noreferrer">
                  {caseData.plaintiff_name} · {shortAddress(caseData.plaintiff)}
                </a>
              </p>
              <p>
                {caseData.defendant === ZERO_ADDRESS ? (
                  "Defendant seat open"
                ) : (
                  <a href={explorerAddress(caseData.defendant)} target="_blank" rel="noopener noreferrer">
                    {(caseData.defendant_name || "Defendant") + " · " + shortAddress(caseData.defendant)}
                  </a>
                )}
              </p>
            </div>

            <div className="panel-card">
              <h2>Pass it on</h2>
              <ShareButtons caseId={caseData.id} title={caseData.title} />
              <Link className="btn ghost small" href="/file">
                File your own case
              </Link>
              <ReportButton caseId={caseData.id} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
