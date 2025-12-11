import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { promisify } from "node:util";

import User from "../models/User.js";
import * as config from "../../config.js";

const signJwt = promisify(jwt.sign);

export async function register(req, res, next) {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).send("name and password are required");
    }

    const existing = await User.findOne({ name }).exec();
    if (existing) {
      return res.status(409).send("user already exists");
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptCostFactor);
    const user = await new User({ name, passwordHash }).save();

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).send("name and password are required");
    }

    const user = await User.findOne({ name }).exec();
    if (!user) {
      return res.status(401).send("invalid credentials");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).send("invalid credentials");
    }

    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
    const token = await signJwt({ sub: user._id, exp }, config.secretKey);

    res.json({ token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  // Stateless JWT logout: the client simply discards its token.
  res.status(204).send();
}

