const { Router } = require("express");
const { createStore, getStore, editStore } = require("../controllers/store");
const router = Router();

router.route("/").post(createStore);
router.route("/:userId").get(getStore).patch(editStore);

module.exports = router;
