const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const requireLogin = require("../middleware/requireLogin");
const { body, validationResult } = require("express-validator");
const { route } = require("./levels");

function checkOrigin(origin) {
  if (origin === "astellar.xyz") {
    return true;
  } else {
    return false;
  }
}
/* Handling it in response */

require("dotenv").config();
const secret = process.env.JWT_SECRET;

router.post(
  "/signup",
  [
    body("teamname", "Please provide a valid name").not().isEmpty(),
    body("u1", "Please provide a leader name").not().isEmpty(),
    body("email", "Please provide a valid email address").isEmail(),
    body(
      "password",
      "Please provide a password altleast 6 characters long"
    ).isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (checkOrigin(req.headers.origin)) {
      const { teamname, u1, u2, u3, email, email1, email2, password } =
        req.body;

      //Check team
      User.findOne({
        teamname,
      }).then((teamname) => {
        if (teamname) {
          return res.status(400).json({
            errors: [{ msg: "Teamname already exists" }],
          });
        }
      });

      //Checking if the user is already signed up or not
      User.findOne({
        email,
      }).then((user) => {
        if (user) {
          return res.status(400).json({
            errors: [{ msg: "Email already exists" }],
          });
        }

        //If not save the new User
        bcrypt.hash(password, 10).then((hashedPass) => {
          const newUser = new User({
            teamname,
            u1,
            u2,
            u3,
            email,
            email1,
            email2,
            password: hashedPass,
          });
          newUser
            .save()
            .then((saveduser) => {
              res.status(200).json(saveduser);
            })
            .catch((err) => {
              console.log(err);
            })
            .catch((err) => {
              console.log(err);
            });
        });
      });
    } else {
      return res.status(400).json({
        errors: [{ msg: "You don't have access to POST endpoints" }],
      });
    }
  }
);

router.get("/getDetails", requireLogin, (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
});

router.post(
  "/signin",
  [
    body("email", "Please provide a valid email address").isEmail(),
    body("password", "Please provide a password").not().isEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    //Checking if the user has registered or not

    User.findOne({
      email,
    }).then((user) => {
      if (!user) {
        return res.status(400).json({
          errors: [{ msg: "User not registered" }],
        });
      }

      if (!user.isValid) {
        console.log(user.isValid, "lol");
        return res.status(400).json({
          errors: [{ msg: "Please verify your email." }],
        });
      }

      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            //If password matches then issue a token depending upon the payload given
            const token = jwt.sign(
              {
                _id: user._id,
              },
              secret
            );

            const { _id, email, password } = user;
            res.json({
              token,
              user: { _id, email, password },
            });
          } else {
            return res.status(400).json({
              errors: [{ msg: "Invalid Credentials." }],
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
);

module.exports = router;
