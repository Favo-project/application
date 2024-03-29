const mongoose = require("mongoose");

const campaignSchema = mongoose.Schema({
  title: String,
  description: String,
  status: String,
  design: {
    front: Array,
    back: Array,
  },
  products: [
    {
      name: {
        type: String,
        required: [true, "Produkt nomi majburiy!"],
      },
      printableArea: {
        front: {
          top: {
            type: Number,
            required: [true, "PrintableArea qiymati majburiy!"],
          },
          left: {
            type: Number,
            required: [true, "PrintableArea qiymati majburiy!"],
          },
          width: {
            type: Number,
            required: [true, "PrintableArea qiymati majburiy!"],
          },
          height: {
            type: Number,
            required: [true, "PrintableArea qiymati majburiy!"],
          },
        },
        back: {
          top: {
            type: Number,
            required: [true, "PrintableArea qiymati majburiy!"],
          },
          left: {
            type: Number,
            required: [true, "PrintableArea qiymati majburiy!"],
          },
          width: {
            type: Number,
            required: [true, "PrintableArea qiymati majburiy!"],
          },
          height: {
            type: Number,
            required: [true, "PrintableArea qiymati majburiy!"],
          },
        },
      },
      colors: [
        {
          color: {
            name: {
              type: String,
              required: [true, "Rang nomi majburiy!"],
            },
            content: {
              type: String,
              required: [true, "Product rangi majburiy!"],
            },
          },
          image: {
            front: {
              type: String,
              required: [true, "Product rasmi majburiy!"],
            },
            back: {
              type: String,
              required: [true, "Product rasmi majburiy!"],
            },
          },
          designImg: {
            front: {
              type: String,
              required: [true, "Product rasmi majburiy!"],
            },
            back: {
              type: String,
              required: [true, "Product rasmi majburiy!"],
            },
          },
        },
      ],
      sizes: [
        {
          type: String,
          required: [true, "Size is required"],
        },
      ],
      baseCost: {
        type: Number,
        required: [true, "Base cost is required"],
        default: 0,
      },
      maxCost: {
        type: Number,
        required: [true, "Max cost is required"],
        default: 0,
      },
      sellingPrice: {
        type: Number,
        required: [true, "Selling price is required"],
        default: 0,
      },
    },
  ],
  tags: [
    {
      name: {
        type: String,
        required: [true, "Tag nomi majburiy!"],
      },
      relatedTags: Boolean,
      customTag: Boolean,
      relatedTo: String,
    },
  ],
  campaignLevel: {
    type: Number,
    required: [true, "Campaign level is required"],
    default: 0,
  },
  soldAmount: {
    type: Number,
    required: [true, "Campaign sold amount is required"],
    default: 0,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Creator of the campaign is required"],
    ref: "User",
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Campaign", campaignSchema);
