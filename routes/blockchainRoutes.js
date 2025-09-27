const { Router } = require("express");
const router = Router();
const BlockchainControllers = require("../controllers/blockchainControllers");
const UserControllers = require("../controllers/usersControllers");

router.get("/api/blockchain/all", BlockchainControllers.GetAllBlocks); //audits
router.get("/api/blockchain/status", BlockchainControllers.GetBlockchainStatus); //optional
router.get(
  "/api/blockchain/user-info",
  UserControllers.authenticateToken,
  BlockchainControllers.GetUserBlockchainInfo
); //optional

//
router.get("/api/blockchain/accounts", BlockchainControllers.GetAccounts); //audits
router.get("/api/blockchain/balances", BlockchainControllers.GetBalances); //audits
router.get("/api/blockchain/info", BlockchainControllers.GetNetworkInfo); //audits

module.exports = router;
