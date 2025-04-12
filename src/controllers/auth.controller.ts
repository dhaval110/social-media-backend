import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserData } from "../types/user";
import crypto from "crypto";
import { transporter } from "../utils/sendEmail";
import {
  EMAIL_USER,
  SECRET_KEY,
  BASE_URL,
  GOOGLE_CLIENT_ID
} from "../config/env";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password }: UserData = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword ?? "",
        ...(name && { name })
      }
    });

    if (!SECRET_KEY) {
      console.error("JWT_SECRET is not set in the environment variables");
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email },
      SECRET_KEY,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({ message: "User successfully registered", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as UserData;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password ?? ""))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (!SECRET_KEY) {
      console.error("JWT_SECRET is not set in the environment variables");
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email },
      SECRET_KEY,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Error logging in"
    });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 15);

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry
      }
    });

    const resetLink = `${BASE_URL}/reset-redirect?token=${token}`;

    await transporter.sendMail({
      from: `"Jay" <${EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Link",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `
    });

    return res.status(200).json({ message: "Reset link sent to your email" });
  } catch (error: any) {
    console.error("Reset Error:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date()
        }
      }
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(401).send("Invalid token");

    const { email, name, picture } = payload;

    let existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const newUser = await prisma.user.create({
      data: {
        email: email ?? "",
        profile_pic: picture ?? "",
        ...(name && { name })
      }
    });

    const token = jwt.sign(
      { userId: newUser.id, name: newUser.name, email: newUser.email },
      SECRET_KEY!,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({ message: "User successfully Signup", token });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Login failed");
  }
};
