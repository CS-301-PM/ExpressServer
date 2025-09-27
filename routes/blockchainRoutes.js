const { Router } = require("express");
const router = Router();
const BlockchainControllers = require("../controllers/blockchainControllers");
const UserControllers = require("../controllers/usersControllers");

router.get("/api/blockchain/status", BlockchainControllers.GetBlockchainStatus); // optional
router.get(
  "/api/blockchain/user-info",
  UserControllers.authenticateToken,
  BlockchainControllers.GetUserBlockchainInfo
);
router.get("/api/blockchain/accounts", BlockchainControllers.GetAccounts);
router.get("/api/blockchain/balances", BlockchainControllers.GetBalances);
router.get("/api/blockchain/info", BlockchainControllers.GetNetworkInfo);
router.get("/api/blockchain/logs", BlockchainControllers.GetContractLogs);
router.get("/api/logger/entries", BlockchainControllers.LoggerGetAllEntries);

module.exports = router;
