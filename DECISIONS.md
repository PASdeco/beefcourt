# Decisions

Short architecture decision records for Beef Court. The goal is to make the trade-offs explicit rather than bury them in code.

## ADR-001 — Credits ledger, not escrowed GEN

**Decision:** Cases stake an internal `u64` credit balance maintained by the contract. Users receive 500 starter credits once. Credits are not tokens and cannot be transferred or withdrawn.

**Why:** GenLayer StudioNet documentation is explicit that balances are simulated for the hosted environment. Moving real value would require an escrow design, token integration, and a security review that this prototype does not have. A ledger keeps the court mechanics honest: the stake affects the payout, but nobody is misled into depositing funds.

**Consequences:** No withdrawal flow, no faucet beyond the starter grant, and no real economic security. The UI repeatedly labels credits as testnet-only. A production version would need an audited escrow contract on a network with real assets.

## ADR-002 — Custom validator over `prompt_comparative`

**Decision:** Judge calls use `gl.vm.run_nondet_unsafe(leader_fn, validator_fn)`. A validator re-runs the judge and accepts only if the winner matches exactly and the plaintiff share is within 15 points (8 on appeal).

**Why:** The case outcome is structured — winner plus split — not open-ended prose. Comparing structured values is precise, testable, and avoids rewarding two models that merely sound alike. GenLayer recommends custom validators for this shape. It also lets the contract normalize the final share and fall back safely.

**Consequences:** Validators pay for an additional model call, adding latency and cost. Two good-faith judges can still disagree on a close case, producing no consensus and a retry rather than a ruling. That is preferable to a silently wrong payout.

## ADR-003 — Lifecycle and appeal window

**Decision:** `OPEN → DEFENDED → RULED → FINAL`, with `EXPIRED` for a default judgment. Defense window: 3 days. Appeal window: 24 hours. One appeal per case. The losing side appeals; on a split, either party may. `finalize()` can be called by anyone after the window.

**Why:** Both parties need time to answer and to decide on an appeal, but indefinite cases are bad for everyone. A permissionless `finalize` prevents a case from being stuck forever because a winner refuses to act.

**Consequences:** A case can sit in `RULED` for up to 24 hours before payout. The appeal re-runs the full judge prompt, so it doubles the AI work for appealed cases. There is no appeal fee in this version; the UI does not claim one.

## ADR-004 — Open invite seats

**Decision:** `create_case` accepts the zero address as the defendant. Any wallet that is not the plaintiff can claim the seat by filing the first defense before the deadline.

**Why:** Most real beefs happen before both wallets are known. Requiring the plaintiff to obtain the other address first is friction that would kill the main use case.

**Consequences:** Invite links are bearer links. The plaintiff must send the link only to the other side. An unrelated wallet can technically claim the seat, so the UI warns about this. If the plaintiff does know the address, naming it is safer.

## ADR-005 — Stake and activity limits

**Decision:** Stake range 10–200 credits. Starter grant 500. Maximum three active cases per wallet, counted across `OPEN`, `DEFENDED`, and `RULED`.

**Why:** The limits make the starter grant enough for real use (up to three meaningful stakes) while limiting spam and keeping the per-wallet state index small. A 200-credit cap keeps one whale from dominating the demo economy.

**Consequences:** A wallet that files three cases cannot file again until one settles. Losing three maximum stakes drains the starter grant. There is no top-up mechanism yet; users can earn credits by winning.

## ADR-006 — Permanent public record, local reporting

**Decision:** Cases are never edited or deleted on-chain. The “Report this case” button stores an ID in `localStorage` and hides the case only in that browser.

**Why:** GenLayer state is public and append-only; pretending otherwise would be dishonest. A real moderation system needs an admin or community process, which is out of scope for the prototype.

**Consequences:** Abuse cannot be removed from the chain. The UI warns users not to publish sensitive data. A production system needs a moderation policy and likely an indexer that can filter content.

## ADR-007 — Next.js 15 + TanStack Query + genlayer-js

**Decision:** Use the App Router with a small client-side data layer built on TanStack Query and genlayer-js. Wallet discovery uses EIP-6963 with an injected fallback; WalletConnect is lazy-loaded only when configured.

**Why:** Read calls poll naturally, writes need multi-stage status feedback, and genlayer-js is the maintained SDK. TanStack Query gives caching, retries, and targeted invalidation without a bespoke store. EIP-6963 avoids hard-coding wallet vendors.

**Consequences:** The case pages are dynamically rendered when the server needs on-chain metadata. Client reads still require a browser RPC call. WalletConnect adds a large optional dependency and a project ID requirement; it is not on the critical path.

## ADR-008 — Dual brand assets with CSS theme swap

**Decision:** Ship light-background and dark-background logo files, and swap them with CSS based on `data-theme`. Generate transparent and 256px variants for favicons and WalletConnect metadata.

**Why:** A single transparent logo either disappears on cream or looks heavy on black. CSS swapping avoids a client-side effect and therefore avoids a logo flash on first paint. The inline theme script restores the stored preference before React hydrates.

**Consequences:** Two image requests are possible depending on CSS, though only one is displayed. The asset naming (`*-light-bg`, `*-dark-bg`) is now part of the contract with `ThemeLogo`.

## ADR-009 — Test strategy

**Decision:** Direct-mode contract tests cover the full lifecycle with the real GenLayer test harness. Vitest covers pure client formatting. A production build plus live HTTP smoke test proves the deployed contract address is readable by the app.

**Why:** Contract behavior is the risky part; UI unit tests add little compared with end-to-end wallet tests that require a funded browser wallet. The direct tests run fast and deterministic; the smoke test catches wiring failures.

**Consequences:** There is no automated Playwright wallet flow yet. Write-path UI behavior was verified by typecheck, build, and code review, not by a browser-driven transaction. Adding Playwright with a local funded account is the next testing step.

## ADR-010 — Server-rendered case metadata, dynamic OG image

**Decision:** Case pages fetch the case on the server for metadata and initial data, then hydrate into a polling client query. The OG image is generated per case with `next/og`.

**Why:** Search engines and social cards need real case titles and statuses, not a generic shell. Passing `initialData` avoids a blank first paint. Dynamic OG cards make shared cases legible without exposing new data — the case is already public.

**Consequences:** A page request performs one contract read on the server, then the client polls. If StudioNet is unavailable, the page shows a court-offline state while keeping the case URL valid.

## Open items

- Real escrow/token mode is intentionally not implemented.
- No admin/moderation tooling; reports are browser-local.
- WalletConnect requires a project ID and was not live-tested without one.
- No Playwright wallet test yet.
- The five-judge UI is a set of lenses, not five on-chain vote records. The contract exposes only consensus.
- StudioNet’s hosted RPC has occasional finalization and introspection issues; writes may take longer than the UI’s five-minute polling ceiling.
