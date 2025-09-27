// scripts/deploy-web3.js
// Compile with Hardhat, then deploy using web3.js to a geth node (unlocked accounts)

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Web3 } = require("web3");

function upsertEnvVar(envPath, key, value) {
  const line = `${key}=${value}`;
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `${line}\n`);
    return;
  }
  const content = fs.readFileSync(envPath, "utf8");
  const regex = new RegExp(`^${key}=.*$`, "m");
  if (regex.test(content)) {
    const updated = content.replace(regex, line);
    fs.writeFileSync(envPath, updated);
  } else {
    fs.appendFileSync(envPath, `\n${line}\n`);
  }
}

function resolveRpcFromArgOrEnv() {
  const arg = (process.argv[2] || "").toLowerCase();
  if (process.env.RPC_URL) return process.env.RPC_URL;
  if (arg === "node1") return "http://127.0.0.1:8501";
  if (arg === "node2") return "http://127.0.0.1:8502";
  if (arg === "node3") return "http://127.0.0.1:8503";
  return "http://127.0.0.1:8501"; // default
}

function loadArtifact() {
  // Artifact path based on your file and contract name
  const artifactPath = path.resolve(
    process.cwd(),
    "artifacts",
    "contracts",
    "ActionMnager.sol",
    "GenericLoggerPeerApproved.json"
  );
  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `Artifact not found at ${artifactPath}. Did you run \"npm run compile\"?`
    );
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;
  let bytecode = artifact.bytecode;
  if (!bytecode && artifact.evm && artifact.evm.bytecode) {
    bytecode = artifact.evm.bytecode.object;
  }
  if (!abi || !bytecode) {
    throw new Error("Artifact missing abi or bytecode");
  }
  if (!String(bytecode).startsWith("0x")) bytecode = "0x" + bytecode;
  return { abi, bytecode };
}

function parseCliPeers() {
  const args = process.argv.slice(2); // [network?, ...]
  const out = {};
  for (const a of args) {
    if (a.startsWith("--peer1=")) out.peer1 = a.split("=")[1];
    if (a.startsWith("--peer2=")) out.peer2 = a.split("=")[1];
    if (a.startsWith("--peer3=")) out.peer3 = a.split("=")[1];
  }
  const vals = [out.peer1, out.peer2, out.peer3].filter(Boolean);
  return vals.length === 3 ? vals : [];
}

async function resolvePeers(web3) {
  // 1) CLI overrides
  const cliPeers = parseCliPeers();
  if (cliPeers.length === 3) {
    const unique = new Set(cliPeers.map((a) => a.toLowerCase()));
    if (unique.size !== 3) {
      throw new Error("CLI peer addresses must be unique.");
    }
    return cliPeers;
  }

  // 2) .env
  const envPeers = [
    process.env.PEER1_ADDRESS,
    process.env.PEER2_ADDRESS,
    process.env.PEER3_ADDRESS,
  ].filter(Boolean);
  if (envPeers.length === 3) {
    const unique = new Set(envPeers.map((a) => a.toLowerCase()));
    if (unique.size !== 3) {
      throw new Error(
        "PEER addresses must be 3 unique addresses (DuplicatePeerAddress would revert)."
      );
    }
    return envPeers;
  }

  // 3) Node accounts discovery
  const accounts = await web3.eth.getAccounts();
  const uniqueAccounts = Array.from(new Set(accounts.map((a) => a.toLowerCase())));
  if (uniqueAccounts.length >= 3) {
    return [uniqueAccounts[0], uniqueAccounts[1], uniqueAccounts[2]];
  }

  throw new Error(
    "Unable to determine 3 unique peer addresses. Provide --peer1/--peer2/--peer3 CLI flags or set PEER1_ADDRESS/PEER2_ADDRESS/PEER3_ADDRESS in .env, or ensure the node has >=3 accounts."
  );
}

async function main() {
  const RPC_URL = resolveRpcFromArgOrEnv();
  const web3 = new Web3(RPC_URL);

  // Basic connectivity check
  const chainId = await web3.eth.getChainId();
  if (Number(chainId) !== 12345) {
    console.warn(
      `Warning: Connected chainId=${chainId}. Expected 12345 for your private network.`
    );
  }

  const { abi, bytecode } = loadArtifact();

  // Determine deployer (must be unlocked on the node)
  const accounts = await web3.eth.getAccounts();
  if (accounts.length === 0) {
    throw new Error(
      "No accounts available from node. Ensure geth is running with an unlocked account and personal API enabled."
    );
  }
  const deployer = accounts[0];
  console.log("RPC:", RPC_URL);
  console.log("Deployer:", deployer);

  const peers = await resolvePeers(web3);
  console.log("Peers:", peers);

  // Deploy contract
  const contract = new web3.eth.Contract(abi);
  const deployment = contract.deploy({ data: bytecode, arguments: [peers] });

  const gas = await deployment.estimateGas({ from: deployer }).catch(() => undefined);

  console.log("\nSending deployment transaction...");
  const instance = await deployment
    .send({ from: deployer, gas })
    .on("transactionHash", (hash) => console.log("tx:", hash))
    .on("receipt", (rcpt) => console.log("block:", rcpt.blockNumber));

  const address = instance.options.address;
  console.log("\n✅ Deployed GenericLoggerPeerApproved at:", address);

  // Write to .env
  const envPath = path.resolve(process.cwd(), ".env");
  const suffix = process.env.ADDR_SUFFIX || "";
  if (suffix) {
    upsertEnvVar(envPath, `GENERIC_LOGGER_ADDRESS${suffix}`, address);
  } else {
    upsertEnvVar(envPath, "GENERIC_LOGGER_ADDRESS", address);
    upsertEnvVar(envPath, "CONTRACT_ADDRESS", address);
  }

  // Save deployment info JSON
  const networkId = await web3.eth.net.getId();
  const deploymentInfo = {
    contractName: "GenericLoggerPeerApproved",
    contractAddress: address,
    deployer,
    peers,
    network: {
      chainId: String(chainId),
      networkId: String(networkId),
      rpcUrl: RPC_URL,
    },
    deployedAt: new Date().toISOString(),
  };
  const outPath = path.resolve(process.cwd(), "deployment-info-web3.json");
  fs.writeFileSync(outPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${outPath}`);
}

main().catch((err) => {
  console.error("\n❌ Deployment failed:", err.message || err);
  process.exit(1);
});