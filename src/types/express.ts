import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email?: string;
        name?: string;
      };
      file?: Express.Multer.File;
    }
  }
}
