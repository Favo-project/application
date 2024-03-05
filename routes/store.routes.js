const { Router } = require("express");
const {
  createStore,
  getStore,
  editStore,
  getAllStores,
} = require("../controllers/store");
const authenticateUser = require("../middlewares/authenticateUser");
const router = Router();

router.route("/").get(getAllStores).post(authenticateUser, createStore);
router.route("/:userId").get(getStore).patch(authenticateUser, editStore);

module.exports = router;
