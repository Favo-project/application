const mongoose = require("mongoose");

const storeSchema = mongoose.Schema({
  header: {
    storeUrl: {
      type: String,
      required: [true, "Store url is required"],
      unique: true,
    },
    leayout: {
      type: String, // value is - "fullwidth" or "aspectratio",
      required: [true, "Layout type is required"],
      default: "fullwidth",
    },
    backgroundImage: {
      url: {
        type: String,
      },
      opacity: {
        type: Number,
        required: [true, "Image opacity is required"],
        default: 50,
        min: 0,
        max: 100,
      },
    },
    colotTheme: {
      textColor: {
        type: String, // value is - "dark" or "light",
        required: [true, "Text color is required"],
        default: "light",
      },
      backgroundColor: {
        type: String,
        required: [true, "Background color is required"],
        default: "#3d4853",
      },
    },
    storeTitle: {
      type: {
        type: String, // value is - "text", "image" or "off"
        required: [true, "Store title type is required"],
        default: "text",
      },
      text: {
        title: {
          type: String,
          required: [true, "Store title is required"],
        },
        subtitle: {
          type: String,
          required: [true, "Store subtitle is required"],
        },
        showSubtitle: {
          type: Boolean,
          required: [true, "Show subtitle value is required"],
          default: true,
        },
      },
      image: String, // value is - image url string
    },
  },
  layout: {
    type: String, // value is - "expanded" or "compact"
    required: [true, "Layout type is required"],
    default: "expanded",
  },
  info: {
    profile: String, // value is - image url string
    about: String, // value is - some text about you
    social: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
      twitch: String,
      tiktok: String,
    },
  },
  about: {},
  campaigns: [
    {
      campaign: {
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
    unique: true,
  },
  published: {
    type: Boolean,
    required: [true, "Store published type is required"],
    default: false,
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

module.exports = mongoose.model("Store", storeSchema);
