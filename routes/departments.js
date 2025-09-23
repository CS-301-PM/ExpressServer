const { Router } = require("express");
const router = Router();
const RequestControllers = require("../controllers/departments");

const preReq = "/api/departments";

// Routes
router.post(`${preReq}/make`, RequestControllers.addDepartment);
router.get(`${preReq}/all`, RequestControllers.getAllDepartments);
router.put(`${preReq}/edit/:id`, RequestControllers.editDepartment);

module.exports = router;
