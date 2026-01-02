import multer from "multer";
import cloudinary from "../config/storage.js";

// Configuration Multer pour stocker les fichiers en mémoire
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accepter uniquement les images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

/**
 * Upload un fichier vers Cloudinary
 * @param {Buffer} fileBuffer - Buffer du fichier
 * @param {string} folder - Dossier dans Cloudinary
 * @returns {Promise<Object>} - Résultat de l'upload
 */
export async function uploadToCloudinary(fileBuffer, folder = "tamago") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Supprime une image de Cloudinary
 * @param {string} publicId - ID public de l'image sur Cloudinary
 * @returns {Promise<Object>} - Résultat de la suppression
 */
export async function deleteFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId);
}
