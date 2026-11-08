"use client";

import { useState } from "react";
import { flagCase, isFlagged, unflagCase } from "@/lib/flags";

export function ReportButton({ caseId, onFlagged }: { caseId: number; onFlagged?: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [flagged, setFlagged] = useState(() => (typeof window === "undefined" ? false : isFlagged(caseId)));

  if (flagged) {
    return (
      <div className="report-note">
        You reported this case. It is hidden from your lists.
        <button
          className="link-btn"
          onClick={() => {
            unflagCase(caseId);
            setFlagged(false);
            onFlagged?.();
          }}
        >
          Unhide
        </button>
      </div>
    );
  }

  if (!confirming) {
    return (
      <button className="link-btn report-trigger" onClick={() => setConfirming(true)} type="button">
        Report this case
      </button>
    );
  }

  return (
    <div className="report-confirm">
      <p>Hide this case from your view? Reports are stored only in this browser for now.</p>
      <div>
        <button
          className="btn ghost small"
          onClick={() => {
            flagCase(caseId);
            setFlagged(true);
            setConfirming(false);
            onFlagged?.();
          }}
          type="button"
        >
          Report and hide
        </button>
        <button className="link-btn" onClick={() => setConfirming(false)} type="button">
          Cancel
        </button>
      </div>
    </div>
  );
}
