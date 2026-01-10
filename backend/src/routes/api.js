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
  updatePet,
} from "../api/pets.js";
import { getGame, listGames, playGame } from "../api/games.js";
import { getGlobalStats, getUserStats, getPetStats as getPetStatsAPI, incrementPoopsCount, incrementGamesCount } from "../api/stats.js";
import { manualTick } from "../api/tick.js";
import {
  uploadAvatar,
  deleteAvatar,
  uploadPetImage,
  deletePetImage,
} from "../api/uploads.js";
import { getWorldMap } from "../api/world.js";
import { authenticate, optionalAuthenticate } from "../utils/jwt.js";
import { upload } from "../utils/uploader.js";

const router = express.Router();

// Health
router.get("/", (_req, res) => res.send("API OK"));

// Auth (core)
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);

// Users (uploads)
router.post("/users/avatar", authenticate, upload.single("avatar"), uploadAvatar);
router.delete("/users/avatar", authenticate, deleteAvatar);

// Pets (core resource)
router.get("/pets", optionalAuthenticate, listPets);           // GET /api/pets?userId=&page=&limit=
router.post("/pets", authenticate, createPet);                 // POST /api/pets (protected)
router.get("/pets/:id", getPet);                               // GET /api/pets/:id
router.patch("/pets/:id", authenticate, updatePet);            // PATCH /api/pets/:id (protected)
router.delete("/pets/:id", authenticate, deletePet);           // DELETE /api/pets/:id (protected)

// Pet actions (stat updates - all protected)
router.post("/pets/:id/eat", authenticate, feedPet);
router.post("/pets/:id/toilet", authenticate, toiletPet);
router.post("/pets/:id/sleep", authenticate, sleepPet);
router.post("/pets/:id/play", authenticate, playPet);
router.post("/pets/:id/move", authenticate, movePet);
router.get("/pets/:id/stats", getPetStats);

// Pet uploads (images)
router.post("/pets/:id/image", authenticate, upload.single("image"), uploadPetImage);
router.delete("/pets/:id/image", authenticate, deletePetImage);

// Games
router.get("/games", listGames);                               // GET /api/games (list all games)
router.get("/games/:gameId", getGame);                         // GET /api/games/:gameId (get game details)
router.post("/pets/:id/play-game", authenticate, playGame);    // POST /api/pets/:id/play-game (play a game)

// World / map
router.get("/world/map", getWorldMap);

// Statistics (aggregation endpoints)
router.get("/stats", getGlobalStats);                          // GET /api/stats (global statistics)
router.get("/stats/users/:userId", authenticate, getUserStats); // GET /api/stats/users/:userId (user statistics)
router.get("/stats/pets/:petId", getPetStatsAPI);              // GET /api/stats/pets/:petId (pet statistics)
router.post("/stats/pets/:petId/poops", authenticate, incrementPoopsCount); // POST /api/stats/pets/:petId/poops (increment poops count)
router.post("/stats/pets/:petId/games", authenticate, incrementGamesCount); // POST /api/stats/pets/:petId/games (increment games count)

// Tick system (manual trigger)
router.post("/tick", manualTick);

export default router;

