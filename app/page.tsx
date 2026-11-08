import Link from "next/link";
import type { Metadata } from "next";
import { HeroDocket } from "@/components/HeroDocket";
import { RecentVerdicts } from "@/components/RecentVerdicts";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const JUDGES = [
  { initial: "A", name: "Judge Ada", line: "Reads for facts and dates" },
  { initial: "K", name: "Judge Kofi", line: "Weighs fairness to both sides" },
  { initial: "M", name: "Judge Mei", line: "Rewards effort and follow-through" },
  { initial: "R", name: "Judge Ravi", line: "Spots exaggeration" },
  { initial: "S", name: "Judge Sol", line: "Favours the peacemaker" },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Beef Court",
          applicationCategory: "SocialApplication",
          operatingSystem: "Web",
          description:
            "File a dispute, let independent AI validators rule, and settle the stake on GenLayer.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />

      <div className="wrap">
        <header className="hero" id="top">
          <div>
            <h1>
              Settle it. <em>For good.</em>
            </h1>
            <p className="lede">
              You tell your side. They tell theirs. A bench of independent AI validators reads both,
              reaches consensus on-chain, and splits the stake automatically. No favourites, no mods,
              no more dishes drama.
            </p>
            <div className="cta">
              <a className="btn brass" href="#docket">
                Try a live case
              </a>
              <Link className="btn ghost" href="/how-it-works">
                See how it works
              </Link>
            </div>
            <div className="facts">
              <div>
                <b>5</b>
                independent judges
              </div>
              <div>
                <b>11</b>
                on appeal
              </div>
              <div>
                <b>0</b>
                humans deciding
              </div>
            </div>
          </div>
          <HeroDocket />
        </header>
      </div>

      <section id="how">
        <div className="wrap">
          <h2 className="t">From beef to verdict, on-chain</h2>
          <p className="sub">
            Every ruling is recorded on GenLayer, so nobody can quietly rewrite what was decided.
          </p>
          <div className="steps">
            <div className="step">
              <div className="n">1</div>
              <h3>File the case</h3>
              <p>
                Describe the problem in your own words and lock in a stake from 10 to 200 testnet
                credits. Send the link to the other side so they can answer.
              </p>
            </div>
            <div className="step">
              <div className="n">2</div>
              <h3>The bench deliberates</h3>
              <p>
                Independent validators read both statements under their own models and must agree
                on the winner and the split before anything is recorded.
              </p>
            </div>
            <div className="step">
              <div className="n">3</div>
              <h3>Credits move</h3>
              <p>
                The pot is paid out in line with the ruling. Unhappy? The losing side may appeal
                once to a larger panel before the window closes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="cases">
        <div className="wrap">
          <h2 className="t">Recent verdicts</h2>
          <p className="sub">Real beef, settled on-chain. The bar shows how the pot was split.</p>
          <RecentVerdicts />
          <div className="cta" style={{ marginTop: 28 }}>
            <Link className="btn ghost" href="/verdicts">
              Read the full docket
            </Link>
          </div>
        </div>
      </section>

      <section id="bench">
        <div className="wrap two">
          <div>
            <span className="eyebrow">Consensus, not a coin flip</span>
            <h2 className="t">A bench you can’t shop around</h2>
            <p>
              Each judge is a separate GenLayer validator running its own AI model with its own way
              of weighing a case. They do not have to use the same words, only reach the same
              meaning. To win unfairly you would have to fool all of them at once — and the contract
              checks their answers before it pays anyone.
            </p>
            <p>
              Statements are treated as untrusted evidence. Instructions hidden inside a story are
              not orders the bench will follow.
            </p>
            <Link className="btn ghost" href="/how-it-works" style={{ marginTop: 8 }}>
              The full process
            </Link>
          </div>
          <div className="bch">
            {JUDGES.map((judge) => (
              <div className="bi" key={judge.initial}>
                <span className="j">{judge.initial}</span>
                <div>
                  <b>{judge.name}</b>
                  <span>{judge.line}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap" style={{ paddingBottom: 20 }}>
        <div className="band">
          <h2>Got beef? Bring it.</h2>
          <p>Free to start with 500 testnet credits. Stake only when you’re ready to be ruled against.</p>
          <Link className="btn" href="/file" style={{ color: "var(--bg)" }}>
            File a case
          </Link>
        </div>
      </div>
    </>
  );
}
