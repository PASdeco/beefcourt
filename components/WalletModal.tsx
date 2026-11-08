"use client";

import { useEffect, useRef } from "react";
import { useWallet } from "@/components/WalletProvider";
import { ThemeLogo } from "@/components/ThemeLogo";
import { startDiscovery } from "@/lib/wallet";

export function WalletModal() {
  const {
    modalOpen,
    closeModal,
    wallets,
    connecting,
    connectingName,
    error,
    selectWallet,
    connectWalletConnect,
    clearError,
  } = useWallet();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!modalOpen) return;
    startDiscovery();
    const t = setTimeout(() => closeRef.current?.focus(), 30);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [modalOpen, closeModal]);

  if (!modalOpen) return null;

  const injected = wallets.length === 0;

  return (
    <div className="modal on" role="presentation" onClick={closeModal}>
      <div
        className="sheet wallet-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="wallet-sheet-head">
          <ThemeLogo variant="symbol" className="wallet-logo" />
          <button ref={closeRef} className="icon close-btn" onClick={closeModal} aria-label="Close wallet dialog">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <h3 id="wallet-title">Connect a wallet</h3>
        <p>Connect to file cases, answer, and collect your credits on GenLayer StudioNet.</p>

        <div className="wallet-list">
          {wallets.map((wallet) => (
            <button
              key={wallet.rdns || wallet.uuid}
              className="wopt"
              disabled={connecting}
              onClick={() => void selectWallet(wallet.rdns)}
            >
              <span className="wopt-icon">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={wallet.icon} alt="" width={26} height={26} />
              </span>
              <span>
                <b>{wallet.name}</b>
                <small>Browser extension</small>
              </span>
            </button>
          ))}

          {injected && (
            <>
              <button className="wopt" disabled={connecting} onClick={() => void selectWallet(null)}>
                <span className="wopt-letter">B</span>
                <span>
                  <b>Browser wallet</b>
                  <small>Use the wallet already installed in this browser</small>
                </span>
              </button>
              <div className="wopt-row">
                <button className="wopt" disabled={connecting} onClick={() => void selectWallet(null)}>
                  <span className="wopt-letter">M</span>
                  <span>
                    <b>MetaMask</b>
                    <small>Extension or mobile</small>
                  </span>
                </button>
                <button className="wopt" disabled={connecting} onClick={() => void selectWallet(null)}>
                  <span className="wopt-letter">R</span>
                  <span>
                    <b>Rabby</b>
                    <small>Extension</small>
                  </span>
                </button>
              </div>
            </>
          )}

          <button className="wopt" disabled={connecting} onClick={() => void connectWalletConnect()}>
            <span className="wopt-letter">W</span>
            <span>
              <b>WalletConnect</b>
              <small>Scan with any mobile wallet</small>
            </span>
          </button>
        </div>

        {connecting && (
          <p className="wallet-status" aria-live="polite">
            Confirm in {connectingName ?? "your wallet"}…
          </p>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
            <button className="link-btn" onClick={clearError} type="button">
              Dismiss
            </button>
          </p>
        )}
        <p className="wallet-fineprint">
          StudioNet · chain 61999. Beef Court uses testnet GEN credits, not real funds. We never see your
          private keys.
        </p>
      </div>
    </div>
  );
}
