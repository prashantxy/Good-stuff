/*
  Warnings:

  - The primary key for the `Trip` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `trip_id` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the `Demographic` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `booking_user_id` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Rider" DROP CONSTRAINT "Rider_trip_id_fkey";

-- AlterTable
ALTER TABLE "public"."Trip" DROP CONSTRAINT "Trip_pkey",
DROP COLUMN "trip_id",
DROP COLUMN "user_id",
ADD COLUMN     "booking_user_id" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Trip_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "public"."Demographic";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "age" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Rider" ADD CONSTRAINT "Rider_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rider" ADD CONSTRAINT "Rider_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
