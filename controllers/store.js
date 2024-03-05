const asyncHandler = require("../middlewares/asyncHandler");
const Store = require("../schemas/Store");
const User = require("../schemas/User");

exports.getAllStores = asyncHandler(async (req, res, next) => {});

exports.getStore = asyncHandler(async (req, res, next) => {});

exports.createStore = asyncHandler(async (req, res, next) => {
  const { title, subtitle } = req.body;

  const user = await User.findOne({ phone: req.user.phone }, { _id: 1 });

  if (!user || !user._id) {
    return next(new ErrorResponse(`Foydalanuvchi topilmadi!`, 400));
  }

  const store = new Store({
    storeUrl: title.toLowerCase(),
    header: {
      storeTitle: {
        text: {
          title,
          subtitle,
        },
      },
    },
    userId: user?._id,
  });

  await store.save();

  res.status(201).json({
    success: true,
    data: store,
  });
});

exports.editStore = asyncHandler(async (req, res, next) => {});
