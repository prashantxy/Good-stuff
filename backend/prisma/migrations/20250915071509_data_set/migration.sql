-- CreateTable
CREATE TABLE "public"."Trip" (
    "id" TEXT NOT NULL,
    "booking_user_id" TEXT NOT NULL,
    "pickup_lat" DOUBLE PRECISION,
    "pickup_lon" DOUBLE PRECISION,
    "dropoff_lat" DOUBLE PRECISION,
    "dropoff_lon" DOUBLE PRECISION,
    "pickup_address" TEXT,
    "dropoff_address" TEXT,
    "pickup_time" TIMESTAMP(3),
    "dropoff_time" TIMESTAMP(3),
    "riders_count" INTEGER,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "age" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Rider" (
    "id" SERIAL NOT NULL,
    "trip_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Rider_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Rider" ADD CONSTRAINT "Rider_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rider" ADD CONSTRAINT "Rider_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
