const asyncHandler = require("../middlewares/asyncHandler");
const Store = require("../schemas/Store");
const User = require("../schemas/User");

exports.createStore = asyncHandler(async (req, res, next) => {
  const { phone, title, subtitle } = req.body;

  const user = await User.findOne({ phone }, { _id: 1 });

  if (!user || !user._id) {
    return next(new ErrorResponse(`Foydalanuvchi topilmadi!`, 400));
  }

  const store = new Store({
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

  res.status(201).json({
    success: true,
    data: store,
  });
});

exports.getStore = asyncHandler(async (req, res, next) => {});

exports.editStore = asyncHandler(async (req, res, next) => {});
