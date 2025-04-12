import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const uploadVideos = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const videoUrl = req.file?.path ?? "";

    const thumbnail = videoUrl
      .replace("/upload/", "/upload/so_1,c_fill,w_300,h_300/")
      .replace(/\.(webm|mp4|mov)$/, ".jpg");

    const newVideo = await prisma.video.create({
      data: {
        title,
        description,
        thumbnail,
        videoUrl,
        userId: req.user?.userId ?? ""
      }
    });

    res.status(200).json({ message: "Video uploaded", video: newVideo });
  } catch (error: any) {
    console.error("Video upload error:", error);
    res.status(500).json({ error: error.message || "Upload failed" });
  }
};

export const getVideos = async (req: Request, res: Response) => {
  try {
    const videos = await prisma.video.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile_pic: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_pic: true
              }
            }
          }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_pic: true
              }
            }
          }
        }
        // likes: true
      }
    });

    res.status(200).json({ message: " Videos retrieved", videos });
  } catch (error: any) {
    console.error("Video upload error:", error);
    res.status(500).json({ error: error.message || "Get failed" });
  }
};

export const likeVideos = async (req: Request, res: Response) => {
  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId: req.user?.userId ?? "",
          videoId: req.params.id
        }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_videoId: {
            userId: req.user?.userId ?? "",
            videoId: req.params.id
          }
        }
      });

      res.status(200).json({ message: "Video disLiked" });
    } else {
      await prisma.like.create({
        data: {
          userId: req.user?.userId ?? "",
          videoId: req.params.id
        }
      });

      res.status(200).json({ message: "Video liked" });
    }
  } catch (error: any) {
    console.error("Video like error:", error);
    res.status(500).json({ error: error.message || "Like failed" });
  }
};

export const commentsVideos = async (req: Request, res: Response) => {
  try {
    await prisma.comment.create({
      data: {
        text: req.body.text,
        userId: req.user?.userId ?? "",
        videoId: req.params.id
      }
    });

    res.status(200).json({ message: "Comment added" });
  } catch (error: any) {
    console.error("Video Comment error:", error);
    res.status(500).json({ error: error.message || "Comment failed" });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: {
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_pic: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_pic: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({ message: "Video Fetched", video });
  } catch (error: any) {
    console.error("Video Fetched error:", error);
    res.status(500).json({ error: error.message || "video failed" });
  }
};
