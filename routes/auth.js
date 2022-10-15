const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authorization = require("../middleware/authorization");
const { body, validationResult } = require("express-validator");
const { route } = require("./levels");

function checkOrigin(origin) {
  if ((origin === "https://astellar.xyz")) {
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

    // const { teamname, u1, u2, u3, email, email1, email2, password } = req.body;

    if (checkOrigin(req.headers.origin)) {
      const {
        teamname,
        u1,
        u2,
        u3,
        b1,
        b2,
        b3,
        d1,
        d2,
        d3,
        email,
        email1,
        email2,
        password,
      } = req.body;

      //Check team
      User.findOne({
        teamname,
      }).then((t1) => {
        if (t1) {
          return res.status(400).json({
            errors: [{ msg: "Teamname already exists" }],
          });
        }
        
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
              b1,
              b2,
              b3,
              d1,
              d2,
              d3,
              email,
              email1,
              email2,
              password: hashedPass,
            });
            newUser
              .save()
              .then((saveduser) => {
                console.log(teamname);
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
      });
    } else {
      return res.status(400).json({
        errors: [{ msg: "You don't have access to POST endpoints" }],
      });
    }
  }
);

router.get("/getDetails", authorization, (req, res) => {
  User.findById(req.team._id)
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
});

router.post(
  "/signin",
  [body("password", "Please provide a password").not().isEmpty()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { teamname, password } = req.body;

    //Checking if the user has registered or not

    User.findOne({
      teamname,
    }).then((user) => {
      if (!user) {
        return res.status(400).json({
          errors: [{ msg: "Teamname not registered" }],
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

            const { _id, teamname, password } = user;

            res.cookie("jwt", token, {
              expires: new Date(Date.now() + 18000000),
              httpOnly: true,
            });
            res.json({
              token,
              user: { _id, teamname, password },
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


router.get("/logout",(req,res)=>{
  res.cookie("jwt","",{
    httpOnly:true,
    expires: new Date(0),
  })
  send();
})

module.exports = router;
