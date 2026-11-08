/**
 * Seeds a few open invite cases so the docket is not empty.
 * Run after deploy: npm run seed
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = join(ROOT, ".env");
if (!existsSync(ENV_PATH)) throw new Error("Missing .env. Run npm run deploy first.");
process.loadEnvFile(ENV_PATH);

const address = process.env.BEEFCOURT_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
if (!address) throw new Error("Missing BEEFCOURT_CONTRACT_ADDRESS. Run npm run deploy first.");

const account = createAccount(process.env.BACKEND_PRIVATE_KEY || "");
const client = createClient({
  chain: studionet,
  account,
  endpoint: process.env.GENLAYER_RPC || undefined,
});

const ZERO = "0x0000000000000000000000000000000000000000";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function wait(hash, label) {
  const result = await client.waitForTransactionReceipt({
    hash,
    status: "ACCEPTED",
    interval: 3_000,
    retries: 100,
    fullTransaction: true,
  });
  const execution = result?.txExecutionResultName ?? result?.executionResultName ?? "";
  if (execution === "FINISHED_WITH_ERROR") {
    throw new Error(`${label} failed: ${result?.revert_reason ?? result?.revertReason ?? "execution error"}`);
  }
  console.log(`  ${label}: ${hash}`);
  return result;
}

const cases = [
  {
    title: "The dishes standoff",
    category: "roommates",
    name: "Tunde",
    statement:
      "The dishes sat in the sink for four days. I washed them twice last week and nobody said thank you. I am not the house maid. I want us to agree a fair chore rota.",
    stake: 50,
  },
  {
    title: "The unpaid Netflix share",
    category: "friends",
    name: "Bisi",
    statement:
      "We agreed to split the Netflix family plan three ways. I have paid the full bill for two months and the other two keep saying they will send their share. I want the missing share back.",
    stake: 30,
  },
  {
    title: "Music past midnight",
    category: "group",
    name: "Ife",
    statement:
      "The neighbour played music past midnight on a Tuesday after I asked twice for it to stop. I have an early shift and could not sleep. I want an apology and a promise to keep it down.",
    stake: 20,
  },
];

console.log(`contract: ${address}`);
console.log(`deployer: ${account.address}`);

let stats = await client.readContract({
  address,
  functionName: "get_user_stats",
  args: [account.address],
});
if (!stats.claimed) {
  console.log("\nClaiming starter credits…");
  const hash = await client.writeContract({
    address,
    functionName: "claim_starter_credits",
    args: [],
  });
  await wait(hash, "claim_starter_credits");
  stats = await client.readContract({
    address,
    functionName: "get_user_stats",
    args: [account.address],
  });
}
console.log(`credits:  ${stats.balance}`);

const existing = await client.readContract({
  address,
  functionName: "get_cases",
  args: [0, 50],
});
const titles = new Set((existing.cases ?? []).map((item) => item.title));

for (const item of cases) {
  if (titles.has(item.title)) {
    console.log(`\nSkipping "${item.title}" (already on the docket).`);
    continue;
  }
  console.log(`\nFiling "${item.title}"…`);
  const hash = await client.writeContract({
    address,
    functionName: "create_case",
    args: [item.title, item.category, item.name, item.statement, ZERO, item.stake],
  });
  await wait(hash, "create_case");
  await sleep(1_500);
}

const final = await client.readContract({ address, functionName: "get_cases", args: [0, 50] });
console.log(`\nDocket now has ${final.total} case(s).`);
