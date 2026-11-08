"use client";

import { useEffect, useMemo, useState } from "react";
import { CaseCard } from "@/components/CaseCard";
import { EmptyState, Skeleton } from "@/components/EmptyState";
import { useCases } from "@/lib/queries";
import { isFlagged } from "@/lib/flags";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/constants";

const TABS = [
  { key: "all", label: "All cases" },
  { key: "live", label: "Live" },
  { key: "ruled", label: "With rulings" },
  { key: "final", label: "Settled" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export function VerdictsBrowser() {
  const { data, isLoading, isError, refetch } = useCases(50);
  const [tab, setTab] = useState<Tab>("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");
  const [flagged, setFlagged] = useState<Set<number>>(new Set());

  useEffect(() => {
    const sync = () => {
      const next = new Set<number>();
      for (const item of data?.cases ?? []) {
        if (isFlagged(item.id)) next.add(item.id);
      }
      setFlagged(next);
    };
    sync();
    window.addEventListener("bc-flags-changed", sync);
    return () => window.removeEventListener("bc-flags-changed", sync);
  }, [data]);

  const cases = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data?.cases ?? []).filter((item) => {
      if (flagged.has(item.id)) return false;
      if (category !== "all" && item.category !== category) return false;
      if (tab === "live" && !["OPEN", "DEFENDED"].includes(item.status)) return false;
      if (tab === "ruled" && !["RULED", "FINAL", "EXPIRED"].includes(item.status)) return false;
      if (tab === "final" && !["FINAL", "EXPIRED"].includes(item.status)) return false;
      if (!needle) return true;
      return (
        item.title.toLowerCase().includes(needle) ||
        item.plaintiff_name.toLowerCase().includes(needle) ||
        item.defendant_name.toLowerCase().includes(needle) ||
        String(item.id) === needle
      );
    });
  }, [data, tab, category, query, flagged]);

  return (
    <>
      <div className="docket-tools">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, name, or case number"
          aria-label="Search cases"
        />
        <div className="toggle-row">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={tab === item.key ? "on" : ""}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="cat-chips">
          <button
            type="button"
            className={`chip ${category === "all" ? "on" : ""}`}
            onClick={() => setCategory("all")}
          >
            Every category
          </button>
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className={`chip ${category === item ? "on" : ""}`}
              onClick={() => setCategory(item)}
            >
              {CATEGORY_LABELS[item]}
            </button>
          ))}
        </div>
      </div>

      <div className="docket-count" aria-live="polite">
        {isLoading ? "Opening the docket…" : `${cases.length} case${cases.length === 1 ? "" : "s"} shown`}
      </div>

      {isLoading && (
        <div className="case-grid">
          <Skeleton lines={4} />
          <Skeleton lines={4} />
          <Skeleton lines={4} />
        </div>
      )}

      {isError && (
        <EmptyState
          title="The docket is unavailable"
          body="StudioNet did not answer. The court is still on-chain — try refreshing in a moment."
          href="/verdicts"
          cta="Try again"
        />
      )}

      {!isLoading && !isError && cases.length === 0 && (
        <EmptyState
          title={query || category !== "all" || tab !== "all" ? "No cases match" : "The docket is empty"}
          body={
            query || category !== "all" || tab !== "all"
              ? "Loosen the filters or search for a different name."
              : "No one has filed a case yet. Be the first to put a beef on the record."
          }
          href="/file"
          cta="File a case"
        />
      )}

      {!isLoading && !isError && cases.length > 0 && (
        <div className="case-grid">
          {cases.map((item) => (
            <CaseCard item={item} key={item.id} />
          ))}
        </div>
      )}

      {!isLoading && !isError && cases.length > 0 && (
        <button className="link-btn docket-refresh" type="button" onClick={() => void refetch()}>
          Refresh the docket
        </button>
      )}
    </>
  );
}
