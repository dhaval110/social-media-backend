/*
  Warnings:

  - The `location` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL,
DROP COLUMN "location",
ADD COLUMN     "location" JSONB;
