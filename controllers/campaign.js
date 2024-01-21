const asyncHandler = require("../middlewares/asyncHandler");
const saveCampaign = require("../campaign/saveCampaign");
const ErrorResponse = require("../utils/errorResponse");
const Campaign = require("../schemas/Campaign");
const { isDeepStrictEqual } = require("util");
const { isValidObjectId } = require("mongoose");
const deleteDirectory = require("../utils/deleteDir");
const User = require("../schemas/User");

exports.getAll = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ phone: req.user.phone }, { creatorId: 0 });

  if (!user) {
    return next(new ErrorResponse(`Foydalanuvchi topilmadi!`, 404));
  }

  const campaigns = await Campaign.find(
    { creatorId: user._id },
    {
      creatorId: 0,
    }
  );

  return res.status(200).json({ success: true, data: campaigns });
});

exports.create = asyncHandler(async (req, res, next) => {
  const campaignData = req.body;

  // throw error if there is no design object in campaign
  if (
    !campaignData?.design?.front?.length &&
    !campaignData?.design?.back?.length
  ) {
    return next(
      new ErrorResponse(`Dizayda kamida 1 dona element bolishi kerak!`, 400)
    );
  }

  const user = await User.findOne({ phone: req.user.phone });

  if (!user) {
    return next(new ErrorResponse(`Foydalanuvchi topilmadi!`, 404));
  }

  // creating mongodb instance of campaign
  const campaign = new Campaign({
    title: "Draft campaign",
    design: campaignData.design,
    campaignLevel: campaignData.campaignLevel,
    sizes: campaignData.sizes,
    status: "Draft",
    creatorId: user._id,
  });

  // sending campaign data and campaign id in order save images in proper file
  const products = await saveCampaign.onSave(campaignData, campaign._id);

  // inserting saved images to campaign data
  campaign.products = [...products];

  // saving campaign in mongoDB
  await campaign.save();

  campaign.creatorId = null;
  res.status(201).json({
    success: true,
    data: campaign,
  });
});

exports.getOne = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ phone: req.user.phone });

  if (!user) {
    return next(new ErrorResponse(`Foydalanuvchi topilmadi!`, 404));
  }

  const campaign = await Campaign.findOne(
    {
      _id: req.params.campaignId,
      creatorId: user._id,
    },
    {
      creatorId: 0,
    }
  );

  res.status(200).json({
    success: true,
    data: campaign,
  });
});

exports.editAndSave = asyncHandler(async (req, res, next) => {
  const { campaignId } = req.params;

  if (!isValidObjectId(campaignId)) {
    return next(new ErrorResponse(`Campaign ID-${campaignId} toplimadi`, 404));
  }

  const user = await User.findOne({ phone: req.user.phone });

  if (!user) {
    return next(new ErrorResponse(`Foydalanuvchi topilmadi!`, 404));
  }

  const campaign = await Campaign.findOne(
    {
      _id: campaignId,
      creatorId: user._id,
    },
    {
      creatorId: 0,
    }
  );

  if (!campaign) {
    return next(new ErrorResponse(`Malumotlar noto'g'ri kiritldi!`, 400));
  }

  const campaignSelect = {
    design: { ...JSON.parse(JSON.stringify(campaign.design)) },
    products: { ...JSON.parse(JSON.stringify(campaign.products)) },
  };

  const requestSelect = {
    design: { ...JSON.parse(JSON.stringify(req.body.design)) },
    products: { ...JSON.parse(JSON.stringify(req.body.products)) },
  };

  if (isDeepStrictEqual(campaignSelect, requestSelect)) {
    res.status(200).json({
      success: true,
      data: {
        updated: false,
        message: "Nothing to change",
      },
    });
  } else {
    // first deleting old files to update them properly
    await deleteDirectory(campaignId);

    // sending campaign data and campaign id in order save images in proper file
    const products = await saveCampaign.onSave(req.body, campaignId);

    // edit the campaign
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      {
        _id: campaignId,
      },
      {
        ...req.body,
        products: [...products],
        _id: campaignId,
      },
      { new: true }
    );

    delete updatedCampaign.creatorId;

    res.status(200).json({
      success: true,
      data: updatedCampaign,
      updated: true,
      message: "Campaign saved",
    });
  }
});

exports.modifyOne = asyncHandler(async (req, res, next) => {
  const { campaignId } = req.params;

  if (!isValidObjectId(campaignId)) {
    return next(new ErrorResponse(`Campaign ID-${campaignId} toplimadi`, 404));
  }

  const user = await User.findOne({ phone: req.user.phone });

  if (!user) {
    return next(new ErrorResponse(`Foydalanuvchi topilmadi!`, 404));
  }

  const campaign = await Campaign.findOne(
    {
      _id: campaignId,
      creatorId: user._id,
    },
    { title: 1 }
  );

  if (!campaign) {
    return next(new ErrorResponse(`Malumotlar noto'g'ri kiritldi!`, 400));
  }

  const updatedCampaign = await Campaign.findByIdAndUpdate(
    {
      _id: campaignId,
    },
    {
      ...req.body,
      _id: campaignId,
    },
    { new: true }
  );

  delete updatedCampaign.creatorId;

  res.status(200).json({
    success: true,
    data: updatedCampaign,
    updated: true,
    message: "Campaign saved",
  });
});

exports.deleteOne = asyncHandler(async (req, res, next) => {
  const { campaignId } = req.params;

  if (!isValidObjectId(campaignId)) {
    return next(new ErrorResponse(`Campaign ID-${campaignId} toplimadi`, 404));
  }

  const user = await User.findOne({ phone: req.user.phone });

  if (!user) {
    return next(new ErrorResponse(`Foydalanuvchi topilmadi!`, 404));
  }

  const campaign = await Campaign.findOne(
    {
      _id: campaignId,
      creatorId: user._id,
    },
    { title: 1 }
  );

  if (!campaign) {
    return next(new ErrorResponse(`Malumotlar noto'g'ri kiritldi!`, 400));
  }

  await deleteDirectory(campaignId);

  await Campaign.deleteOne({ _id: campaignId });

  res.sendStatus(204);
});
