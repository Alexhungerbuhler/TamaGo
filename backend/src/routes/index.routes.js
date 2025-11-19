import express from "express";

const router = express.Router();

function homePage(req, res, next) {
  res.send("YEAHHHH!!!!!!!");
}

router.get("/", homePage);

export default router;
