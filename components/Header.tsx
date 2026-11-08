"use client";

import Link from "next/link";
import { ThemeLogo } from "@/components/ThemeLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NetworkPill } from "@/components/NetworkPill";
import { WalletButton } from "@/components/WalletButton";

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link className="logo" href="/" aria-label="Beef Court home">
          <ThemeLogo variant="full" className="nav-logo" priority />
          <ThemeLogo variant="symbol" className="nav-logo-mobile" priority />
        </Link>
        <nav className="links" aria-label="Main navigation">
          <Link href="/#how">How it works</Link>
          <Link href="/verdicts">Verdicts</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/how-it-works">The bench</Link>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <NetworkPill />
          <WalletButton />
          <Link className="btn nav-file" href="/file">
            File a case
          </Link>
        </div>
      </div>
    </header>
  );
}
