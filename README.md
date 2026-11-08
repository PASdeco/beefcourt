<div align="center">

# ⚖️ Beef Court

### Settle it. For good.

**A GenLayer dApp that settles small disputes with AI validators — on-chain.**

Two sides stake testnet credits, write their version of the beef, and independent AI validators reach consensus on a ruling. The contract splits the pot and records the verdict permanently on-chain.

[![Live App](https://img.shields.io/badge/live-gen--beefcourt.vercel.app-25D366?style=flat-square&logo=vercel&logoColor=white)](https://gen-beefcourt.vercel.app/)
[![Network](https://img.shields.io/badge/network-GenLayer%20StudioNet-7C5CFF?style=flat-square)](https://docs.genlayer.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/tests-27%20passing-23966B?style=flat-square)](#testing)

</div>

---

> [!WARNING]
> **Prototype.** Credits are an internal StudioNet ledger, not real money. They cannot be bought, sold, transferred, or withdrawn. Case records are public and permanent — do not post sensitive personal data.

## How it works

1. **File a case** — title, category, both-side names, a written statement, and a stake (10–200 credits). Name the defendant, or leave an open invite seat that the first non-plaintiff wallet can claim.
2. **Defend** — the defendant has **3 days** to respond with a matching stake. No response? The plaintiff can claim a default judgment.
3. **Get ruled** — five independent judging lenses evaluate the statements. AI validators run the judge, verify each other under GenLayer's [Equivalence Principle](https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle), and reach consensus.
4. **Verdict on-chain** — winner, payout split, written reasoning, and 0–100 scores for facts, fairness, and effort.
5. **Appeal (once)** — the losing side has **24 hours** to appeal to a larger, stricter bench. The appeal ruling settles immediately.

## Live deployment

| | |
| --- | --- |
| **App** | [gen-beefcourt.vercel.app](https://gen-beefcourt.vercel.app/) |
| **Network** | GenLayer StudioNet (chain ID `61999` / `0xf22f`) |
| **Contract** | [`0xf22732FaF45762A14a2418a46671E0393bAFd22F`](https://explorer-studio.genlayer.com/address/0xf22732FaF45762A14a2418a46671E0393bAFd22F) |
| **Deploy tx** | [`0xf29e7eab…2c83a41`](https://explorer-studio.genlayer.com/transaction/0xf29e7eab313ab37c3883bae940effd1b3e566ab252c2c124633d129b82c83a41) |

## Features

- **Case filing** with title, category, statements from both sides, and a stake
- **Open invite seats** — file against an unknown wallet; the first non-plaintiff claims the seat
- **Five judging lenses** and an appeal to a larger, stricter bench
- **On-chain verdicts** — winner, plaintiff share, reasoning, and 0–100 scores for facts, fairness, and effort
- **Public docket** with search, category filters, status filters, and local hiding of reported cases
- **Personal court page** (`/me`) — credit balance, case record, open cases, one-time 500-credit starter grant
- **Leaderboards** — net earnings and most-overruled wallets
- **Polished client** — light/dark theme, responsive layout, static and per-case Open Graph images, sitemap, robots, manifest, JSON-LD

## Tech stack

| Layer | Tools |
| --- | --- |
| Intelligent Contract | Python, [GenLayer SDK](https://docs.genlayer.com/) (GenVM), `gl.vm.run_nondet_unsafe` |
| Web client | Next.js 15 (App Router), TypeScript, Tailwind CSS 4 |
| Data layer | TanStack Query, [genlayer-js](https://github.com/genlayerlabs/genlayer-js) (viem-based) |
| Wallet | EIP-6963 discovery, injected fallback, optional WalletConnect |
| Testing | genlayer-test (direct-mode contract tests), Vitest (client units) |
| Hosting | Vercel |

## Project structure

```text
contracts/beef_court.py       GenLayer Intelligent Contract (state, judging, payouts)
tests/direct/                 Direct-mode contract tests (genlayer-test)
tests/unit/                   Vitest unit tests
lib/                          chain constants, contract wrapper, genlayer-js client, queries
components/                   wallet, theme, case UI, transaction progress, docket
app/                          App Router pages and metadata routes
scripts/                      deploy and seed scripts
design/                       blueprint and visual reference
public/brand/                 logo/symbol assets for light, dark, and transparent use
```

## The contract

The contract keeps an internal `u64` credit ledger, case records as JSON, user indexes, and aggregate stats.

### Write methods

| Method | Purpose |
| --- | --- |
| `claim_starter_credits()` | One-time 500-credit grant. |
| `create_case(title, category, plaintiff_name, statement, defendant_address, stake)` | Files a case and deducts the stake. Zero address = open seat. |
| `submit_defense(case_id, defendant_name, statement)` | Matches the stake and records the defense. |
| `request_ruling(case_id)` | Runs the five-lens judge and stores the verdict. |
| `appeal(case_id)` | Losing side appeals once; stricter consensus; pays out immediately. |
| `finalize(case_id)` | Releases the pot after the appeal window if nobody appealed. Permissionless. |
| `claim_default(case_id)` | Plaintiff takes the pot after an unanswered 3-day window. |

### View methods

`get_case` · `get_cases` · `get_cases_for` · `get_stats` · `get_user_stats` · `get_balance` · `get_leaderboard` · `get_most_overruled`

### Consensus design

`_judge()` uses `gl.vm.run_nondet_unsafe`, which lets validators independently run the model and verify each other. A validator accepts the leader result only when the **winner matches exactly** and the plaintiff share is within **15 points** on a first ruling or **8 points** on appeal. Comparing structured values — not prose — is the GenLayer-recommended pattern for custom validation.

Verdicts are normalized before storing or paying: a plaintiff win pays at least 51%, a defendant win at most 49%, and a split is always 50/50. Malformed model output falls back to an even split marked `fallback: true`.

### Case lifecycle

```text
OPEN ──defense──▶ DEFENDED ──request_ruling──▶ RULED ──24h, no appeal──▶ FINAL
 │                    │                          │
 └──3d timeout──▶ EXPIRED                        └──appeal──▶ re-ruled (stricter) ──▶ paid immediately
```

## Getting started

**Requirements:** Node 22+, Python 3.11+ (for contract tests), a Studionet-funded deploy key (deployment only).

```bash
# 1. Install dependencies
npm install
pip install -r requirements-dev.txt

# 2. Configure environment
cp .env.example .env        # fill BACKEND_PRIVATE_KEY only for deploying
cp .env.example .env.local  # set NEXT_PUBLIC_CONTRACT_ADDRESS

# 3. Run locally
npm run dev                 # http://localhost:3000
```

### Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `GENLAYER_NETWORK` / `GENLAYER_RPC` | server | GenLayer connection for scripts |
| `NEXT_PUBLIC_NETWORK` / `NEXT_PUBLIC_GENLAYER_RPC_URL` / `NEXT_PUBLIC_GENLAYER_EXPLORER` | client | Network name, RPC, explorer links |
| `BACKEND_PRIVATE_KEY` | server | Deploy wallet. **Never expose as `NEXT_PUBLIC_` and never commit.** |
| `BEEFCOURT_CONTRACT_ADDRESS` / `NEXT_PUBLIC_CONTRACT_ADDRESS` | both | Deployed contract address |
| `NEXT_PUBLIC_SITE_URL` | server | Canonical URL for metadata/OG |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | client | Optional — enables WalletConnect |

## Commands

```bash
npm run dev            # local Next.js dev server
npm run build          # production build
npm run start          # production server
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm test               # Vitest unit tests
npm run test:contract  # direct-mode contract tests (pytest)
npm run deploy         # deploy the contract and write its address to env files
npm run seed           # claim starter credits and file three open cases
```

## Testing

- **Contract (15 tests)** — direct-mode tests against the real GenLayer harness with mocked web/LLM calls, covering the full case lifecycle: filing, defense, default judgment, ruling, appeal, finalize, and credit accounting.
- **Client (12 tests)** — Vitest units for the formatting layer (credits, countdowns, verdict text, statuses).
- **Smoke** — a production build plus live HTTP check proves the deployed contract address is readable by the app.

```bash
npm run test:contract   # pytest tests/direct -q
npm test                # vitest run
```

## Safety and limits

- **Testnet credits only.** No deposits, withdrawals, transfers, or real-money value.
- **AI is fallible.** Consensus reduces but does not eliminate bad or arbitrary rulings.
- **Everything is public and permanent.** Statements, wallet addresses, and rulings cannot be deleted.
- **Moderation is local.** "Report this case" hides it in your browser (`localStorage`); it does not remove the on-chain case.
- **No protocol fee.** Wallet network fees still apply.
- **WalletConnect is optional** — browser wallets work without it.

## Design decisions

The reasoning behind every major trade-off — the credits ledger instead of escrowed GEN, the custom validator over `prompt_comparative`, the lifecycle windows, open invite seats, stake limits, and more — is documented in [DECISIONS.md](./DECISIONS.md).

---

<div align="center">

Built on [GenLayer](https://genlayer.com/) — the blockchain where AI settles it.

</div>
