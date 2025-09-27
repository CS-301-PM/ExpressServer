const { Router } = require("express");
const router = Router();
const StockControllers = require("../controllers/stocksControllers");

const preReq = "/api/stocks";

// Routes
router.post(`${preReq}/add`, StockControllers.AddStock);
router.get(`${preReq}/all`, StockControllers.GetAllStocks);
router.get(`${preReq}/available`, StockControllers.GetAllStocksAvailable);
router.put(`${preReq}/edit/:id`, StockControllers.EditStock);
router.delete(`${preReq}/delete/:id`, StockControllers.DeleteStock);

module.exports = router;
