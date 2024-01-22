const { Router } = require("express");
const authenticateUser = require("../middlewares/authenticateUser");
const {
  getAll,
  getOne,
  create,
  editAndSave,
  modifyOne,
  deleteOne,
  getAllPublic,
  getOnePublic,
} = require("../controllers/campaign");
const router = Router();

router.route("/public").get(getAllPublic);
router.route("/public/:campaignId").get(getOnePublic);

router.route("/").get(authenticateUser, getAll).post(authenticateUser, create);
router
  .route("/:campaignId")
  .get(authenticateUser, getOne)
  .patch(authenticateUser, editAndSave)
  .put(authenticateUser, modifyOne)
  .delete(authenticateUser, deleteOne);

module.exports = router;
