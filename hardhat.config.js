require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const useNodeAccounts =
  String(process.env.USE_NODE_ACCOUNTS || "").toLowerCase() === "true";
const pk = process.env.DEPLOYER_PRIVATE_KEY;
const maybeAccounts = !useNodeAccounts && pk ? [pk] : undefined;

module.exports = {
  solidity: "0.8.21", // match your contracts
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    node1: Object.assign(
      { url: "http://127.0.0.1:8501", chainId: 12345 },
      maybeAccounts ? { accounts: maybeAccounts } : {}
    ),
    node2: Object.assign(
      { url: "http://127.0.0.1:8502", chainId: 12345 },
      maybeAccounts ? { accounts: maybeAccounts } : {}
    ),
    node3: Object.assign(
      { url: "http://127.0.0.1:8503", chainId: 12345 },
      maybeAccounts ? { accounts: maybeAccounts } : {}
    ),
  },
};
