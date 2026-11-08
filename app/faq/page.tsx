import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Straight answers about Beef Court credits, AI validators, appeals, and privacy.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    q: "What exactly is Beef Court?",
    a: "A GenLayer dispute court. Two sides put up testnet credits, write their version of a beef, and independent AI validators rule. The contract splits the pot according to the ruling and records everything publicly.",
  },
  {
    q: "Are credits real money?",
    a: "No. Credits are an internal ledger on GenLayer StudioNet. They are not tokens, cannot be transferred or withdrawn, and have no monetary value. Starter credits are a one-time grant of 500.",
  },
  {
    q: "Why do I need to stake credits?",
    a: "The stake gives both sides skin in the game and sets the pot the ruling divides. It also limits spam: filing deducts your stake immediately, and the defendant must match it to answer.",
  },
  {
    q: "Can I delete a case after filing?",
    a: "No. Statements, rulings, and wallet addresses are on-chain and public. There is no edit or delete. Do not post threats, doxxing, or anything you need to take back.",
  },
  {
    q: "Who are the five judges?",
    a: "They are judging lenses used in the brand and UI — facts, fairness, effort, exaggeration, and peacemaking. The actual decision comes from GenLayer validators running independent AI models. The UI shows only the consensus verdict, never invented vote counts.",
  },
  {
    q: "What if the validators disagree?",
    a: "If a case cannot reach consensus, the ruling transaction does not settle it. Nothing changes and a party can retry. If a ruling is malformed, the contract falls back to a 50/50 split and labels it as a fallback.",
  },
  {
    q: "How long do I have to answer?",
    a: "Three days from filing. After that the plaintiff can claim a default judgment. An open invite seat can be claimed by the first non-plaintiff wallet before the deadline.",
  },
  {
    q: "How long does an appeal take?",
    a: "The losing side has 24 hours after the ruling to appeal once. The appeal uses a stricter agreement threshold. Its ruling is final and pays out immediately.",
  },
  {
    q: "Can the other side see my wallet?",
    a: "Yes. Wallet addresses and case contents are public on-chain. Names and statements are visible forever. Connect only a wallet you are comfortable having publicly associated with the case.",
  },
  {
    q: "What are the fees?",
    a: "Beef Court charges no protocol fee. Your wallet still pays GenLayer network fees for transactions. Credits are not refundable for anything other than the case payout.",
  },
];

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
      <div className="wrap">
        <div className="page-head">
          <span className="eyebrow">No fine print games</span>
          <h1>Questions, answered</h1>
          <p>
            If it is not here, it is probably in the <Link href="/how-it-works">process guide</Link> or
            the <Link href="/terms">terms</Link>.
          </p>
        </div>
        <div className="faq-list">
          {FAQS.map((item) => (
            <details className="faq-item" key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        <div className="band" style={{ marginTop: 48 }}>
          <h2>Ready to be judged?</h2>
          <p>Start with 500 testnet credits. Stake only what the ruling can take.</p>
          <Link className="btn" href="/file" style={{ color: "var(--bg)" }}>
            File a case
          </Link>
        </div>
      </div>
    </>
  );
}
