"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap">
      <div className="error-page">
        <span className="error-code">!</span>
        <h1>The court hit a snag</h1>
        <p>
          This page could not render. Nothing was filed and no credits moved. Try the page again, or
          head back to the docket.
        </p>
        <div className="cta" style={{ justifyContent: "center" }}>
          <button className="btn brass" type="button" onClick={() => reset()}>
            Try again
          </button>
          <Link className="btn ghost" href="/">
            Back to the court
          </Link>
        </div>
      </div>
    </div>
  );
}
