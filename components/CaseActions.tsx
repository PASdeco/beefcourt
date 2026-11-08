"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/components/WalletProvider";
import { TxSheet } from "@/components/TxSheet";
import { useToast } from "@/components/Toast";
import {
  appealCase,
  claimDefault,
  claimStarterCredits,
  finalizeCase,
  requestRuling,
  submitDefense,
} from "@/lib/contract";
import { friendlyError, isCourtConfigured, txHashFromError } from "@/lib/genlayer";
import { queryKeys, useUserStats } from "@/lib/queries";
import { MAX_OPEN_CASES, ZERO_ADDRESS } from "@/lib/constants";
import { formatCredits, shortAddress } from "@/lib/format";
import type { DisputeCase, TxStage } from "@/lib/types";

type Action = "claim" | "defense" | "ruling" | "appeal" | "finalize" | "default" | null;

const ACTION_TITLES: Record<Exclude<Action, null>, string> = {
  claim: "Claiming starter credits",
  defense: "Filing the defense",
  ruling: "Calling the bench",
  appeal: "Appealing to the larger bench",
  finalize: "Finalizing the ruling",
  default: "Claiming by default",
};

export function CaseActions({ caseData, now }: { caseData: DisputeCase; now: number }) {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const { address, provider, chainOk, openModal, switchToStudioNet } = useWallet();
  const { data: stats, isLoading: statsLoading } = useUserStats(address);

  const [action, setAction] = useState<Action>(null);
  const [stage, setStage] = useState<TxStage>("signing");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [defenseOpen, setDefenseOpen] = useState(false);
  const [defenseName, setDefenseName] = useState("");
  const [defenseText, setDefenseText] = useState("");

  const plaintiff = caseData.plaintiff;
  const defendant = caseData.defendant;
  const isPlaintiff = Boolean(address && address.toLowerCase() === plaintiff.toLowerCase());
  const isDefendant = Boolean(
    address && defendant !== ZERO_ADDRESS && address.toLowerCase() === defendant.toLowerCase(),
  );
  const isParty = isPlaintiff || isDefendant;
  const seatOpen = defendant === ZERO_ADDRESS;
  const needsClaim = Boolean(address && stats && !stats.claimed);
  const atActiveLimit = Boolean(stats && stats.open_cases >= MAX_OPEN_CASES);

  const canDefend =
    caseData.status === "OPEN" &&
    !isPlaintiff &&
    (seatOpen || isDefendant) &&
    now <= caseData.deadline;

  const canClaimDefault =
    caseData.status === "OPEN" && isPlaintiff && now > caseData.deadline;

  const canRequest = caseData.status === "DEFENDED" && isParty;

  const verdict = caseData.verdict;
  const loser =
    caseData.status === "RULED" && verdict
      ? verdict.winner === "split"
        ? isParty
        : verdict.winner === "plaintiff"
          ? isDefendant
          : isPlaintiff
      : false;

  const canAppeal =
    caseData.status === "RULED" &&
    loser &&
    !caseData.appealed &&
    now < caseData.appeal_deadline;

  const canFinalize = caseData.status === "RULED" && now >= caseData.appeal_deadline;

  const ensureNetwork = async () => {
    if (!provider) return false;
    if (chainOk) return true;
    await switchToStudioNet();
    const id = (await provider.request({ method: "eth_chainId" })) as string;
    return parseInt(id, 16) === 61999;
  };

  const run = async (kind: Exclude<Action, null>, fn: () => Promise<{ hash: string }>) => {
    if (!isCourtConfigured()) {
      push("The contract address is not configured yet.", "bad");
      return;
    }
    if (!address || !provider) {
      openModal();
      return;
    }
    setBusy(true);
    setAction(kind);
    setSheetOpen(true);
    setStage("signing");
    setHash(null);
    setTxError(null);
    try {
      if (!(await ensureNetwork())) {
        throw new Error("Switch your wallet to GenLayer StudioNet to continue.");
      }
      const receipt = await fn();
      setHash(receipt.hash);
      setStage("accepted");
      await queryClient.invalidateQueries({ queryKey: queryKeys.case(caseData.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      await queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard });
      if (address) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.userStats(address) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.userCases(address) });
      }
      push("Recorded on StudioNet.", "good");
      setDefenseOpen(false);
    } catch (error) {
      const failedHash = txHashFromError(error);
      if (failedHash) setHash(failedHash);
      setTxError(friendlyError(error));
      setStage("error");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!address || !provider) {
      openModal();
      return;
    }
    if (defenseName.trim().length < 2) {
      push("Tell the court what to call you.", "bad");
      return;
    }
    if (defenseText.trim().length < 20) {
      push("Your side needs at least 20 characters.", "bad");
      return;
    }
    if (stats && stats.open_cases >= MAX_OPEN_CASES) {
      push(`You already have ${MAX_OPEN_CASES} active cases. Settle one first.`, "bad");
      return;
    }
    await run("defense", () =>
      submitDefense(provider, address, caseData.id, defenseName.trim(), defenseText.trim(), setStage),
    );
  };

  const hasAction = canDefend || canClaimDefault || canRequest || canAppeal || canFinalize;

  return (
    <>
      <div className="case-actions">
        {!address && hasAction && (
          <button className="btn" type="button" onClick={openModal}>
            Connect wallet to act
          </button>
        )}

        {canDefend && address && needsClaim && (
          <>
            <button
              className="btn brass"
              type="button"
              onClick={() => provider && run("claim", () => claimStarterCredits(provider, address, setStage))}
              disabled={busy}
            >
              Claim 500 starter credits
            </button>
            <p className="helper">
              You need court credits to answer. The starter grant covers this {formatCredits(caseData.stake)}-credit stake.
            </p>
          </>
        )}

        {canDefend && address && !needsClaim && (
          <button
            className="btn brass"
            type="button"
            onClick={() => setDefenseOpen(true)}
            disabled={busy || statsLoading}
          >
            {statsLoading ? "Checking your credits." : "Answer this case"}
          </button>
        )}

        {caseData.status === "OPEN" && isPlaintiff && now <= caseData.deadline && (
          <p className="helper">Waiting for the other side. Send them the case link.</p>
        )}

        {caseData.status === "OPEN" && !isPlaintiff && !seatOpen && !isDefendant && (
          <p className="helper">Only the named defendant can answer this case.</p>
        )}

        {canClaimDefault && (
          <button
            className="btn brass"
            type="button"
            disabled={busy}
            onClick={() =>
              address &&
              provider &&
              run("default", () => claimDefault(provider, address, caseData.id, setStage))
            }
          >
            Claim by default
          </button>
        )}

        {canRequest && (
          <button
            className="btn"
            type="button"
            disabled={busy}
            onClick={() =>
              address &&
              provider &&
              run("ruling", () => requestRuling(provider, address, caseData.id, setStage))
            }
          >
            Call the bench
          </button>
        )}

        {caseData.status === "DEFENDED" && !isParty && (
          <p className="helper">Both sides are in. A party must call the bench before it rules.</p>
        )}

        {canAppeal && (
          <button
            className="btn"
            type="button"
            disabled={busy}
            onClick={() =>
              address &&
              provider &&
              run("appeal", () => appealCase(provider, address, caseData.id, setStage))
            }
          >
            Appeal to the larger bench
          </button>
        )}

        {canFinalize && (
          <button
            className="btn"
            type="button"
            disabled={busy}
            onClick={() =>
              address &&
              provider &&
              run("finalize", () => finalizeCase(provider, address, caseData.id, setStage))
            }
          >
            Finalize and pay out
          </button>
        )}

        {caseData.status === "RULED" && now < caseData.appeal_deadline && !canAppeal && (
          <p className="helper">
            The appeal window is open. The losing side has until{" "}
            {new Date(caseData.appeal_deadline * 1000).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}{" "}
            to appeal.
          </p>
        )}
      </div>

      {defenseOpen && (
        <div className="modal on" role="presentation" onClick={() => setDefenseOpen(false)}>
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="defense-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="defense-title">Your side of the story</h3>
            <p>
              {seatOpen
                ? `You are claiming the open defendant seat as ${shortAddress(address)}.`
                : "You are the named defendant. This answer is final once filed."}
            </p>
            <div className="field">
              <label htmlFor="defense-name">Your name</label>
              <input
                id="defense-name"
                value={defenseName}
                onChange={(event) => setDefenseName(event.target.value)}
                maxLength={24}
                placeholder="What should the bench call you?"
              />
            </div>
            <div className="field">
              <label htmlFor="defense-text">Your side</label>
              <textarea
                id="defense-text"
                value={defenseText}
                onChange={(event) => setDefenseText(event.target.value)}
                maxLength={1200}
                placeholder="What actually happened? Facts, dates, and what would be fair."
              />
            </div>
            <p className="helper">
              Filing the defense stakes {formatCredits(caseData.stake)} credits. The pot becomes{" "}
              {formatCredits(caseData.stake * 2)} credits.
            </p>
            <div className="form-actions">
              <button className="btn" type="button" onClick={submit} disabled={busy}>
                {busy ? "Filing…" : "File my defense"}
              </button>
              <button className="btn ghost" type="button" onClick={() => setDefenseOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <TxSheet
        open={sheetOpen}
        title={action ? ACTION_TITLES[action] : "Court action"}
        stage={stage}
        hash={hash}
        error={txError}
        onClose={() => setSheetOpen(false)}
      >
        {stage === "accepted" && (
          <div className="tx-success">
            <p>
              {action === "ruling"
                ? "The ruling is on-chain and the payout has been recorded."
                : action === "appeal"
                  ? "The appeal ruling is final and the pot has been paid out."
                  : action === "finalize" || action === "default"
                    ? "The case is settled and the pot has been paid out."
                    : action === "claim"
                      ? "Your 500 starter credits are ready. You can answer this case now."
                      : "The defense is on the record. Either party can now call the bench."}
            </p>
            <button className="btn" type="button" onClick={() => setSheetOpen(false)}>
              Back to the case
            </button>
          </div>
        )}
      </TxSheet>
    </>
  );
}
