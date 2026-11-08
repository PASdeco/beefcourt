import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case not found",
  description: "This page is not on the docket.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="error-page">
        <span className="error-code">404</span>
        <h1>Not on the docket</h1>
        <p>
          This page does not exist, or the case number was mistyped. The record only contains what was
          actually filed.
        </p>
        <div className="cta" style={{ justifyContent: "center" }}>
          <Link className="btn brass" href="/">
            Back to the court
          </Link>
          <Link className="btn ghost" href="/verdicts">
            Browse the docket
          </Link>
        </div>
      </div>
    </div>
  );
}
