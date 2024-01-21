const { Router } = require("express");
const { getMe, changeCredentials } = require("../controllers/user");
const router = Router();
const authenticateUser = require("../middlewares/authenticateUser");
const uploadFile = require("../utils/uploadFile");

router.route("/me").get(authenticateUser, getMe);
router
  .route("/")
  .patch(uploadFile.single("photo"), authenticateUser, changeCredentials);

module.exports = router;
