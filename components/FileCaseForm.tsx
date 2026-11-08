"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/components/WalletProvider";
import { TxSheet } from "@/components/TxSheet";
import { useToast } from "@/components/Toast";
import { useUserStats } from "@/lib/queries";
import { claimStarterCredits, createCase, getCases } from "@/lib/contract";
import { isCourtConfigured, friendlyError } from "@/lib/genlayer";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  MAX_OPEN_CASES,
  MAX_STAKE,
  MIN_STAKE,
  STARTER_CREDITS,
  ZERO_ADDRESS,
  type Category,
} from "@/lib/constants";
import { formatCredits, shortAddress } from "@/lib/format";
import type { DisputeCase, TxStage } from "@/lib/types";

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function FileCaseForm() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const { push } = useToast();
  const { address, provider, chainOk, openModal, switchToStudioNet } = useWallet();
  const { data: stats, isLoading: statsLoading } = useUserStats(address);

  const [title, setTitle] = useState(params.get("title") ?? "");
  const [category, setCategory] = useState<Category>(() => {
    const raw = params.get("category") as Category | null;
    return raw && CATEGORIES.includes(raw) ? raw : "roommates";
  });
  const [plaintiffName, setPlaintiffName] = useState(params.get("plaintiff") ?? "");
  const [statement, setStatement] = useState(params.get("statement") ?? "");
  const [stake, setStake] = useState(() => {
    const raw = Number(params.get("stake"));
    return Number.isFinite(raw) && raw >= MIN_STAKE && raw <= MAX_STAKE ? raw : 50;
  });
  const [mode, setMode] = useState<"invite" | "address">("invite");
  const [defendantAddress, setDefendantAddress] = useState("");

  const [stage, setStage] = useState<TxStage>("signing");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTitle, setSheetTitle] = useState("Filing the case");
  const [hash, setHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [created, setCreated] = useState<DisputeCase | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const configured = isCourtConfigured();
  const balance = stats?.balance ?? 0;
  const isPreview = params.get("preview") === "1";
  const defendant = mode === "address" ? defendantAddress.trim() : ZERO_ADDRESS;

  const validation = useMemo(() => {
    if (title.trim().length < 4) return "Give the case a title of at least 4 characters.";
    if (plaintiffName.trim().length < 2) return "Tell the court what to call you.";
    if (statement.trim().length < 20) return "Your side needs at least 20 characters.";
    if (statement.trim().length > 1200) return "Keep your side under 1,200 characters.";
    if (stake < MIN_STAKE || stake > MAX_STAKE) return "Stake must be between 10 and 200 credits.";
    if (mode === "address") {
      if (!ADDRESS_RE.test(defendant)) return "Enter a valid 0x wallet address for the other side.";
      if (address && defendant.toLowerCase() === address.toLowerCase()) {
        return "You cannot file a case against yourself.";
      }
    }
    if (address && stats && balance < stake) return "Not enough credits for that stake.";
    if (stats && stats.open_cases >= MAX_OPEN_CASES) {
      return `You already have ${MAX_OPEN_CASES} active cases. Settle one first.`;
    }
    return null;
  }, [title, plaintiffName, statement, stake, mode, defendant, address, stats, balance]);

  const ensureNetwork = async () => {
    if (!provider) return false;
    if (chainOk) return true;
    await switchToStudioNet();
    const id = (await provider.request({ method: "eth_chainId" })) as string;
    return parseInt(id, 16) === 61999;
  };

  const file = async () => {
    if (!configured) {
      push("The contract address is not configured yet.", "bad");
      return;
    }
    if (!address || !provider) {
      openModal();
      return;
    }
    if (validation) {
      push(validation, "bad");
      return;
    }
    setSubmitting(true);
    setTxError(null);
    setCreated(null);
    setHash(null);
    setStage("signing");
    setSheetTitle("Filing the case");
    setSheetOpen(true);

    try {
      if (!(await ensureNetwork())) {
        throw new Error("Switch your wallet to GenLayer StudioNet to file this case.");
      }
      const receipt = await createCase(
        provider,
        address,
        {
          title: title.trim(),
          category,
          plaintiffName: plaintiffName.trim(),
          statement: statement.trim(),
          defendantAddress: defendant,
          stake,
        },
        (next) => setStage(next),
      );
      setHash(receipt.hash);
      setStage("accepted");

      let match: DisputeCase | undefined;
      for (let attempt = 0; attempt < 6 && !match; attempt += 1) {
        const latest = await getCases(0, 5);
        match =
          latest.cases.find(
            (item) =>
              item.title === title.trim() &&
              item.plaintiff.toLowerCase() === address.toLowerCase(),
          ) ?? (latest.cases[0]?.plaintiff.toLowerCase() === address.toLowerCase() ? latest.cases[0] : undefined);
        if (!match) await new Promise((resolve) => setTimeout(resolve, 1_500));
      }
      if (match) setCreated(match);
      await queryClient.invalidateQueries();
      push(
        match
          ? "Case filed. Share the link so they can answer."
          : "Case filed. Open the docket to find it once StudioNet catches up.",
        "good",
      );
    } catch (error) {
      const message = friendlyError(error);
      setTxError(message);
      setStage("error");
    } finally {
      setSubmitting(false);
    }
  };

  const claim = async () => {
    if (!address || !provider) {
      openModal();
      return;
    }
    setClaiming(true);
    setTxError(null);
    setHash(null);
    setStage("signing");
    setSheetTitle("Claiming starter credits");
    setSheetOpen(true);
    try {
      if (!(await ensureNetwork())) {
        throw new Error("Switch your wallet to GenLayer StudioNet first.");
      }
      const receipt = await claimStarterCredits(provider, address, (next) => setStage(next));
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

  const closeSheet = () => {
    setSheetOpen(false);
    if (created) router.push(`/case/${created.id}`);
  };

  return (
    <>
      <div className="page-head">
        <h1>File a case</h1>
        <p>
          Put it on the record. The other side gets three days to answer, then the bench rules.
          {isPreview ? " Prefilled from the preview — edit anything before filing." : ""}
        </p>
      </div>

      <div className="form-page">
        <div className="form-card">
          <h2>The complaint</h2>
          <p>Plain words are enough. Names, dates, and what you want decided.</p>

          <div className="field">
            <label htmlFor="case-title">
              Case title <span>{title.length}/90</span>
            </label>
            <input
              id="case-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. The dishes standoff"
              maxLength={90}
            />
          </div>

          <div className="field">
            <span className="field-label">What kind of beef?</span>
            <div className="cat-chips">
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

          <div className="field">
            <label htmlFor="plaintiff-name">
              Your name <span>{plaintiffName.length}/24</span>
            </label>
            <input
              id="plaintiff-name"
              value={plaintiffName}
              onChange={(event) => setPlaintiffName(event.target.value)}
              placeholder="What should the bench call you?"
              maxLength={24}
            />
          </div>

          <div className="field">
            <label htmlFor="statement">
              Your side <span>{statement.length}/1,200</span>
            </label>
            <textarea
              id="statement"
              value={statement}
              onChange={(event) => setStatement(event.target.value)}
              placeholder="What happened, when, and what would a fair outcome look like? Facts beat insults."
              maxLength={1200}
            />
          </div>

          <div className="field">
            <span className="field-label">Who answers?</span>
            <div className="toggle-row">
              <button type="button" className={mode === "invite" ? "on" : ""} onClick={() => setMode("invite")}>
                Share an invite link
              </button>
              <button
                type="button"
                className={mode === "address" ? "on" : ""}
                onClick={() => setMode("address")}
              >
                Enter their wallet
              </button>
            </div>
            {mode === "address" ? (
              <input
                value={defendantAddress}
                onChange={(event) => setDefendantAddress(event.target.value)}
                placeholder="0x…"
                aria-label="Defendant wallet address"
                spellCheck={false}
              />
            ) : (
              <p className="helper">
                Leave the seat open. The first person who opens your invite link can claim it — send
                it only to the other side.
              </p>
            )}
          </div>

          <div className="field stake-block">
            <span className="field-label">Put up a stake</span>
            <div className="stake">
              <span>{MIN_STAKE}</span>
              <input
                type="range"
                min={MIN_STAKE}
                max={MAX_STAKE}
                step={10}
                value={stake}
                onChange={(event) => setStake(Number(event.target.value))}
                aria-label="Stake amount"
              />
              <output>{formatCredits(stake)} credits</output>
            </div>
            <p className="helper">
              The pot is paid out according to the ruling. The losing side may appeal once within 24
              hours. Testnet credits only.
            </p>
          </div>

          {validation && (statement.length > 0 || title.length > 0) && (
            <p className="helper" aria-live="polite">
              {validation}
            </p>
          )}

          <div className="form-actions">
            {address ? (
              <button className="btn" type="button" onClick={file} disabled={submitting || Boolean(validation)}>
                {submitting ? "Filing…" : `File case · ${formatCredits(stake)} credits`}
              </button>
            ) : (
              <button className="btn" type="button" onClick={openModal}>
                Connect wallet to file
              </button>
            )}
            <Link className="btn ghost" href="/">
              Not yet
            </Link>
          </div>

          {!configured && (
            <p className="form-error">
              The contract address is not configured. Set <code>NEXT_PUBLIC_CONTRACT_ADDRESS</code>.
            </p>
          )}
        </div>

        <aside>
          <div className="side-card">
            <h3>Your credits</h3>
            {!address ? (
              <p>Connect a wallet to see your testnet credit balance.</p>
            ) : statsLoading ? (
              <p>Checking your balance…</p>
            ) : (
              <>
                <div className="balance-line">
                  <b>{formatCredits(balance)}</b>
                  <span>testnet credits</span>
                </div>
                <p className="helper">
                  {shortAddress(address)}
                  {stats && !stats.claimed
                    ? " — you have not claimed your starter credits yet."
                    : ` · ${stats?.open_cases ?? 0}/${MAX_OPEN_CASES} open cases`}
                </p>
                {stats && !stats.claimed && (
                  <button className="btn brass" type="button" onClick={claim} disabled={claiming}>
                    {claiming ? "Claiming…" : `Claim ${STARTER_CREDITS} credits`}
                  </button>
                )}
                {stats?.claimed && balance < MIN_STAKE && (
                  <p className="helper">
                    You are out of credits. Win a case or wait for a top-up to file again.
                  </p>
                )}
                {stats && stats.open_cases >= MAX_OPEN_CASES && (
                  <p className="helper">
                    You have reached the limit of {MAX_OPEN_CASES} open cases. Settle one before
                    filing another.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="side-card">
            <h3>House rules</h3>
            <ul>
              <li>One side per person. No edits after filing.</li>
              <li>Stake 10–200 testnet credits. The pot moves with the ruling.</li>
              <li>Defendant has 3 days to answer, or the plaintiff may claim by default.</li>
              <li>One appeal per losing side, within 24 hours of the ruling.</li>
              <li>Keep it about the beef. Threats and doxxing are not evidence.</li>
            </ul>
          </div>

          <div className="side-card">
            <h3>What the bench sees</h3>
            <p>
              Only the title, category, both statements, and the amounts. Wallet addresses are
              shortened in the public view but remain on-chain.
            </p>
          </div>
        </aside>
      </div>

      <TxSheet
        open={sheetOpen}
        title={sheetTitle}
        stage={stage}
        hash={hash}
        error={txError}
        onClose={closeSheet}
      >
        {created && (
          <div className="tx-success">
            <p>
              <b>Case No. {String(created.id).padStart(4, "0")}</b> is on the docket. Share the link
              with {created.defendant === ZERO_ADDRESS ? "the other side" : shortAddress(created.defendant)}.
            </p>
            <Link className="btn" href={`/case/${created.id}`}>
              Open the case
            </Link>
          </div>
        )}
        {!created && sheetTitle === "Filing the case" && stage === "accepted" && (
          <div className="tx-success">
            <p>The case is on-chain, but the docket has not caught up yet.</p>
            <Link className="btn" href="/verdicts">
              Open the docket
            </Link>
          </div>
        )}
        {!created && sheetTitle === "Claiming starter credits" && stage === "accepted" && (
          <div className="tx-success">
            <p>{STARTER_CREDITS} testnet credits are now in your balance. Stake only what you can lose.</p>
            <button className="btn" type="button" onClick={() => setSheetOpen(false)}>
              Back to filing
            </button>
          </div>
        )}
      </TxSheet>
    </>
  );
}
