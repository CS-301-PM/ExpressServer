// controllers/BlockchainControllers.js
const Blockchain = require("../models/blockchain");

// Get all blockchain logs
const GetAllBlocks = async (req, res) => {
  try {
    const blocks = await Blockchain.findAll();
    res.status(200).json({ blocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error in GetAllBlocks" });
  }
};

module.exports = {
  GetAllBlocks,
};
