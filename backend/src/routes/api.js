import express from "express";

import { login, logout, register } from "../api/auth.js";
import {
  createPet,
  deletePet,
  feedPet,
  getPet,
  getPetStats,
  listPets,
  movePet,
  playPet,
  sleepPet,
  toiletPet,
} from "../api/pets.js";
import { manualTick } from "../api/tick.js";
import { getWorldMap } from "../api/world.js";

const router = express.Router();

// Health
router.get("/", (_req, res) => res.send("API OK"));

// Auth (core)
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);

// Users (placeholder for future user profile endpoints)
// e.g., router.get("/users/:id", getUserProfile)

// Pets (core resource)
router.get("/pets", listPets);           // GET /api/pets?userId=
router.post("/pets", createPet);         // POST /api/pets
router.get("/pets/:id", getPet);         // GET /api/pets/:id
router.delete("/pets/:id", deletePet);   // DELETE /api/pets/:id

// Pet actions (stat updates)
router.post("/pets/:id/eat", feedPet);
router.post("/pets/:id/toilet", toiletPet);
router.post("/pets/:id/sleep", sleepPet);
router.post("/pets/:id/play", playPet);
router.post("/pets/:id/move", movePet);
router.get("/pets/:id/stats", getPetStats);

// World / map
router.get("/world/map", getWorldMap);

// Tick system (manual trigger)
router.post("/tick", manualTick);

export default router;

