/*
  Warnings:

  - Added the required column `thumbnail` to the `Element` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Element" ADD COLUMN     "thumbnail" TEXT NOT NULL;
