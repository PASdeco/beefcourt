import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import type { Hash } from "genlayer-js/types";
import {
  CONTRACT_ADDRESS,
  STUDIONET_EXPLORER,
  STUDIONET_RPC,
} from "./constants";
import type { TxStage } from "./types";

export class CourtOfflineError extends Error {
  constructor(message = "The court is being rebuilt. Try again shortly.") {
    super(message);
    this.name = "CourtOfflineError";
  }
}

export function isCourtConfigured(): boolean {
  return Boolean(CONTRACT_ADDRESS);
}

function readOnlyClient() {
  return createClient({ chain: studionet, endpoint: STUDIONET_RPC });
}

function writeClient(provider: EthereumProvider, address: string) {
  return createClient({
    chain: studionet,
    endpoint: STUDIONET_RPC,
    account: address as `0x${string}`,
    provider,
  });
}

export interface ReadResult<T> {
  data: T;
  error: null;
}

function contractAddress(): `0x${string}` {
  if (!CONTRACT_ADDRESS) throw new CourtOfflineError();
  return CONTRACT_ADDRESS as `0x${string}`;
}

export async function readContract<T>(functionName: string, args: unknown[] = []): Promise<T> {
  const address = contractAddress();
  const client = readOnlyClient();
  try {
    const result = await client.readContract({
      address,
      functionName,
      args,
    } as never);
    return result as unknown as T;
  } catch (error) {
    throw new Error(friendlyError(error));
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function friendlyError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  if (/user rejected|user denied|rejected|denied|cancelled|canceled/i.test(raw)) {
    return "Signature rejected in your wallet.";
  }
  if (/insufficient funds|insufficient balance/i.test(raw)) {
    return "Your wallet does not have enough GEN for network fees.";
  }
  const expected = raw.match(/\[EXPECTED\]([^"\n]*)/);
  if (expected) return expected[1].trim();
  const llm = raw.match(/\[LLM_ERROR\]([^"\n]*)/);
  if (llm) return `The bench could not reach a ruling: ${llm[1].trim()}`;
  if (/missing|not found|no contract|invalid address/i.test(raw) && /contract/i.test(raw)) {
    return "The court is being rebuilt. Try again shortly.";
  }
  return raw.replace(/^Error:\s*/i, "").slice(0, 300) || "Something went wrong. Try again.";
}

function stageFromStatus(status: string): TxStage {
  const s = status.toUpperCase();
  if (s.includes("FINALIZED")) return "finalized";
  if (s.includes("ACCEPTED")) return "verifying";
  if (s.includes("REVEAL")) return "revealing";
  if (s.includes("COMMIT")) return "committing";
  if (s.includes("PROPOS")) return "proposing";
  if (s.includes("PENDING") || s.includes("READY")) return "pending";
  return "pending";
}

function failedStatus(status: string): boolean {
  const s = status.toUpperCase();
  return (
    s.includes("UNDETERMINED") ||
    s.includes("CANCELED") ||
    s.includes("CANCELLED") ||
    s.includes("TIMEOUT")
  );
}

interface ExecutionOutcome {
  state: "pending" | "success" | "error";
  reason?: string;
  label?: string;
}

function readExecution(tx: Record<string, unknown>): ExecutionOutcome {
  const rawReceipts = (tx.consensus_data as Record<string, unknown> | undefined)?.leader_receipt;
  const receipts = Array.isArray(rawReceipts) ? rawReceipts : rawReceipts ? [rawReceipts] : [];
  const leader =
    (receipts.find(
      (item) => item && typeof item === "object" && (item as Record<string, unknown>).mode === "leader",
    ) as Record<string, unknown> | undefined) ?? (receipts[0] as Record<string, unknown> | undefined);

  let raw = leader?.execution_result as string | undefined;
  if (!raw) raw = (tx.txExecutionResultName as string | undefined) ?? (tx.executionResultName as string | undefined);
  if (!raw && typeof tx.txExecutionResult === "number") {
    if (tx.txExecutionResult === 1) raw = "FINISHED_WITH_RETURN";
    else if (tx.txExecutionResult === 2) raw = "FINISHED_WITH_ERROR";
    else if (tx.txExecutionResult > 2) raw = "TIMEOUT";
  }

  const value = String(raw ?? "").toUpperCase();
  if (!value || value === "NOT_VOTED" || value === "IDLE" || value === "PENDING") {
    return { state: "pending" };
  }
  if (value.includes("SUCCESS") || value.includes("FINISHED_WITH_RETURN")) {
    return { state: "success", label: value };
  }
  if (
    value.includes("ERROR") ||
    value.includes("TIMEOUT") ||
    value.includes("DISAGREE") ||
    value.includes("VIOLATION") ||
    value.includes("ROLLBACK")
  ) {
    const result = leader?.result as Record<string, unknown> | undefined;
    const genvm = leader?.genvm_result as Record<string, unknown> | undefined;
    const payload = result?.payload;
    const description = genvm?.error_description;
    const rawError = genvm?.raw_error;
    let detail = "";
    if (typeof payload === "string" && payload.trim()) detail = payload.trim();
    else if (typeof description === "string" && description.trim()) detail = description.trim();
    else if (typeof rawError === "string" && rawError.trim()) detail = rawError.trim();
    else if (rawError && typeof rawError === "object" && "causes" in rawError) {
      detail = String((rawError as { causes?: unknown }).causes ?? "");
    }
    return {
      state: "error",
      reason: detail || "The contract rejected this transaction.",
      label: value,
    };
  }
  return { state: "pending" };
}

export interface TxExecutionError extends Error {
  txHash?: string;
}

export function txHashFromError(error: unknown): string | null {
  if (error && typeof error === "object" && "txHash" in error) {
    const value = (error as { txHash?: unknown }).txHash;
    return typeof value === "string" ? value : null;
  }
  return null;
}

function courtError(message: string, txHash: string): TxExecutionError {
  const error = new Error(message) as TxExecutionError;
  error.txHash = txHash;
  return error;
}

export interface WriteReceipt {
  hash: string;
  execution: string;
}

export async function submitWrite(
  provider: EthereumProvider,
  from: string,
  functionName: string,
  args: unknown[] = [],
  onStage?: (stage: TxStage, detail?: string) => void,
): Promise<WriteReceipt> {
  contractAddress();
  const client = writeClient(provider, from);
  onStage?.("signing");

  let txHash: string;
  try {
    txHash = (await client.writeContract({
      address: contractAddress(),
      functionName,
      args,
    } as never)) as unknown as string;
  } catch (error) {
    throw new Error(friendlyError(error));
  }

  onStage?.("submitted", txHash);
  const reader = readOnlyClient();
  let lastStatus = "";

  for (let i = 0; i < 100; i++) {
    await sleep(3000);
    let tx: Record<string, unknown>;
    try {
      tx = (await reader.getTransaction({ hash: txHash as unknown as Hash })) as unknown as Record<
        string,
        unknown
      >;
    } catch {
      // The node may not serve the transaction immediately; keep polling.
      continue;
    }

    const name = String(tx.statusName || tx.status || "");
    if (name && name !== lastStatus) {
      lastStatus = name;
      onStage?.(stageFromStatus(name), name);
    }
    if (failedStatus(name)) {
      throw courtError(
        name.includes("UNDETERMINED")
          ? "The validators could not agree on this ruling. Nothing was changed — try again."
          : `The transaction ended as ${name}. Nothing was changed.`,
        txHash,
      );
    }

    const outcome = readExecution(tx);
    if (outcome.state === "error") {
      throw courtError(friendlyError(outcome.reason), txHash);
    }
    if (outcome.state === "success" && (name === "ACCEPTED" || name === "FINALIZED")) {
      onStage?.(name === "FINALIZED" ? "finalized" : "accepted");
      return { hash: txHash, execution: outcome.label || "FINISHED_WITH_RETURN" };
    }
    if (outcome.state === "pending" && (name === "ACCEPTED" || name === "FINALIZED")) {
      onStage?.("verifying");
    }
  }

  throw courtError(
    "Still processing after five minutes. Check the explorer link, then refresh this page.",
    txHash,
  );
}

export function explorerTx(hash: string): string {
  return `${STUDIONET_EXPLORER}/tx/${hash}`;
}

export function explorerAddress(address: string): string {
  return `${STUDIONET_EXPLORER}/address/${address}`;
}

export { TransactionStatus };
