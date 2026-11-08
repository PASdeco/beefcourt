import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Beef Court stores, what goes on-chain, and what stays in your browser.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="wrap">
      <div className="page-head">
        <span className="eyebrow">Nothing hidden</span>
        <h1>Privacy notice</h1>
        <p>Last updated: October 20, 2026</p>
      </div>
      <article className="prose">
        <h2>1. The short version</h2>
        <p>
          Beef Court has no accounts, no email signup, and no analytics tracker. Your wallet address and
          everything you file is public on GenLayer StudioNet. Browser preferences stay in your
          browser. We cannot delete on-chain data.
        </p>

        <h2>2. What goes on-chain</h2>
        <p>The contract stores, publicly and permanently:</p>
        <ul>
          <li>your wallet address and the other party&apos;s address;</li>
          <li>the case title, category, names, and both statements;</li>
          <li>the stake, pot, verdict, reasoning, scores, and timestamps;</li>
          <li>a log of case actions and the wallet that triggered each one.</li>
        </ul>
        <p>
          Blockchain data can be read by anyone and may be copied or indexed by third parties. Do not
          include sensitive personal information, addresses, phone numbers, or anything you may need to
          remove later.
        </p>

        <h2>3. What stays in your browser</h2>
        <p>Beef Court uses local storage for:</p>
        <ul>
          <li>
            <code>bc-theme</code> — your light or dark preference;
          </li>
          <li>
            <code>bc-wallet-rdns</code> — the wallet you last connected, so reconnecting is quick;
          </li>
          <li>
            <code>bc-flagged-v1</code> — cases you reported, so they stay hidden in your lists.
          </li>
        </ul>
        <p>Reports are local only. They are not sent to a server and do not affect the on-chain case.</p>

        <h2>4. Wallets and WalletConnect</h2>
        <p>
          Browser wallets are accessed through their injected provider. WalletConnect, if enabled,
          relays session data through WalletConnect&apos;s infrastructure and shows its own privacy
          terms. Beef Court never receives your private key or seed phrase.
        </p>

        <h2>5. Hosting and logs</h2>
        <p>
          The frontend may be hosted by a third-party provider that process IP addresses and standard
          request logs to serve the site and protect it from abuse. Beef Court does not combine those
          logs with wallet identities.
        </p>

        <h2>6. Your choices</h2>
        <p>
          You can clear browser storage at any time, disconnect your wallet, and choose not to file a
          case. Because the contract is public and immutable, deletion of on-chain data is not possible.
        </p>

        <h2>7. Contact</h2>
        <p>
          Open an issue in the project repository for privacy questions. See also the{" "}
          <Link href="/terms">terms of use</Link>.
        </p>
      </article>
    </div>
  );
}
