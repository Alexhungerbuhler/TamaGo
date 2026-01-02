import User from "../models/User.js";
import Tamagotchi from "../models/Tamagotchi.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploader.js";

/**
 * Upload d'un avatar pour l'utilisateur connecté
 */
export async function uploadAvatar(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }

    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // Upload vers Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "tamago/avatars");

    // Mettre à jour l'utilisateur
    const user = await User.findById(req.user._id);
    
    // Supprimer l'ancienne image si elle existe
    if (user.avatarUrl && user.cloudinaryPublicId) {
      await deleteFromCloudinary(user.cloudinaryPublicId);
    }

    user.avatarUrl = result.secure_url;
    user.cloudinaryPublicId = result.public_id;
    await user.save();

    res.json({
      message: "Avatar uploaded successfully",
      avatarUrl: result.secure_url,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Suppression de l'avatar de l'utilisateur connecté
 */
export async function deleteAvatar(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }

    const user = await User.findById(req.user._id);

    if (!user.avatarUrl) {
      return res.status(404).send("No avatar to delete");
    }

    // Supprimer de Cloudinary
    if (user.cloudinaryPublicId) {
      await deleteFromCloudinary(user.cloudinaryPublicId);
    }

    user.avatarUrl = null;
    user.cloudinaryPublicId = null;
    await user.save();

    res.json({ message: "Avatar deleted successfully" });
  } catch (err) {
    next(err);
  }
}

/**
 * Upload d'une image pour un pet
 */
export async function uploadPetImage(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }

    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const pet = await Tamagotchi.findById(req.params.id);
    if (!pet) {
      return res.sendStatus(404);
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (pet.owner && pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send("You can only upload images for your own pets");
    }

    // Upload vers Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "tamago/pets");

    // Supprimer l'ancienne image si elle existe
    if (pet.imageUrl && pet.cloudinaryPublicId) {
      await deleteFromCloudinary(pet.cloudinaryPublicId);
    }

    pet.imageUrl = result.secure_url;
    pet.cloudinaryPublicId = result.public_id;
    await pet.save();

    res.json({
      message: "Pet image uploaded successfully",
      imageUrl: result.secure_url,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Suppression de l'image d'un pet
 */
export async function deletePetImage(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }

    const pet = await Tamagotchi.findById(req.params.id);
    if (!pet) {
      return res.sendStatus(404);
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (pet.owner && pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send("You can only delete images for your own pets");
    }

    if (!pet.imageUrl) {
      return res.status(404).send("No image to delete");
    }

    // Supprimer de Cloudinary
    if (pet.cloudinaryPublicId) {
      await deleteFromCloudinary(pet.cloudinaryPublicId);
    }

    pet.imageUrl = null;
    pet.cloudinaryPublicId = null;
    await pet.save();

    res.json({ message: "Pet image deleted successfully" });
  } catch (err) {
    next(err);
  }
}
