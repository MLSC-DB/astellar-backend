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
  d1: {
    type: String,
    required: true,
  },
  d2: {
    type: String,
  },
  d3: {
    type: String,
  },
  b1: {
    type: Number,
    required: true,
  },
  b2: {
    type: Number,
  },
  b3: {
    type: Number,
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
