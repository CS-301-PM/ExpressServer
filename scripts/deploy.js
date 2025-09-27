// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Your 3 peers (must match those in genesis / geth alloc)
  const peers = [
    "0xDDb0a67181F038739C67E92093C84Bb7C555C1D8",
    "0x0B248951266FC027F4DC6386288acB3B094d947E",
    "0x212C5b941eDC69311F3aBE801C25a2E8981F84fF",
  ];

  // Deploy UserManager
  const UserManager = await hre.ethers.getContractFactory("UserManager");
  const userManager = await UserManager.deploy(peers);
  await userManager.deployed();
  console.log("✅ UserManager deployed at:", userManager.address);

  // Deploy StockManager
  const StockManager = await hre.ethers.getContractFactory("StockManager");
  const stockManager = await StockManager.deploy(peers);
  await stockManager.deployed();
  console.log("✅ StockManager deployed at:", stockManager.address);

  // Deploy RequestManager
  const RequestManager = await hre.ethers.getContractFactory("RequestManager");
  const requestManager = await RequestManager.deploy(peers);
  await requestManager.deployed();
  console.log("✅ RequestManager deployed at:", requestManager.address);

  // Save addresses to JSON file (so backend can use them)
  const fs = require("fs");
  const contractsData = {
    UserManager: userManager.address,
    StockManager: stockManager.address,
    RequestManager: requestManager.address,
  };

  fs.writeFileSync(
    "deployed-contracts.json",
    JSON.stringify(contractsData, null, 2)
  );
  console.log("📂 Contract addresses saved to deployed-contracts.json");
}

// Run
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
