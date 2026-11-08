import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How Beef Court files a case, runs an independent AI bench on GenLayer, splits the stake, and handles appeals.",
  alternates: { canonical: "/how-it-works" },
};

const FAQS = [
  {
    q: "Is any of this real money?",
    a: "No. Beef Court runs on GenLayer StudioNet with testnet credits. The contract keeps an internal ledger of credits; they cannot be bought, sold, transferred, or withdrawn. Treat every number as a prototype.",
  },
  {
    q: "Who actually decides my case?",
    a: "Independent GenLayer validators running AI models. The contract uses a custom validator: validators must independently reach the same winner and a plaintiff share within 15 points (8 on appeal). The five-judge bench is the product metaphor for those judging lenses; the UI never invents per-judge vote counts.",
  },
  {
    q: "What stops someone from prompting the judge?",
    a: "Statements are labelled untrusted and wrapped as evidence. The prompt tells the model to ignore instructions inside them. Consensus adds a second layer: a single manipulated model cannot carry the ruling unless other validators independently agree.",
  },
  {
    q: "Can the AI fail or disagree?",
    a: "Yes. If validators cannot agree, the transaction does not settle the case — nothing is changed and a party can try again. If a verdict comes back malformed, the contract falls back to an even 50/50 split and marks it as a fallback.",
  },
  {
    q: "What happens if the other side never answers?",
    a: "The defendant has 3 days to answer. After the deadline, the plaintiff can call claim_default. The contract records a default judgment for the plaintiff, releases the pot, and closes the case as EXPIRED.",
  },
  {
    q: "How does an open invite work?",
    a: "If you file without naming a defendant, the seat is open. The first wallet that is not the plaintiff to file a defense claims the seat. Send the link only to the person you are actually in a beef with.",
  },
  {
    q: "How does the appeal work?",
    a: "The losing side may appeal once within 24 hours of the ruling. A fresh, stricter bench re-reads the same record; validators must agree within 8 points. The appeal ruling is final and pays out immediately. If nobody appeals, anyone can finalize after the window and release the pot.",
  },
  {
    q: "What does the bench see?",
    a: "The title, category, both names, both statements, and the stake. Your wallet address and case are public on-chain. Do not include addresses, phone numbers, or anything you would not want permanently public.",
  },
];

export default function HowItWorksPage() {
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
          <span className="eyebrow">The process</span>
          <h1>How the court works</h1>
          <p>
            No moderators, no group-chat votes, no quiet edits. A case goes on the record, independent
            validators rule, and the contract pays out what the ruling says.
          </p>
        </div>

        <div className="steps four" style={{ marginBottom: 64 }}>
          <div className="step">
            <div className="n">1</div>
            <h3>File the complaint</h3>
            <p>
              Connect a wallet, claim 500 starter testnet credits, and write your side. Choose a stake
              from 10 to 200 credits and either name the other wallet or leave an invite seat open.
              Filing deducts your stake immediately.
            </p>
          </div>
          <div className="step">
            <div className="n">2</div>
            <h3>The other side answers</h3>
            <p>
              The named defendant — or the first non-plaintiff to claim an open seat — files their
              version and matches the stake. Until then the case is <b>OPEN</b>. After three days the
              plaintiff may claim by default.
            </p>
          </div>
          <div className="step">
            <div className="n">3</div>
            <h3>The bench deliberates</h3>
            <p>
              Once both sides are in, either party calls the bench. Validators independently read the
              record and must agree on a winner and a split. The resulting verdict, reasoning, and
              scores are stored on-chain.
            </p>
          </div>
          <div className="step">
            <div className="n">4</div>
            <h3>Appeal or finalize</h3>
            <p>
              The losing side has 24 hours to appeal once. A stricter panel re-reads the same record,
              and its ruling is final. If nobody appeals, anyone may finalize after the window and
              release the pot.
            </p>
          </div>
        </div>

        <section style={{ paddingTop: 0 }}>
          <div className="two">
            <div>
              <h2 className="t">What the contract checks</h2>
              <p>
                A ruling is not a sentence from one model. Each validator re-runs the judgment and
                compares its answer to the leader&apos;s. The winner must match exactly; the plaintiff
                share must fall within tolerance. The contract then normalizes the result: a plaintiff
                win can never pay the plaintiff less than 51%, a defendant win can never pay them more
                than 49%, and a split is always 50/50.
              </p>
              <p>
                Scores for facts, fairness, and effort are recorded for transparency. They do not
                override the winner. If the output is unusable, the fallback is an even split marked
                as such — never a silent payout to one side.
              </p>
            </div>
            <div className="bch">
              <div className="bi">
                <span className="j">1</span>
                <div>
                  <b>Leader proposes</b>
                  <span>One validator runs the judge prompt and returns JSON.</span>
                </div>
              </div>
              <div className="bi">
                <span className="j">2</span>
                <div>
                  <b>Validators verify</b>
                  <span>Each re-runs the judge and compares winner and share.</span>
                </div>
              </div>
              <div className="bi">
                <span className="j">3</span>
                <div>
                  <b>Contract normalizes</b>
                  <span>Clamps the share and stores the verdict on-chain.</span>
                </div>
              </div>
              <div className="bi">
                <span className="j">4</span>
                <div>
                  <b>Pot settles</b>
                  <span>Credits move to both sides according to the ruling.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="t">Case states, plainly</h2>
          <p className="sub">Every case moves through the same public states.</p>
          <div className="stat-grid five">
            <div className="stat-box">
              <span>OPEN</span>
              <b style={{ fontSize: 20 }}>Awaiting answer</b>
              <small>3-day defense window</small>
            </div>
            <div className="stat-box">
              <span>DEFENDED</span>
              <b style={{ fontSize: 20 }}>Ready to rule</b>
              <small>A party calls the bench</small>
            </div>
            <div className="stat-box">
              <span>RULED</span>
              <b style={{ fontSize: 20 }}>Verdict recorded</b>
              <small>24-hour appeal window</small>
            </div>
            <div className="stat-box">
              <span>FINAL</span>
              <b style={{ fontSize: 20 }}>Paid out</b>
              <small>No further appeals</small>
            </div>
            <div className="stat-box">
              <span>EXPIRED</span>
              <b style={{ fontSize: 20 }}>Default</b>
              <small>Defendant never answered</small>
            </div>
          </div>
        </section>

        <section>
          <h2 className="t">Questions people actually ask</h2>
          <div className="faq-list">
            {FAQS.map((item) => (
              <details className="faq-item" key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="band" style={{ marginBottom: 40 }}>
          <h2>Still got beef?</h2>
          <p>Filing is free. The stake is the only thing at risk, and it is testnet only.</p>
          <Link className="btn" href="/file" style={{ color: "var(--bg)" }}>
            File a case
          </Link>
        </div>
      </div>
    </>
  );
}
