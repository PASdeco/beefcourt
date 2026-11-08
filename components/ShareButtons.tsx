"use client";

import { useState } from "react";

export function ShareButtons({ caseId, title }: { caseId: number; title: string }) {
  const [copied, setCopied] = useState(false);

  const url = () => `${window.location.origin}/case/${caseId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this case link", url());
    }
  };

  const share = () => {
    const text = encodeURIComponent(`${title} — settled on Beef Court.`);
    const href = encodeURIComponent(url());
    window.open(`https://x.com/intent/tweet?text=${text}&url=${href}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="share-row">
      <button className="btn ghost small" onClick={copy} type="button">
        {copied ? "Case link copied" : "Copy case link"}
      </button>
      <button className="btn ghost small" onClick={share} type="button">
        Share on X
      </button>
    </div>
  );
}
