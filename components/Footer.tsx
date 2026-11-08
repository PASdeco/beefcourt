import Link from "next/link";
import { ThemeLogo } from "@/components/ThemeLogo";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { shortAddress } from "@/lib/format";

export function Footer() {
  return (
    <footer className="site-footer" id="footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <ThemeLogo variant="full" className="footer-logo" />
          <p>
            Beef Court is a testnet prototype. AI rulings are for fun and low-stakes disputes. They are not
            legal advice, and GEN credits are not real money.
          </p>
          <span className="footer-contract">
            {CONTRACT_ADDRESS ? `Contract ${shortAddress(CONTRACT_ADDRESS)}` : "Contract not deployed yet"}
          </span>
        </div>
        <div className="footer-cols">
          <div>
            <b>Court</b>
            <Link href="/file">File a case</Link>
            <Link href="/verdicts">Verdicts</Link>
            <Link href="/leaderboard">Leaderboard</Link>
            <Link href="/me">My cases</Link>
          </div>
          <div>
            <b>Learn</b>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
          <div>
            <b>Built on</b>
            <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer">
              GenLayer
            </a>
            <a href="https://docs.genlayer.com" target="_blank" rel="noopener noreferrer">
              Docs
            </a>
            <a href="https://studio.genlayer.com" target="_blank" rel="noopener noreferrer">
              StudioNet
            </a>
          </div>
        </div>
      </div>
      <div className="wrap footer-legal">
        <span>© {new Date().getFullYear()} Beef Court. Settle it. For good.</span>
        <span>No humans deciding. No favourites. No more dishes drama.</span>
      </div>
    </footer>
  );
}
