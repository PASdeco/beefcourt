"use client";

import { useWallet } from "@/components/WalletProvider";

export function NetworkPill() {
  const { address, chainOk, switchToStudioNet, connecting } = useWallet();
  if (!address) return null;
  return (
    <button
      className={`net ${chainOk ? "" : "bad"}`}
      onClick={() => (chainOk ? undefined : void switchToStudioNet())}
      title={chainOk ? "Connected to GenLayer StudioNet" : "Wrong network. Click to switch to StudioNet."}
      type="button"
      disabled={connecting}
    >
      <i aria-hidden="true" />
      {chainOk ? "Studionet" : "Switch network"}
    </button>
  );
}
