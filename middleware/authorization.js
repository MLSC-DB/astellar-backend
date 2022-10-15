const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
require("dotenv").config();
const secret = process.env.JWT_SECRET;

const authorization = async (req, res, next) => {
  try {
    const token = req.headers["astellar-headers"];
    const verifyUser = jwt.verify(token, secret);
    User.findById({
      _id: verifyUser._id,
    }).then((teamData) => {
      req.team = teamData;
      next();
    });
  } catch (error) {
    res.status(422).json({
      error: "You must be logged in",
    });
  }
};
module.exports = authorization;
