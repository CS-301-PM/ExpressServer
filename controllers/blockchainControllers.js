// controllers/BlockchainControllers.js
const Blockchain = require("../models/blockchain");
const Web3Service = require("../blockchain/Web3Service");
const web3 = require("../Web3/web3").default;
// Get all blockchain logs
const GetAllBlocks = async (req, res) => {
  try {
    const blocks = await Blockchain.findAll({
      order: [["block_number", "DESC"]],
      // include: ['User', 'Stock', 'Request']
    });
    res.status(200).json({ blocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in GetAllBlocks" });
  }
};

// Get blockchain status
const GetBlockchainStatus = async (req, res) => {
  try {
    const status = {
      connected: Web3Service.isConnected(),
      contract_loaded: !!Web3Service.contract,
      contract_address: process.env.CONTRACT_ADDRESS,
      last_block: await Web3Service.web3.eth.getBlockNumber(),
    };

    res.status(200).json({ status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in GetBlockchainStatus" });
  }
};

// Get user's blockchain info
const GetUserBlockchainInfo = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "blockchain_address", "role"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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

// Get all accounts
const GetAccounts = async (req, res) => {
  try {
    const accounts = await web3.eth.getAccounts();
    res.json({ account: accounts });
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
      // web3.eth.getBalance may return a string or BN, convert to string
      const balance = await web3.eth.getBalance(acc);
      balances[acc] = balance.toString(); // <--- convert BigInt or BN to string
    }
    res.json(balances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper to safely convert BigInt / BN to string
function safeStringify(value) {
  if (typeof value === "bigint") return value.toString();
  if (value && value._isBigNumber) return value.toString(); // for BN.js
  return value;
}
// Get network info
const GetNetworkInfo = async (req, res) => {
 try {
   // Get accounts
   const accounts = await web3.eth.getAccounts();

   // Get balances
   const balances = {};
   for (const acc of accounts) {
     const balance = await web3.eth.getBalance(acc);
     balances[acc] = safeStringify(balance);
   }

   // Get peers using admin API
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

   // Get chain/network info
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

module.exports = {
  GetAllBlocks,
  GetBlockchainStatus,
  GetUserBlockchainInfo,
  //
  GetAccounts,
  GetBalances,
  GetNetworkInfo,
};
