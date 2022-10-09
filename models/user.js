const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
  teamname: {
    type: String,
    required: true,
  },
  u1: {
    type: String,
    required: true,
  },
  u2: {
    type: String,
  },
  u3: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    ref: "Points",
    default: 0,
  },
  atlevel: {
    type: Number,
    ref: "Level",
    default: 0,
  },
  lastLevelCrackedAt: {
    type: Date,
  },
  sudo: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
