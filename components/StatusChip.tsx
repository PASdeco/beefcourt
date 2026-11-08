import clsx from "clsx";
import { statusLabel } from "@/lib/format";

export function StatusChip({ status, className }: { status: string; className?: string }) {
  return (
    <span className={clsx("status-chip", status.toLowerCase(), className)}>
      {statusLabel(status)}
    </span>
  );
}

export function SplitBar({
  share,
  className,
  label = true,
}: {
  share: number;
  className?: string;
  label?: boolean;
}) {
  const plaintiff = Math.max(0, Math.min(100, share));
  const defendant = 100 - plaintiff;
  return (
    <div className={clsx("split", className)}>
      <div className="split-bar" aria-hidden="true">
        <i style={{ width: `${plaintiff}%` }} />
        <i style={{ width: `${defendant}%` }} />
      </div>
      {label && (
        <div className="split-labels">
          <span>Plaintiff {plaintiff}%</span>
          <span>Defendant {defendant}%</span>
        </div>
      )}
      <span className="sr-only">
        Plaintiff {plaintiff} percent, defendant {defendant} percent.
      </span>
    </div>
  );
}
