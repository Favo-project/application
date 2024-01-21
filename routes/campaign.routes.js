const { Router } = require("express");
const authenticateUser = require("../middlewares/authenticateUser");
const {
  getAll,
  getOne,
  create,
  editAndSave,
  modifyOne,
  deleteOne,
} = require("../controllers/campaign");
const router = Router();

router.route("/").get(authenticateUser, getAll).post(authenticateUser, create);
router
  .route("/:campaignId")
  .get(authenticateUser, getOne)
  .patch(authenticateUser, editAndSave)
  .put(authenticateUser, modifyOne)
  .delete(authenticateUser, deleteOne);

module.exports = router;
