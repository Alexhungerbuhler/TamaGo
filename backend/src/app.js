
import express from "express";
import logger from "morgan";
import mongoose from "mongoose";

import * as config from "../config.js";
import apiRouter from "./routes/api.js";

mongoose
  .connect(config.databaseUrl)
  .then(async () => {
    if (process.env.NODE_ENV !== "test") {
      console.log("Mongoose connected to", mongoose.connection.name);
    }
  })
  .catch((err) => {
    console.error("Unable to connect to MongoDB:", err);
  });

const app = express();

if (process.env.NODE_ENV !== "test") {
  app.use(logger("dev"));
}

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});


app
  .use(express.json())
  .use(express.urlencoded({ extended: false }));

app.use("/api", apiRouter);

// basic 404 handler
app.use(function (req, res) {
  res.status(404).send("Not Found");
});

export default app;
