const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

//Init Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//Connect Database
connectDB();

app.get("/", (req, res) =>
  res.send({ success: true, message: "Welcome to o-slash REST service :)" })
);

// routes

const auth = require("./routes/api/auth");

app.use("/api/auth/v1/", auth);

module.exports = app;
