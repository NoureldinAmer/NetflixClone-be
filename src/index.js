require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { HomeScreen, SearchScreen } = require("./routes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(morgan("dev"));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // In one hour
  message: "Too many Requests from this IP, please try again in an hour!",
});

app.use("/", limiter);

app.use("/home-screen", HomeScreen);
app.use("/search", SearchScreen);
// app.use("/recommendations", Recommendaitions);
//app.use("/upcoming", UpcomingScreen);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

module.exports = app;
