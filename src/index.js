require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { fetchGenres } = require("./utils/getGenres");
const rateLimit = require("express-rate-limit");
const {
  HomeScreen,
  SearchScreen,
  DiscoverScreen,
  MediaDetails,
} = require("./routes");
const mediaDetails = require("./routes/mediaDetails");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(morgan("dev"));

const limiter = rateLimit({
  max: 1000000000000,
  windowMs: 60 * 60 * 1000, // In one hour
  message: "Too many Requests from this IP, please try again in an hour!",
});

app.use("/", limiter);
//app.disable("etag");

app.use("/home-screen", HomeScreen);
app.use("/search", SearchScreen);
// app.use("/recommendations", Recommendaitions);
app.use("/discover", DiscoverScreen);
app.use("/details", MediaDetails);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
  fetchGenres();
});

module.exports = app;
