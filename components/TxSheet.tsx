"use client";

import { useEffect, useRef } from "react";
import { explorerTx } from "@/lib/genlayer";
import type { TxStage } from "@/lib/types";

const STAGES: { key: TxStage; label: string; hint: string }[] = [
  { key: "signing", label: "Waiting for your signature", hint: "Approve the transaction in your wallet." },
  { key: "submitted", label: "Sent to StudioNet", hint: "Your transaction is in the queue." },
  { key: "pending", label: "Pending", hint: "Validators are picking up the case." },
  { key: "proposing", label: "Proposing", hint: "A leader is running the court logic." },
  { key: "committing", label: "Committing", hint: "Validators are committing their votes." },
  { key: "revealing", label: "Revealing", hint: "Votes are being revealed and compared." },
  { key: "verifying", label: "Verifying result", hint: "Consensus accepted; checking the contract result." },
  { key: "accepted", label: "Accepted", hint: "The result is accepted by consensus." },
];

function stageIndex(stage: TxStage): number {
  const index = STAGES.findIndex((s) => s.key === stage);
  return index < 0 ? 0 : index;
}

interface TxSheetProps {
  open: boolean;
  title: string;
  stage: TxStage;
  hash?: string | null;
  error?: string | null;
  onClose: () => void;
  children?: React.ReactNode;
}

export function TxSheet({ open, title, stage, hash, error, onClose, children }: TxSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;
  const current = stageIndex(stage);
  const failed = stage === "error" || Boolean(error);
  const done = stage === "accepted" || stage === "finalized";

  return (
    <div className="modal on" role="presentation" onClick={onClose}>
      <div
        className="sheet tx-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tx-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="tx-head">
          <span className={`tx-orb ${failed ? "bad" : done ? "good" : "busy"}`} aria-hidden="true" />
          <div>
            <h3 id="tx-title">{title}</h3>
            <p>{failed ? "The court could not complete this step." : done ? "Recorded on StudioNet." : "Working through consensus…"}</p>
          </div>
          <button ref={closeRef} className="icon close-btn" onClick={onClose} aria-label="Close transaction panel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <ol className="tx-steps" aria-live="polite">
          {STAGES.map((item, index) => {
            const isDone = index < current || done;
            const isCurrent = index === current && !done && !failed;
            return (
              <li key={item.key} className={isDone ? "done" : isCurrent ? "current" : ""}>
                <span className="tx-marker" aria-hidden="true">
                  {isDone ? "✓" : isCurrent ? <i className="spinner" /> : index + 1}
                </span>
                <span>
                  <b>{item.label}</b>
                  <small>{item.hint}</small>
                </span>
              </li>
            );
          })}
        </ol>

        {children}

        {hash && (
          <a className="tx-link" href={explorerTx(hash)} target="_blank" rel="noopener noreferrer">
            View transaction on the explorer ↗
          </a>
        )}
        <p className="tx-note">
          {done || failed
            ? "You can close this panel."
            : "You can close this panel — the transaction keeps going on-chain."}
        </p>
      </div>
    </div>
  );
}

