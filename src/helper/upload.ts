import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./cloudinary";
import path from "path";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: "auto",
    folder: "profile-pics",
    allowed_formats: ["jpg", "png"],
    transformation: [{ width: 300, height: 300, crop: "limit" }]
  } as any
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: "video",
    folder: "reels-videos",
    allowed_formats: ["mp4", "mov", "webm"],
    public_id: (req: unknown, file: { originalname: string }) => {
      const nameWithoutExt = path.parse(file.originalname).name;
      return `video-${Date.now()}-${nameWithoutExt}`;
    }
  } as any
});

export const uploadVideo = multer({ storage: videoStorage });
export const upload = multer({ storage });
