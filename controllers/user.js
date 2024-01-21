const asyncHandler = require("../middlewares/asyncHandler");
const User = require("../schemas/User");
const jwt = require("jsonwebtoken");
const { unlink } = require("fs/promises");
const path = require("path");
const fs = require("fs");

exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: {
      name: req.user?.name,
      phone: req.user?.phone,
      email: req.user?.email,
      photo: req.user?.photo,
      createdAt: req.user?.createdAt,
      updatedAt: req.user?.updatedAt,
    },
  });
});

exports.changeCredentials = asyncHandler(async (req, res, next) => {
  const userData = req.body;
  const oldUser = await User.findOne({ phone: req.user.phone });

  delete userData.photo;

  if (req?.file) {
    userData.photo = `/images/${req?.file?.filename}`;

    if (oldUser?.photo) {
      // deleting old photo of profile
      const oldPhoto = path.join(__dirname, "..", "/public", oldUser?.photo);
      if (fs.existsSync(oldPhoto)) {
        await unlink(oldPhoto);
      }
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    {
      _id: oldUser._id,
    },
    {
      ...userData,
    },
    { new: true }
  );

  const user = {
    name: updatedUser?.name,
    phone: updatedUser?.phone,
    email: updatedUser?.email,
    photo: updatedUser?.photo,
    createdAt: updatedUser?.createdAt,
    updatedAt: updatedUser?.updatedAt,
  };

  const accessToken = generateAccessToken(user);

  res.status(200).json({
    success: true,
    data: updatedUser,
    newToken: accessToken,
  });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
}
