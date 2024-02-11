const asyncHandler = require("../middlewares/asyncHandler");
const Campaign = require("../schemas/Campaign");

exports.getCartList = asyncHandler(async (req, res, next) => {
  let cartList = req.body;

  const campaignList = cartList.map((c) => c.campaignId);

  const campaigns = await Campaign.find(
    { _id: campaignList, status: "Launched" },
    {
      description: 0,
      soldAmount: 0,
      campaignLevel: 0,
      status: 0,
      tags: 0,
      createdAt: 0,
      updatedAt: 0,
    }
  );

  const cart = campaigns.map((campaign) => {
    const items = cartList.filter(
      (item) => campaign._id.toString() === item.campaignId.toString()
    );

    // concatting _doc object into a cart item, because from mongodb objects in array/find query always come inside the _doc object
    return {
      ...campaign._doc,
      items,
    };
  });

  res.status(200).json({
    success: true,
    data: cart,
  });
});
