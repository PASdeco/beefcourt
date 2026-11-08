"use client";

import { useWallet } from "@/components/WalletProvider";
import { STUDIONET_CHAIN_ID } from "@/lib/constants";

export function NetworkBanner() {
  const { address, chainOk, switchToStudioNet } = useWallet();
  if (!address || chainOk) return null;
  return (
    <div className="network-banner" role="status">
      <div className="wrap network-banner-inner">
        <span>
          Your wallet is on the wrong network. Beef Court runs on GenLayer StudioNet (chain{" "}
          {STUDIONET_CHAIN_ID}).
        </span>
        <button className="btn brass small" onClick={() => void switchToStudioNet()}>
          Switch to StudioNet
        </button>
      </div>
    </div>
  );
}
