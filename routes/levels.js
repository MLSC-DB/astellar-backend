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
  const { _id, link, fileURL, answer, question, password } = req.body;

  if (password === "rauchak") {
    bcrypt.hash(answer, 10).then((hashedAnswer) => {
      const newLevel = new Level({
        _id,
        link,
        fileURL,
        question,
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
  Level.findById(req.team.atlevel)
    .then((level) => {
      res.status(200).json({
        _id: level._id,
        question: level.question,
        fileURL: level.fileURL,
        link: level.link,
      });
    })
    .catch((err) => {
      res.json({
        err: "Sorry.there was a network error while showing level",
      });
    });
});

router.post("/answer", authorization, (req, res) => {
  const answer = req.body.answer;
  const question = req.headers["question-headers"];
  Level.findById(question).then((ans) => {
    User.findById(req.team._id).then((level) => {
      bcrypt.compare(answer, ans.answer).then((isMatch) => {
        if (isMatch) {
          User.findByIdAndUpdate(
            req.team._id,
            {
              $set: {
                atlevel: level.atlevel + 1, //Updating level
                lastLevelCrackedAt: Date.now(), //Updating the time of last cracked level
              },
            },
            {
              new: true,
              runValidators: true,
            }
          )
            .populate("atLevel", ["_id", "hint", "question"])
            .then((newLevel) => {
              res.status(200).json("Correct Answer!");
            });
        } else {
          return res.status(400).json({
            errors: [{ msg: "Incorrect answer" }],
          });
        }
      });
    });
  });
});

//Fectching users to be displayed on the leaderboard
router.get("/getlevels", (req, res) => {
  User.find({}, { _id: 1, teamname: 1, atlevel: 1, lastLevelCrackedAt: 1 })
    .sort({ atlevel: -1, lastLevelCrackedAt: 1 })
    .limit(51)
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
