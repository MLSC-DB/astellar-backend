//?Todo make postLevels auth protected , hash answers
const express = require("express");
const router = express.Router();
const Level = require("../models/levels");
const User = require("../models/user");
const requireLogin = require("../middleware/requireLogin");
const authorization = require("../middleware/authorization");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const fs = require("fs");

//File Storage Config
const storageDir = path.join(__dirname, "backend", "../..", "public");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    console.log(file, "hello");
    cb(null, +Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
}).single("file");

//Posting the levels data to the db
router.post("/postLevel", upload, (req, res) => {
  // const url = req.protocol + "://" + req.get("host");

  const { _id, hint, answer, question, points, password } = req.body;

  if (password === "youcannotcrackit54") {
    bcrypt.hash(answer, 10).then((hashedAnswer) => {
      const newLevel = new Level({
        _id,
        question,
        hint,
        points,
        answer: hashedAnswer,
      });

      newLevel
        .save()
        .then((savedLevel) => {
          res.status(200).json(savedLevel);
        })
        .catch((err) => {
          res.status(400).json({
            err,
          });
        });
    });
  } else {
    res.status(400).json({
      message: "Are you really one of the three admins ;-; ?",
    });
  }
});

//Get current level of a user
router.get("/getCurrentLevel", authorization, (req, res) => {
  Level.findById(req.headers["question-headers"])
    .then((level) => {
      res.status(200).json(level);
    })
    .catch((err) => {
      res.json({
        err: "Sorry.there was a network error while showing level",
      });
    });
});

//Checking answer of the level
router.post("/answer", authorization, (req, res) => {
  const { answer, question } = req.body;
  Level.findById(question).then((ans) => {
    User.findById(req.team._id)
      .then((level) => {
        bcrypt.compare(answer, ans.answer).then((isMatch) => {
          if (isMatch) {
            User.findByIdAndUpdate(
              req.team._id,
              {
                $set: {
                  lastLevelCrackedAt: Date.now(),
                  points: level.points + ans.points,
                },
              },
              {
                new: true,
                runValidators: true,
              }
            ).then((newLevel) => {
              res.status(200).json("Correct Answer!");
            });
          } else {
            return res.status(400).json({
              errors: [{ msg: "Incorrect answer" }],
            });
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // res.status(200).json(req);
  // User.findById(req.user._id)
  //   .populate("atLevel", ["_id", "answer"])
  //   .then((level) => {
  //     //Checking for the answer

  //     bcrypt.compare(answer, level.atLevel.answer).then((isMatch) => {
  //       if (isMatch) {
  //         User.findByIdAndUpdate(
  //           req.user._id,
  //           {
  //             $set: {
  //               atLevel: level.atLevel._id + 1, //Updating level
  //               lastLevelCrackedAt: Date.now(), //Updating the time of last cracked level
  //             },
  //           },
  //   {
  //     new: true,
  //     runValidators: true,
  //   }
  // )
  //           .populate("atLevel", ["_id", "hint", "question"])
  //           .then((newLevel) => {
  //             res.status(200).json(newLevel);
  //           });
  //       } else {
  // return res.status(400).json({
  //   errors: [{ msg: "Incorrect answer" }],
  // });
  //       }
  //     });
  //   })
  // .catch((err) => {
  //   console.log(err);
  // });
});

//Fectching users to be displayed on the leaderboard
router.get("/getlevels", (req, res) => {
  User.find({}, { _id: 1, teamname: 1, points: 1, lastLevelCrackedAt: 1 })
    .sort({ points: -1, lastLevelCrackedAt: 1 })
    .limit(50)
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
