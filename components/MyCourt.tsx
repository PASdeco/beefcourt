"use client";

import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/components/WalletProvider";
import { CaseCard } from "@/components/CaseCard";
import { EmptyState, Skeleton } from "@/components/EmptyState";
import { TxSheet } from "@/components/TxSheet";
import { useToast } from "@/components/Toast";
import { useCasesFor, useUserStats } from "@/lib/queries";
import { claimStarterCredits } from "@/lib/contract";
import { friendlyError } from "@/lib/genlayer";
import { MAX_OPEN_CASES, STARTER_CREDITS, STUDIONET_EXPLORER } from "@/lib/constants";
import { formatCredits, shortAddress } from "@/lib/format";
import type { TxStage } from "@/lib/types";

export function MyCourt() {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const { address, provider, openModal, switchToStudioNet } = useWallet();
  const { data: stats, isLoading: statsLoading, isError: statsError } = useUserStats(address);
  const { data: cases, isLoading: casesLoading, isError: casesError } = useCasesFor(address);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [stage, setStage] = useState<TxStage>("signing");
  const [hash, setHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  const claim = async () => {
    if (!address || !provider) {
      openModal();
      return;
    }
    setClaiming(true);
    setTxError(null);
    setHash(null);
    setStage("signing");
    setSheetOpen(true);
    try {
      const id = (await provider.request({ method: "eth_chainId" })) as string;
      if (parseInt(id, 16) !== 61999) {
        await switchToStudioNet();
        const next = (await provider.request({ method: "eth_chainId" })) as string;
        if (parseInt(next, 16) !== 61999) throw new Error("Switch your wallet to StudioNet first.");
      }
      const receipt = await claimStarterCredits(provider, address, setStage);
      setHash(receipt.hash);
      setStage("accepted");
      await queryClient.invalidateQueries();
      push(`${STARTER_CREDITS} testnet credits added.`, "good");
    } catch (error) {
      setTxError(friendlyError(error));
      setStage("error");
    } finally {
      setClaiming(false);
    }
  };

  if (!address) {
    return (
      <div className="empty-state">
        <span className="empty-seal" aria-hidden="true">
          §
        </span>
        <h3>Your record is waiting</h3>
        <p>Connect a wallet to see your credits, cases, and record — and to claim 500 starter credits.</p>
        <button className="btn brass" type="button" onClick={openModal}>
          Connect wallet
        </button>
      </div>
    );
  }

  const openCases = cases?.cases.filter((item) => ["OPEN", "DEFENDED", "RULED"].includes(item.status)) ?? [];

  return (
    <>
      <div className="panel-card" style={{ marginBottom: 22 }}>
        <span className="eyebrow">Your seat at the court</span>
        <h2 style={{ fontSize: 30 }}>{shortAddress(address)}</h2>
        <p>
          <a
            href={`${STUDIONET_EXPLORER}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View this wallet on the explorer ↗
          </a>
        </p>
        <div className="cta" style={{ margin: "18px 0 0" }}>
          {stats && !stats.claimed && (
            <button className="btn brass" type="button" onClick={claim} disabled={claiming}>
              {claiming ? "Claiming…" : `Claim ${STARTER_CREDITS} starter credits`}
            </button>
          )}
          <Link className="btn ghost" href="/file">
            File a new case
          </Link>
        </div>
      </div>

      {statsError && <p className="form-error">Your record could not be read from StudioNet.</p>}

      {statsLoading ? (
        <Skeleton lines={3} />
      ) : stats ? (
        <div className="stat-grid">
          <div className="stat-box">
            <span>Credit balance</span>
            <b>{formatCredits(stats.balance)}</b>
            <small>testnet credits</small>
          </div>
          <div className="stat-box">
            <span>Record</span>
            <b>
              {stats.wins}–{stats.losses}
            </b>
            <small>{stats.splits} split decisions</small>
          </div>
          <div className="stat-box">
            <span>Net winnings</span>
            <b>{stats.earnings > 0 ? `+${formatCredits(stats.earnings)}` : formatCredits(stats.earnings)}</b>
            <small>credits across {stats.cases} cases</small>
          </div>
          <div className="stat-box">
            <span>Open cases</span>
            <b>
              {stats.open_cases}/{MAX_OPEN_CASES}
            </b>
            <small>the bench is still holding</small>
          </div>
        </div>
      ) : null}

      <div className="tabs">
        <button className="on" type="button">
          My cases {cases ? `(${cases.cases.length})` : ""}
        </button>
      </div>

      {casesLoading && (
        <div className="case-grid">
          <Skeleton lines={4} />
          <Skeleton lines={4} />
        </div>
      )}

      {casesError && (
        <p className="form-error">Your cases could not be loaded. The docket itself is unaffected.</p>
      )}

      {!casesLoading && !casesError && cases && cases.cases.length === 0 && (
        <EmptyState
          title="No cases yet"
          body="Your name is not on the record. File something worth settling."
          href="/file"
          cta="File your first case"
        />
      )}

      {!casesLoading && !casesError && cases && cases.cases.length > 0 && (
        <>
          {openCases.length > 0 && (
            <p className="docket-count">
              {openCases.length} of your cases {openCases.length === 1 ? "is" : "are"} still active.
            </p>
          )}
          <div className="case-grid">
            {cases.cases.map((item) => (
              <CaseCard item={item} key={item.id} />
            ))}
          </div>
        </>
      )}

      <TxSheet
        open={sheetOpen}
        title="Claiming starter credits"
        stage={stage}
        hash={hash}
        error={txError}
        onClose={() => setSheetOpen(false)}
      >
        {stage === "accepted" && (
          <div className="tx-success">
            <p>{STARTER_CREDITS} testnet credits are now in your balance. They are not real funds.</p>
            <button className="btn" type="button" onClick={() => setSheetOpen(false)}>
              Back to my court
            </button>
          </div>
        )}
      </TxSheet>
    </>
  );
}
