const { Router } = require(`express`);
const router = Router();
const BlockchainStatusController = require(`../controllers/blockchainStatusControllers`);
const preReq = `/api/blockchain/status`;
router.get(`${preReq}/healthy`, BlockchainStatusController.Healthy);

module.exports = router;
