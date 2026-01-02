import Tamagotchi from "../models/Tamagotchi.js";
import User from "../models/User.js";

/**
 * Statistiques globales du système via agrégation MongoDB
 */
export async function getGlobalStats(req, res, next) {
  try {
    // Statistiques de base
    const totalPets = await Tamagotchi.countDocuments();
    const totalUsers = await User.countDocuments();

    // Agrégation 1: Nombre de pets par utilisateur
    const petsPerUser = await Tamagotchi.aggregate([
      {
        $match: { owner: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: "$owner",
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          avgPetsPerUser: { $avg: "$count" },
          maxPetsPerUser: { $max: "$count" },
          minPetsPerUser: { $min: "$count" },
        },
      },
    ]);

    // Agrégation 2: Statistiques moyennes des pets
    const avgStats = await Tamagotchi.aggregate([
      {
        $group: {
          _id: null,
          avgLevel: { $avg: "$level" },
          avgHunger: { $avg: "$hunger" },
          avgHygiene: { $avg: "$hygiene" },
          avgEnergy: { $avg: "$energy" },
          avgFun: { $avg: "$fun" },
          maxLevel: { $max: "$level" },
        },
      },
    ]);

    // Agrégation 3: Distribution des pets par niveau
    const levelDistribution = await Tamagotchi.aggregate([
      {
        $group: {
          _id: "$level",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Agrégation 4: Top 5 utilisateurs avec le plus de pets
    const topUsers = await Tamagotchi.aggregate([
      {
        $match: { owner: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: "$owner",
          petCount: { $sum: 1 },
          totalLevel: { $sum: "$level" },
          avgHunger: { $avg: "$hunger" },
        },
      },
      {
        $sort: { petCount: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          userId: "$_id",
          userName: "$userInfo.name",
          petCount: 1,
          totalLevel: 1,
          avgHunger: { $round: ["$avgHunger", 2] },
        },
      },
    ]);

    // Agrégation 5: Pets en danger (stats basses)
    const petsInDanger = await Tamagotchi.aggregate([
      {
        $match: {
          $or: [
            { hunger: { $lt: 30 } },
            { hygiene: { $lt: 30 } },
            { energy: { $lt: 30 } },
            { fun: { $lt: 30 } },
          ],
        },
      },
      {
        $count: "count",
      },
    ]);

    res.json({
      summary: {
        totalPets,
        totalUsers,
        petsInDanger: petsInDanger[0]?.count || 0,
      },
      petsPerUser: petsPerUser[0] || {
        avgPetsPerUser: 0,
        maxPetsPerUser: 0,
        minPetsPerUser: 0,
      },
      averageStats: avgStats[0] || {
        avgLevel: 0,
        avgHunger: 0,
        avgHygiene: 0,
        avgEnergy: 0,
        avgFun: 0,
        maxLevel: 0,
      },
      levelDistribution,
      topUsers,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Statistiques personnelles d'un utilisateur
 */
export async function getUserStats(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }

    const userId = req.params.userId || req.user._id;

    // Vérifier que l'utilisateur demande ses propres stats ou est admin
    if (userId.toString() !== req.user._id.toString()) {
      return res.status(403).send("You can only view your own statistics");
    }

    // Agrégation: Statistiques des pets de l'utilisateur
    const userPetStats = await Tamagotchi.aggregate([
      {
        $match: { owner: userId },
      },
      {
        $group: {
          _id: null,
          totalPets: { $sum: 1 },
          totalLevel: { $sum: "$level" },
          avgLevel: { $avg: "$level" },
          avgHunger: { $avg: "$hunger" },
          avgHygiene: { $avg: "$hygiene" },
          avgEnergy: { $avg: "$energy" },
          avgFun: { $avg: "$fun" },
          highestLevel: { $max: "$level" },
        },
      },
    ]);

    // Pets en danger pour cet utilisateur
    const userPetsInDanger = await Tamagotchi.countDocuments({
      owner: userId,
      $or: [
        { hunger: { $lt: 30 } },
        { hygiene: { $lt: 30 } },
        { energy: { $lt: 30 } },
        { fun: { $lt: 30 } },
      ],
    });

    res.json({
      userId,
      stats: userPetStats[0] || {
        totalPets: 0,
        totalLevel: 0,
        avgLevel: 0,
        avgHunger: 0,
        avgHygiene: 0,
        avgEnergy: 0,
        avgFun: 0,
        highestLevel: 0,
      },
      petsInDanger: userPetsInDanger,
    });
  } catch (err) {
    next(err);
  }
}
