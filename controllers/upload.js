const asyncHandler = require("../middlewares/asyncHandler");
const Image = require("../schemas/Image");
const ErrorResponse = require("../utils/errorResponse");

exports.upload = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send("No image uploaded");
  }

  const imagePath = "/files/images/" + req.file.filename;

  const image = new Image({ image: imagePath });

  const savedImage = await image.save();

  res.status(200).json({
    success: true,
    data: savedImage,
  });
});

exports.getAll = asyncHandler(async (req, res, next) => {
  const images = await Image.find();

  res.status(200).json({
    success: true,
    data: images,
  });
});

exports.deleteAll = asyncHandler(async (req, res, next) => {
  await Image.deleteMany();

  res.sendStatus(204);
});
