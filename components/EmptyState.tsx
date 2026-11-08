import Link from "next/link";

export function EmptyState({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-seal" aria-hidden="true">
        ∅
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      {href && cta && (
        <Link className="btn brass" href={href}>
          {cta}
        </Link>
      )}
    </div>
  );
}

export function Skeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={`skeleton ${className ?? ""}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <span key={index} style={{ width: `${100 - index * 12}%` }} />
      ))}
    </div>
  );
}
