const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  campaigns: [
    {
      campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Campaign Id is required"],
        ref: "Campaign",
      },
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "User Id is required"],
    ref: "User",
    select: false,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
