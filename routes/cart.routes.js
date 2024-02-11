const { Router } = require("express");
const { getCartList } = require("../controllers/cart");
const router = Router();

router.route("/").patch(getCartList);

module.exports = router;
