const { Router } = require(`express`);
const router = Router();
const UserControllers = require(`../controllers/usersControllers`);
// const { authMiddleware } = require(`../controllers/usersControllers`);

const preReq = `/api/user`;
router.post(`${preReq}/signup`, UserControllers.SignUp);
router.post(`${preReq}/signin`, UserControllers.SignIn);
router.get(`${preReq}/Signout`, UserControllers.SignOut);
router.get(`${preReq}/signed`, UserControllers.Signed);
router.delete(`${preReq}/delete/:id`, UserControllers.Delete);
router.put(`${preReq}/edit`, UserControllers.Edit);
router.get(`${preReq}/all`, UserControllers.GetAllUsers);
router.put(`${preReq}/modify/:id`, UserControllers.EditSpecificUser);
module.exports = router;
