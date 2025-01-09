/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `Element` table. All the data in the column will be lost.
  - Added the required column `thumbnail` to the `Map` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Element" DROP COLUMN "thumbnail";

-- AlterTable
ALTER TABLE "Map" ADD COLUMN     "thumbnail" TEXT NOT NULL;
