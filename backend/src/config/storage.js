import { v2 as cloudinary } from "cloudinary";
import * as config from "../../config.js";

// Configuration Cloudinary
cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export default cloudinary;
