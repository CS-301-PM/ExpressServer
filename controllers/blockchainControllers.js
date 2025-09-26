// controllers/BlockchainControllers.js
const Blockchain = require("../models/blockchain");
const Web3Service = require("../blockchain/Web3Service");

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

module.exports = {
  GetAllBlocks,
  GetBlockchainStatus,
  GetUserBlockchainInfo,
};
