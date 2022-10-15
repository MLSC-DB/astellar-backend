const mongoose = require("mongoose");
const schema = mongoose.Schema;

const levelSchema = new schema({
  _id: {
    type: Number,
  },
  question: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: null,
  },
  answer: {
    type: String,
    required: true,
  },
  fileURL: {
    type: String,
    default: null,
  },
});

const Level = mongoose.model("Level", levelSchema);

module.exports = Level;
