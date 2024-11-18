/*
  Warnings:

  - The primary key for the `user_table` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `user_table` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_email]` on the table `user_table` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `user_id` on the `user_table` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "user_schema"."Role" AS ENUM ('MEMBER', 'ADMIN');

-- DropIndex
DROP INDEX "user_schema"."user_table_email_key";

-- AlterTable
ALTER TABLE "user_schema"."user_table" DROP CONSTRAINT "user_table_pkey",
DROP COLUMN "email",
ADD COLUMN     "user_date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_role" "user_schema"."Role" NOT NULL DEFAULT 'MEMBER',
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "user_table_pkey" PRIMARY KEY ("user_id");

-- CreateTable
CREATE TABLE "user_schema"."note_table" (
    "note_id" UUID NOT NULL,
    "note_text" TEXT NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "note_table_pkey" PRIMARY KEY ("note_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_table_user_email_key" ON "user_schema"."user_table"("user_email");

-- AddForeignKey
ALTER TABLE "user_schema"."note_table" ADD CONSTRAINT "note_table_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_schema"."user_table"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
