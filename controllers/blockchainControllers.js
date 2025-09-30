// controllers/BlockchainControllers.js
const Blockchain = require("../models/blockchain");
const Web3Service = require("../blockchain/Web3Service");
const web3 = require("../Web3/web3").default;
const User = require("../models/users"); // make sure you import your User model

// Get all blockchain logs stored in your DB
const GetAllBlocks = async (req, res) => {
  try {
    const blocks = await Blockchain.findAll({
      order: [["block_number", "DESC"]],
      // include: ['User', 'Stock', 'Request'] if needed
    });
    res.status(200).json({ blocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in GetAllBlocks" });
  }
};

// Get blockchain connection and contract status
const GetBlockchainStatus = async (req, res) => {
  try {
    const status = {
      connected: Web3Service.isConnected(),
      contract_loaded: !!Web3Service.contract,
      contract_address:
        Web3Service.contractAddress || process.env.CONTRACT_ADDRESS,
      last_block: await Web3Service.web3.eth.getBlockNumber(),
    };
    res.status(200).json({ status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in GetBlockchainStatus" });
  }
};

// Get a specific user's blockchain info
const GetUserBlockchainInfo = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "blockchain_address", "role"],
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const balance = user.blockchain_address
      ? await Web3Service.web3.eth.getBalance(user.blockchain_address)
      : 0;

    res.status(200).json({
      user: {
        id: user.id,
        blockchain_address: user.blockchain_address,
        role: user.role,
        balance: Web3Service.web3.utils.fromWei(balance, "ether"),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in GetUserBlockchainInfo" });
  }
};

// Get all accounts from node
const GetAccounts = async (req, res) => {
  try {
    const accounts = await web3.eth.getAccounts();
    res.json({ accounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get balances for all accounts
const GetBalances = async (req, res) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const balances = {};
    for (const acc of accounts) {
      const balance = await web3.eth.getBalance(acc);
      balances[acc] = balance.toString(); // convert BigInt/BN to string
    }
    res.json(balances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper to safely stringify BigInt or BN
function safeStringify(value) {
  if (typeof value === "bigint") return value.toString();
  if (value && value._isBigNumber) return value.toString(); // BN.js
  return value;
}

// Get network information
const GetNetworkInfo = async (req, res) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const balances = {};
    for (const acc of accounts) {
      const balance = await web3.eth.getBalance(acc);
      balances[acc] = safeStringify(balance);
    }

    const peers = await new Promise((resolve, reject) => {
      web3.currentProvider.send(
        {
          jsonrpc: "2.0",
          method: "admin_peers",
          params: [],
          id: new Date().getTime(),
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result.result || result);
        }
      );
    });

    const chainId = safeStringify(await web3.eth.getChainId());
    const networkId = safeStringify(await web3.eth.net.getId());
    const blockNumber = safeStringify(await web3.eth.getBlockNumber());

    res.json({
      accounts,
      balances,
      chainId,
      networkId,
      blockNumber,
      peers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get logs/events directly from contracts
const GetContractLogs = async (req, res) => {
  try {
    const { type, fromBlock, toBlock } = req.query;
    const logs = await Web3Service.getLogs(
      type,
      Number(fromBlock) || 0,
      toBlock || "latest"
    );
    if (!logs.success) return res.status(400).json({ error: logs.error });
    res.json({ logs: logs.logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const LoggerGetAllEntries = async (_req, res) => {
  try {
    const out = await Web3Service.loggerGetAllEntries();
    if (!out.success) return res.status(400).json(out);
    const json = JSON.stringify(out, (k, v) =>
      typeof v === "bigint" ? v.toString() : v
    );
    res.set("Content-Type", "application/json");
    res.send(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  GetAllBlocks,
  GetBlockchainStatus,
  GetUserBlockchainInfo,
  GetAccounts,
  GetBalances,
  GetNetworkInfo,
  GetContractLogs,
  LoggerGetAllEntries,
};
