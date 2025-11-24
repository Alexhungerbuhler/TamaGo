
import express from "express";
import createError from "http-errors";
import logger from "morgan";
import mongoose from "mongoose";

import * as config from "../config.js";
import indexRouter from "./routes/index.routes.js";
import usersRouter from "./routes/users.routes.js";

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

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.warn(err);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error status
  res.status(err.status || 500);
  res.send(err.message);
});

export default app;
