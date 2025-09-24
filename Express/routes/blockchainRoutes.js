const { Router } = require("express");
const router = Router();
const BlockchainControllers = require("../controllers/blockchainControllers");

router.get("/api/blockchain/all", BlockchainControllers.GetAllBlocks);

module.exports = router;
