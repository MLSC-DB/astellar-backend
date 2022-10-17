const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const dotenv = require("dotenv");
const { rateLimiterUsingThirdParty } = require("./middleware/rateLimiter");

//Requiring routes
const authUser = require("./routes/auth");
const level = require("./routes/levels");

dotenv.config();

const db = process.env.MONGO_URI;

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Database connected"))
  .catch((err) => {
    console.log(err);
  });

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(bodyParser.json());

app.use(cors());

app.use(cookieParser());
app.use(rateLimiterUsingThirdParty);

app.use("/api/user", authUser);
app.use("/api", level);

const PORT = process.env.PORT || 3001;

var server = app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
