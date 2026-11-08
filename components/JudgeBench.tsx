import clsx from "clsx";

const JUDGES = [
  { initial: "A", name: "Judge Ada", focus: "Reads for facts and dates" },
  { initial: "K", name: "Judge Kofi", focus: "Weighs fairness to both sides" },
  { initial: "M", name: "Judge Mei", focus: "Rewards effort and follow-through" },
  { initial: "R", name: "Judge Ravi", focus: "Spots exaggeration" },
  { initial: "S", name: "Judge Sol", focus: "Favours the peacemaker" },
];

export function JudgeBench({
  state = "idle",
  compact = false,
}: {
  state?: "idle" | "deliberating" | "done";
  compact?: boolean;
}) {
  return (
    <div className={clsx("judge-bench", compact && "compact", state)}>
      <div className="bench-head">
        <h3>
          {state === "idle" && "The bench is waiting"}
          {state === "deliberating" && "The bench is deliberating…"}
          {state === "done" && "The bench has ruled"}
        </h3>
        <span>5 independent validators · 11 on appeal</span>
      </div>
      <div className="judge-row">
        {JUDGES.map((judge, index) => (
          <div className="judge" key={judge.initial} title={`${judge.name} — ${judge.focus}`}>
            <span className={clsx("judge-seat", state === "deliberating" && `pulse-${index % 3}`)}>
              {judge.initial}
            </span>
            {!compact && <b>{judge.name}</b>}
          </div>
        ))}
      </div>
      {!compact && (
        <p className="bench-note">
          Each validator runs its own AI model and checks the ruling against the other validators. The UI
          only shows the final consensus — not invented vote counts.
        </p>
      )}
    </div>
  );
}
