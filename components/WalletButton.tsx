"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { shortAddress } from "@/lib/format";

export function WalletButton() {
  const { address, walletName, openModal, disconnect, chainOk } = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be unavailable.
    }
  };

  if (!address) {
    return (
      <button className="btn ghost wallet-btn" onClick={openModal} data-wallet-connect>
        Connect wallet
      </button>
    );
  }

  return (
    <div className="wallet-menu" ref={menuRef}>
      <button
        className="btn wallet-btn connected"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className={`wallet-dot ${chainOk ? "" : "bad"}`} aria-hidden="true" />
        {shortAddress(address)}
      </button>
      {open && (
        <div className="wallet-pop" role="menu">
          <div className="wallet-pop-head">
            <span>Signed in</span>
            <b>{walletName ?? "Browser wallet"}</b>
            <small>{address}</small>
          </div>
          <button onClick={copy} role="menuitem">
            {copied ? "Address copied" : "Copy address"}
          </button>
          <Link href="/me" role="menuitem" onClick={() => setOpen(false)}>
            My cases &amp; credits
          </Link>
          <button
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
            role="menuitem"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
