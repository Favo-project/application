const { Router } = require("express");
const authenticateUser = require("../middlewares/authenticateUser");
const {
  getAll,
  getOne,
  create,
  editAndSave,
  modifyOne,
  deleteOne,
  launchCampaign,
} = require("../controllers/campaign");
const router = Router();

router.route("/").get(authenticateUser, getAll).post(authenticateUser, create);
router
  .route("/:campaignId")
  .get(authenticateUser, getOne)
  .patch(authenticateUser, editAndSave)
  .put(authenticateUser, modifyOne)
  .delete(authenticateUser, deleteOne);
router.route("/launch/:campaignId").post(authenticateUser, launchCampaign);

module.exports = router;
