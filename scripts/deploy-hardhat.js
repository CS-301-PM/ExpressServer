// scripts/deploy-hardhat.js
// Deploy UserManager, StockManager, RequestManager with peers, then write addresses to .env

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

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

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log("Deployer:", deployerAddress);
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network);

  const peers = [
    process.env.PEER1_ADDRESS || deployerAddress,
    process.env.PEER2_ADDRESS || deployerAddress,
    process.env.PEER3_ADDRESS || deployerAddress,
  ];

  console.log("Peers:", peers);

  // Deploy UserManager
  const UserManager = await hre.ethers.getContractFactory("UserManager");
  const userManager = await UserManager.deploy(peers);
  await userManager.waitForDeployment();
  const userManagerAddress = await userManager.getAddress();
  console.log("UserManager deployed at:", userManagerAddress);

  // Deploy StockManager
  const StockManager = await hre.ethers.getContractFactory("StockManager");
  const stockManager = await StockManager.deploy(peers);
  await stockManager.waitForDeployment();
  const stockManagerAddress = await stockManager.getAddress();
  console.log("StockManager deployed at:", stockManagerAddress);

  // Deploy RequestManager
  const RequestManager = await hre.ethers.getContractFactory("RequestManager");
  const requestManager = await RequestManager.deploy(peers);
  await requestManager.waitForDeployment();
  const requestManagerAddress = await requestManager.getAddress();
  console.log("RequestManager deployed at:", requestManagerAddress);

  // Update .env
  const envPath = path.resolve(process.cwd(), ".env");
  const suffix = process.env.ADDR_SUFFIX || ""; // e.g. _NODE2, _NODE3
  if (suffix) {
    upsertEnvVar(envPath, `USER_MANAGER_ADDRESS${suffix}`, userManagerAddress);
    upsertEnvVar(envPath, `STOCK_MANAGER_ADDRESS${suffix}`, stockManagerAddress);
    upsertEnvVar(envPath, `REQUEST_MANAGER_ADDRESS${suffix}`, requestManagerAddress);
  } else {
    upsertEnvVar(envPath, "USER_MANAGER_ADDRESS", userManagerAddress);
    upsertEnvVar(envPath, "STOCK_MANAGER_ADDRESS", stockManagerAddress);
    upsertEnvVar(envPath, "REQUEST_MANAGER_ADDRESS", requestManagerAddress);
    // Back-compat for older code paths
    upsertEnvVar(envPath, "CONTRACT_ADDRESS", requestManagerAddress);
  }

  console.log("\nUpdated .env with contract addresses.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
