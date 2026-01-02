import * as dotenv from "dotenv";

dotenv.config();

export const bcryptCostFactor = 10;
export const databaseUrl =
  process.env.DATABASE_URL || "mongodb://localhost/tama-go";
export const port = process.env.PORT || 3000;
export const secretKey = process.env.SECRET_KEY;
export const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
export const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
export const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

if (!secretKey) {
  throw new Error("SECRET_KEY environment variable is not set.");
}

// Validate that port is a positive integer.
if (process.env.PORT) {
  const parsedPort = parseInt(process.env.PORT, 10);
  if (!Number.isInteger(parsedPort)) {
    throw new Error("Environment variable $PORT must be an integer");
  } else if (parsedPort < 1 || parsedPort > 65535) {
    throw new Error("Environment variable $PORT must be a valid port number");
  }
}