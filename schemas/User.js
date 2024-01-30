const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Foydalanuvchi ismi majburiy!"],
  },
  phone: {
    type: Number,
    required: [true, "Foydalanuvchi tel. raqami majburiy!"],
    unique: true,
  },
  email: {
    type: String,
  },
  photo: String,
  hash: {
    type: String,
    required: [true, "Foydalanuvchi paroli majburiy!"],
    minlength: 6,
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

module.exports = mongoose.model("User", userSchema);
