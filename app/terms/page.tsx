import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "The rules for using Beef Court, a GenLayer StudioNet prototype.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="wrap">
      <div className="page-head">
        <span className="eyebrow">The fine print</span>
        <h1>Terms of use</h1>
        <p>Last updated: October 20, 2026</p>
      </div>
      <article className="prose">
        <h2>1. What this is</h2>
        <p>
          Beef Court is a prototype application running on GenLayer StudioNet. It lets two parties
          submit a dispute, stake simulated credits, and receive a ruling produced by independent AI
          validators. Beef Court is not a court of law, an arbitration service, or a provider of legal
          advice. Rulings are not legally binding and do not create rights enforceable anywhere.
        </p>

        <h2>2. Testnet credits only</h2>
        <p>
          All balances are internal ledger entries in the Beef Court contract. Credits are not
          cryptocurrency, have no monetary value, cannot be purchased, transferred, withdrawn, or
          redeemed, and may be reset if the contract or network is redeployed. Starter credits are a
          one-time grant. Do not use Beef Court if you are expecting to recover or earn real funds.
        </p>

        <h2>3. Your conduct</h2>
        <p>You agree not to use Beef Court to:</p>
        <ul>
          <li>threaten, harass, defame, or expose another person&apos;s private information;</li>
          <li>post illegal content, or content involving minors or imminent harm;</li>
          <li>impersonate another person or wallet;</li>
          <li>attempt to manipulate the AI validators with hidden instructions or prompt injection;</li>
          <li>spam cases, exploit the contract, or interfere with other users.</li>
        </ul>
        <p>
          Statements are public and permanent. We may hide a case from Beef Court&apos;s own interface,
          but we cannot delete on-chain data.
        </p>

        <h2>4. AI rulings are uncertain</h2>
        <p>
          AI models can be wrong, inconsistent, or manipulated. Validators reduce that risk but do not
          eliminate it. The contract may fall back to an even split when a reliable verdict cannot be
          produced. By filing a case you accept that the outcome may be arbitrary or undesirable.
        </p>

        <h2>5. Wallets and fees</h2>
        <p>
          You are responsible for your wallet, keys, and network fees. Beef Court never asks for a seed
          phrase or private key. Transactions are irreversible once submitted to the network.
        </p>

        <h2>6. No warranty</h2>
        <p>
          Beef Court is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of
          any kind, including fitness for a particular purpose, accuracy, or uninterrupted
          availability. To the maximum extent permitted by law, Beef Court and its contributors are not
          liable for any loss arising from use of the prototype, including loss of credits, network
          fees, or reputational harm.
        </p>

        <h2>7. Changes</h2>
        <p>
          The interface, contract, and these terms may change at any time. Continued use after a change
          means you accept the updated terms. Material changes will be reflected by the date above.
        </p>

        <h2>8. Contact</h2>
        <p>
          Open an issue in the project repository for questions. See also the{" "}
          <Link href="/privacy">privacy notice</Link> and the{" "}
          <Link href="/faq">FAQ</Link>.
        </p>
      </article>
    </div>
  );
}
