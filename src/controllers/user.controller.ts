import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { UserData } from "../types/user";

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const id = req.user.userId;
    const user = await prisma.user.findUnique({
      where: {
        id
      },
      include: {
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
        },
        videos: true
      }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User Data Fetched successfully.", user });
  } catch (error: unknown) {
    console.error("user error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error"
    });
  }
};

export const UpdateUser = async (req: Request, res: Response) => {
  try {
    const { name, email, location, mobileNumber, status, dob }: UserData =
      req.body;

    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const id = req.user.userId;

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (location) updateData.location = location;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;
    if (status) updateData.status = status;

    if (dob) {
      const parsedDob = new Date(dob);
      if (isNaN(parsedDob.getTime())) {
        return res.status(400).json({ error: "Invalid date format for dob" });
      }
      updateData.dob = parsedDob;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error: any) {
    console.error(error);
    console.log("error", error);
    if (error.code === "P2002") {
      res.status(400).json({ message: "Email already in use" });
      return;
    }
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error: unknown) {
    console.error("DeleteUser error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error."
    });
  }
};

export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const imageUrl = req.file.path;
    const userId = req.params.userId;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { profile_pic: imageUrl }
    } as any);

    res
      .status(200)
      .json({ message: "Profile Picture uploaded successfully", user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const getAllUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany();

    res.status(200).json({
      message: "User data fetched successfully.",
      users
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message });
  }
};

export const getUserByid = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
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
        videos: true
      }
    });

    res.status(200).json({
      message: "User data fetched successfully.",
      user
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message });
  }
};
