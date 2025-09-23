const { Router } = require("express");
const router = Router();
const BlockchainControllers = require("../controllers/blockchainControllers");
const UserControllers = require("../controllers/usersControllers");

router.get("/api/blockchain/all", BlockchainControllers.GetAllBlocks);
router.get("/api/blockchain/status", BlockchainControllers.GetBlockchainStatus);
router.get("/api/blockchain/user-info", 
  UserControllers.authenticateToken, 
  BlockchainControllers.GetUserBlockchainInfo
);

module.exports = router;