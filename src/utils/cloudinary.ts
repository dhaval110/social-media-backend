import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { API_KEY, CLOUD_NAME, API_SECRET } from "../config/env";

dotenv.config();

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET
});

export default cloudinary;
