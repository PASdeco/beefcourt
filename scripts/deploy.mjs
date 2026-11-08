/**
 * Deploys BeefCourt to the configured GenLayer network.
 * Run: npm run deploy
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createAccount, createClient } from "genlayer-js";
import { localnet, studionet, testnetAsimov, testnetBradbury } from "genlayer-js/chains";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = join(ROOT, ".env");
const ENV_LOCAL_PATH = join(ROOT, ".env.local");
if (!existsSync(ENV_PATH)) {
  throw new Error("Missing .env. Copy .env.example and add BACKEND_PRIVATE_KEY.");
}
process.loadEnvFile(ENV_PATH);

const chainMap = { localnet, studionet, testnetAsimov, testnetBradbury };
const chainName = process.env.GENLAYER_NETWORK || "studionet";
const chain = chainMap[chainName] ?? studionet;
const endpoint = process.env.GENLAYER_RPC || undefined;
const account = createAccount(process.env.BACKEND_PRIVATE_KEY || "");
const client = createClient({ chain, account, endpoint });

function updateEnv(path, values) {
  let text = existsSync(path) ? readFileSync(path, "utf8") : "";
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^${key}=.*$`, "m");
    text = pattern.test(text) ? text.replace(pattern, line) : `${text.trimEnd()}\n${line}\n`;
  }
  writeFileSync(path, text, "utf8");
}

console.log(`network:  ${chainName}`);
console.log(`deployer: ${account.address}`);
console.log(`endpoint: ${endpoint || chain.rpcUrls?.default?.http?.[0] || "chain default"}`);

const code = readFileSync(join(ROOT, "contracts", "beef_court.py"), "utf8");
console.log(`\nDeploying BeefCourt (${code.length} bytes)…`);

const txHash = await client.deployContract({ code });
console.log(`tx: ${txHash}`);

const result = await client.waitForTransactionReceipt({
  hash: txHash,
  status: "ACCEPTED",
  interval: 3_000,
  retries: 100,
  fullTransaction: true,
});

const address =
  result?.contract_address ??
  result?.contractAddress ??
  result?.data?.contract_address ??
  result?.data?.contractAddress ??
  result?.address;

if (!address) {
  console.error("Deploy result:", JSON.stringify(result, null, 2).slice(0, 2000));
  throw new Error("The deploy transaction produced no contract address.");
}

console.log(`\nBeefCourt: ${address}`);
console.log(`status:    ${result?.statusName ?? result?.status ?? "ACCEPTED"}`);

updateEnv(ENV_PATH, { BEEFCOURT_CONTRACT_ADDRESS: address, NEXT_PUBLIC_CONTRACT_ADDRESS: address });
updateEnv(ENV_LOCAL_PATH, { NEXT_PUBLIC_CONTRACT_ADDRESS: address });
console.log("\nWrote the address to .env and .env.local.");
console.log("Restart the dev server or redeploy the frontend for NEXT_PUBLIC_CONTRACT_ADDRESS to apply.");
