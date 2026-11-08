"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  firstAddress,
  legacyInjected,
  startDiscovery,
  subscribeWallets,
  type DiscoveredWallet,
} from "@/lib/wallet";
import {
  STUDIONET_CHAIN_ID,
  STUDIONET_EXPLORER,
  STUDIONET_RPC,
  WALLETCONNECT_PROJECT_ID,
} from "@/lib/constants";
import { WalletModal } from "@/components/WalletModal";

interface WalletCtx {
  address: string | null;
  provider: EthereumProvider | null;
  walletName: string | null;
  wallets: DiscoveredWallet[];
  chainOk: boolean;
  connecting: boolean;
  connectingName: string | null;
  modalOpen: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  selectWallet: (rdns: string | null) => Promise<void>;
  connectWalletConnect: () => Promise<void>;
  disconnect: () => void;
  switchToStudioNet: () => Promise<void>;
  clearError: () => void;
}

const Ctx = createContext<WalletCtx | null>(null);

export function useWallet() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider.");
  return ctx;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<EthereumProvider | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [chainOk, setChainOk] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectingName, setConnectingName] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startDiscovery();
    const unsub = subscribeWallets(setWallets);
    const t = setTimeout(() => startDiscovery(), 900);
    return () => {
      unsub();
      clearTimeout(t);
    };
  }, []);

  const checkChain = useCallback(async (p: EthereumProvider) => {
    try {
      const id = (await p.request({ method: "eth_chainId" })) as string;
      setChainOk(parseInt(id, 16) === STUDIONET_CHAIN_ID);
    } catch {
      setChainOk(false);
    }
  }, []);

  useEffect(() => {
    let last: string | null = null;
    try {
      last = localStorage.getItem("bc-wallet-rdns");
    } catch {
      last = null;
    }
    if (!last || last === "walletconnect") return;
    const match = wallets.find((w) => w.rdns === last);
    const p = match?.provider ?? (last === "injected" ? legacyInjected() : null);
    if (!p) return;
    void (async () => {
      try {
        const accounts = await p.request({ method: "eth_accounts" });
        const addr = firstAddress(accounts);
        if (addr) {
          setProvider(p);
          setAddress(addr);
          setWalletName(match?.name ?? "Browser wallet");
          await checkChain(p);
        }
      } catch {
        // Silent restore failed; the user can connect manually.
      }
    })();
  }, [wallets, checkChain]);

  useEffect(() => {
    if (!provider) return;
    const onAccounts = (...args: unknown[]) => {
      const addr = firstAddress(args[0]);
      setAddress(addr);
      if (!addr) {
        setProvider(null);
        setWalletName(null);
      }
    };
    const onChain = (...args: unknown[]) => {
      const id = args[0] as string;
      setChainOk(parseInt(id, 16) === STUDIONET_CHAIN_ID);
    };
    provider.on?.("accountsChanged", onAccounts);
    provider.on?.("chainChanged", onChain);
    return () => {
      provider.removeListener?.("accountsChanged", onAccounts);
      provider.removeListener?.("chainChanged", onChain);
    };
  }, [provider]);

  const selectWallet = useCallback(
    async (rdns: string | null) => {
      setError(null);
      setConnecting(true);
      setConnectingName(rdns || "Browser wallet");
      try {
        const match = rdns ? wallets.find((w) => w.rdns === rdns) : null;
        const p = match?.provider ?? legacyInjected();
        if (!p) {
          setError("No browser wallet found. Install MetaMask, Rabby, or OKX to continue.");
          return;
        }
        const accounts = await p.request({ method: "eth_requestAccounts" });
        const addr = firstAddress(accounts);
        if (!addr) throw new Error("The wallet did not return an account.");
        setProvider(p);
        setAddress(addr);
        setWalletName(match?.name ?? "Browser wallet");
        try {
          localStorage.setItem("bc-wallet-rdns", match?.rdns ?? "injected");
        } catch {
          // Ignore storage failures.
        }
        await checkChain(p);
        setModalOpen(false);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Connection failed.";
        setError(/rejected|denied|cancelled|canceled/i.test(msg) ? "Connection rejected in your wallet." : msg);
      } finally {
        setConnecting(false);
        setConnectingName(null);
      }
    },
    [wallets, checkChain],
  );

  const connectWalletConnect = useCallback(async () => {
    setError(null);
    if (!WALLETCONNECT_PROJECT_ID) {
      setError("WalletConnect needs NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in the environment.");
      return;
    }
    setConnecting(true);
    setConnectingName("WalletConnect");
    try {
      const { EthereumProvider: WalletConnectProvider } = await import(
        "@walletconnect/ethereum-provider"
      );
      const wc = await WalletConnectProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        chains: [STUDIONET_CHAIN_ID],
        optionalChains: [STUDIONET_CHAIN_ID],
        showQrModal: true,
        metadata: {
          name: "Beef Court",
          description: "Settle it. For good.",
          url: typeof window !== "undefined" ? window.location.origin : "https://beefcourt.xyz",
          icons: [
            typeof window !== "undefined"
              ? `${window.location.origin}/brand/beefcourt-symbol-light-transparent.png`
              : "https://beefcourt.xyz/brand/beefcourt-symbol-light-transparent.png",
          ],
        },
      });
      const wcProvider = wc as unknown as EthereumProvider;
      const accounts = await wcProvider.request({ method: "eth_requestAccounts" });
      const addr = firstAddress(accounts);
      if (!addr) throw new Error("WalletConnect did not return an account.");
      setProvider(wcProvider);
      setAddress(addr);
      setWalletName("WalletConnect");
      try {
        localStorage.setItem("bc-wallet-rdns", "walletconnect");
      } catch {
        // Ignore storage failures.
      }
      await checkChain(wcProvider);
      setModalOpen(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "WalletConnect failed.";
      setError(/rejected|denied|cancelled|canceled/i.test(msg) ? "Connection rejected." : msg);
    } finally {
      setConnecting(false);
      setConnectingName(null);
    }
  }, [checkChain]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setWalletName(null);
    setChainOk(true);
    try {
      localStorage.removeItem("bc-wallet-rdns");
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const switchToStudioNet = useCallback(async () => {
    const p = provider ?? legacyInjected();
    if (!p) {
      setError("Connect a wallet first.");
      return;
    }
    const hexId = `0x${STUDIONET_CHAIN_ID.toString(16)}`;
    try {
      await p.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexId }],
      });
      await checkChain(p);
    } catch (e: unknown) {
      const code = (e as { code?: number })?.code;
      if (code === 4902 || code === -32603) {
        try {
          await p.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: hexId,
                chainName: "GenLayer StudioNet",
                rpcUrls: [STUDIONET_RPC],
                nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
                blockExplorerUrls: [STUDIONET_EXPLORER],
              },
            ],
          });
          await checkChain(p);
        } catch {
          setError("Could not add StudioNet to your wallet.");
        }
      } else {
        setError("Please switch to StudioNet in your wallet.");
      }
    }
  }, [provider, checkChain]);

  const value = useMemo(
    () => ({
      address,
      provider,
      walletName,
      wallets,
      chainOk,
      connecting,
      connectingName,
      modalOpen,
      error,
      openModal: () => {
        setError(null);
        setModalOpen(true);
      },
      closeModal: () => setModalOpen(false),
      selectWallet,
      connectWalletConnect,
      disconnect,
      switchToStudioNet,
      clearError: () => setError(null),
    }),
    [
      address,
      provider,
      walletName,
      wallets,
      chainOk,
      connecting,
      connectingName,
      modalOpen,
      error,
      selectWallet,
      connectWalletConnect,
      disconnect,
      switchToStudioNet,
    ],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <WalletModal />
    </Ctx.Provider>
  );
}
