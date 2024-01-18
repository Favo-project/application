const asyncHandler = require("../middlewares/asyncHandler");
const saveCampaign = require("../campaign/saveCampaign");
const ErrorResponse = require("../utils/errorResponse");
const Campaign = require("../schemas/Campaign");
const { isDeepStrictEqual } = require("util");
const { isValidObjectId } = require("mongoose");
const deleteDirectory = require("../utils/deleteDir");

exports.getAll = asyncHandler(async (req, res, next) => {
  const campaigns = await Campaign.find();

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

  console.table(campaignData.products);

  // creating mongodb instance of campaign
  const campaign = new Campaign({
    title: "Draft campaign",
    design: campaignData.design,
    campaignLevel: campaignData.campaignLevel,
    sizes: campaignData.sizes,
    status: "Draft",
  });

  // sending campaign data and campaign id in order save images in proper file
  const products = await saveCampaign.onSave(campaignData, campaign._id);

  // inserting saved images to campaign data
  campaign.products = [...products];

  // saving campaign in mongoDB
  await campaign.save();

  console.log("Campaign saved!");

  res.status(201).json({
    success: true,
    data: campaign,
  });
});

exports.getOne = asyncHandler(async (req, res, next) => {
  const campaign = await Campaign.findById(req.params.campaignId);

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

  const campaign = await Campaign.findById(campaignId);

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
        design: {
          ...req.body.design,
        },
        products: [...products],
        _id: campaignId,
      },
      { new: true }
    );

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

  await deleteDirectory(campaignId);

  await Campaign.deleteOne({ _id: campaignId });

  res.sendStatus(204);
});

exports.launchCampaign = asyncHandler(async (req, res, next) => {
  const { campaignId } = req.params;
  const campaign = req.body;

  const updatedCampaign = await Campaign.findByIdAndUpdate(
    {
      _id: campaignId,
    },
    {
      ...campaign,
      campaignLevel: 4,
      status: "Launched",
      _id: campaignId,
    },
    { new: true }
  );

  console.table(updatedCampaign);

  res.status(200).json({
    success: true,
    data: "Campaign launched",
  });
});
