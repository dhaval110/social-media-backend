import express from "express";
import { uploadVideo } from "../helper/upload";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  commentsVideos,
  getVideoById,
  getVideos,
  likeVideos,
  uploadVideos
} from "../controllers/video.controller";

const router = express.Router();

router.post(
  "/upload-video",
  authMiddleware,
  uploadVideo.single("video"),
  uploadVideos
);
router.get("/", authMiddleware, getVideos);
router.get("/like/:id", authMiddleware, likeVideos);
router.post("/comments/:id", authMiddleware, commentsVideos);
router.get("/:id", authMiddleware, getVideoById);

export default router;

/**
 * @swagger
 * /api/video/upload-video:
 *   post:
 *     tags:
 *       - Video
 *     summary: Upload a video
 *     description: Upload a video file to Cloudinary and save metadata to the database. Requires JWT authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file to upload
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 video:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     videoUrl:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request (e.g. missing video file)
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/video:
 *   get:
 *     tags:
 *       - Video
 *     summary: Get all videos
 *     description: Retrieve a list of all videos uploaded by users. Requires JWT authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Videos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 videos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       videoUrl:
 *                         type: string
 *                       thumbnail:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/video/like/{videoId}:
 *   get:
 *     tags:
 *       - Video
 *     summary: Check if the current user has liked the video
 *     description: Returns like status for the authenticated user and the specified video.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the video to check like status for
 *     responses:
 *       200:
 *         description: Like status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                   description: Whether the user liked the video
 *                 likeId:
 *                   type: string
 *                   description: The ID of the like record (if exists)
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/video/comments/{videoId}:
 *   post:
 *     tags:
 *       - Video
 *     summary: Post a comment on a video
 *     description: Allows an authenticated user to add a comment to a specific video.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the video to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The content of the comment
 *             required:
 *               - text
 *     responses:
 *       201:
 *         description: Comment posted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 comment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     text:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     videoId:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request (e.g. missing text)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/video/{id}:
 *   get:
 *     tags:
 *       - Video
 *     summary: Get a video by ID
 *     description: Fetch a single video by its unique ID. Requires JWT authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the video
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Video Fetched
 *                 video:
 *                   $ref: '#/components/schemas/Video'
 *       401:
 *         description: Unauthorized - JWT missing or invalid
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: video failed
 */
