import express from "express";
import dotenv from "dotenv";
import { PORT } from "./config/env";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import videoRoutes from "./routes/video.route";
import errorHandler from "./middlewares/errorHandler";
import { setupSwagger } from "./utils/swagger";
import "./types/express";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

setupSwagger(app);
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/video", videoRoutes);

app.get("/reset-redirect", (req, res) => {
  const { token } = req.query;
  const deepLink = `initialproject://reset-password/${token}`;
  res.redirect(deepLink);
});

app.get("/", (req, res) => {
  try {
    res.status(200).json("Welcome React Native Backend APIs");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
