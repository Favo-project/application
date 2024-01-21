const bcrypt = require("bcryptjs");
const User = require("../schemas/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

exports.register = asyncHandler(async (req, res, next) => {
  const { password, phone, name } = req.body;

  if (!phone || !password || !name) {
    return next(
      new ErrorResponse("Iltimos barcha ma'lumotlarni kiriting", 400)
    );
  }

  const hash = await bcrypt.hash(req.body.password, 10);

  await User.create({ phone, name, hash });

  const accessToken = generateAccessToken({
    name,
    phone,
  });

  res.status(201).json({
    success: true,
    accessToken,
    message: "Siz ro'yxatdan o'tdingiz",
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { password, phone } = req.body;

  if (!phone || !password) {
    return next(
      new ErrorResponse("Iltimos barcha ma'lumotlarni kiriting", 400)
    );
  }

  const user = await User.findOne({ phone }).select("+hash");

  if (!user) {
    return next(new ErrorResponse(`Foydalanuvchi topilmadi!`, 403));
  }

  if (await bcrypt.compare(password, user.hash)) {
    const userData = {
      name: user?.name,
      phone: user?.phone,
      email: user?.email,
      photo: user?.photo,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
    };

    const accessToken = generateAccessToken(userData);

    return res.status(200).json({
      success: true,
      accessToken,
      message: "Siz tizimga kirdingiz",
    });
  } else {
    return next(new ErrorResponse(`Foydalanuvchi ma'lumotlari noto'g'ri`, 401));
  }
});

exports.getMe = asyncHandler(async (req, res, next) => {
  console.log(req.user);
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
}
