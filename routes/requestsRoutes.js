const { Router } = require("express");
const router = Router();
const RequestControllers = require("../controllers/requestsControllers");

const preReq = "/api/requests";

// Routes
router.post(`${preReq}/make`, RequestControllers.MakeRequest);
router.get(`${preReq}/manage`, RequestControllers.ManageRequest);
router.get(`${preReq}/all`, RequestControllers.GetAllRequests);
router.get(`${preReq}/grouped`, RequestControllers.GetGroupedRequests);
router.get(`${preReq}/:id`, RequestControllers.GetSingleRequest);
router.put(`${preReq}/edit/:id`, RequestControllers.EditRequest);
router.delete(`${preReq}/delete/:id`, RequestControllers.DeleteRequest);

module.exports = router;
