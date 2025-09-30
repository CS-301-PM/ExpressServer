const { Router } = require(`express`);
const router = Router();
const UserControllers = require(`../controllers/usersControllers`);
const { authenticateToken } = require(`../controllers/usersControllers`);
const preReq = `/api/user`;
router.post(`${preReq}/signup`, UserControllers.SignUp);
router.post(`${preReq}/signin`, UserControllers.SignIn);
router.get(`${preReq}/Signout`, authenticateToken, UserControllers.SignOut);
router.get(`${preReq}/signed`, authenticateToken, UserControllers.Signed);
router.delete(
  `${preReq}/delete/:id`,
  authenticateToken,
  UserControllers.Delete
);
router.put(`${preReq}/edit`, authenticateToken, UserControllers.Edit);
router.get(`${preReq}/all`, UserControllers.GetAllUsers);
router.put(
  `${preReq}/modify/:id`,
  authenticateToken,
  UserControllers.EditSpecificUser
);
module.exports = router;
