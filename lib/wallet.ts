"use client";

export interface DiscoveredWallet {
  rdns: string;
  name: string;
  icon: string;
  uuid: string;
  provider: EthereumProvider;
}

type Listener = (wallets: DiscoveredWallet[]) => void;

const found = new Map<string, DiscoveredWallet>();
const listeners = new Set<Listener>();
let listening = false;

function emit() {
  const list = [...found.values()];
  listeners.forEach((fn) => fn(list));
}

function onAnnounce(event: Event) {
  const detail = (event as EIP6963AnnounceEvent).detail;
  if (!detail?.info || !detail?.provider) return;
  const key = detail.info.rdns || detail.info.uuid;
  if (!found.has(key)) {
    found.set(key, {
      rdns: detail.info.rdns,
      name: detail.info.name,
      icon: detail.info.icon,
      uuid: detail.info.uuid,
      provider: detail.provider,
    });
    emit();
  }
}

export function startDiscovery(): void {
  if (typeof window === "undefined") return;
  if (!listening) {
    listening = true;
    window.addEventListener("eip6963:announceProvider", onAnnounce);
  }
  window.dispatchEvent(new Event("eip6963:requestProvider"));
}

export function subscribeWallets(fn: Listener): () => void {
  listeners.add(fn);
  fn([...found.values()]);
  return () => {
    listeners.delete(fn);
  };
}

export function legacyInjected(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return window.ethereum ?? null;
}

export function firstAddress(value: unknown): string | null {
  if (!Array.isArray(value) || typeof value[0] !== "string") return null;
  return value[0];
}
