import jwt from "jsonwebtoken";
import { promisify } from "node:util";
import * as config from "../../config.js";
import User from "../models/User.js";

const verifyJwt = promisify(jwt.verify);

/**
 * Middleware pour authentifier un utilisateur via JWT.
 * Décode le token et ajoute l'utilisateur à req.user
 */
export async function authenticate(req, res, next) {
  const authorization = req.get("Authorization");
  if (!authorization) {
    return res.status(401).send("Authorization header required");
  }

  const match = authorization.match(/^Bearer (.+)$/);
  if (!match) {
    return res.status(401).send("Authorization header must be a Bearer token");
  }

  const token = match[1];

  try {
    const payload = await verifyJwt(token, config.secretKey);
    const user = await User.findById(payload.sub).exec();
    
    if (!user) {
      return res.status(401).send("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).send("Invalid token");
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).send("Token expired");
    }
    next(err);
  }
}

/**
 * Middleware optionnel pour charger l'utilisateur s'il y a un token,
 * mais ne pas bloquer si absent
 */
export async function optionalAuthenticate(req, res, next) {
  const authorization = req.get("Authorization");
  if (!authorization) {
    return next();
  }

  const match = authorization.match(/^Bearer (.+)$/);
  if (!match) {
    return next();
  }

  const token = match[1];

  try {
    const payload = await verifyJwt(token, config.secretKey);
    const user = await User.findById(payload.sub).exec();
    
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore les erreurs de token pour l'auth optionnelle
  }
  
  next();
}
