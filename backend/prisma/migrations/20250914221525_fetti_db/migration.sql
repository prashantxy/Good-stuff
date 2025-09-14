-- CreateTable
CREATE TABLE "public"."Trip" (
    "trip_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pickup_address" TEXT,
    "dropoff_address" TEXT,
    "pickup_lat" DOUBLE PRECISION,
    "pickup_lon" DOUBLE PRECISION,
    "dropoff_lat" DOUBLE PRECISION,
    "dropoff_lon" DOUBLE PRECISION,
    "pickup_time" TIMESTAMP(3),
    "dropoff_time" TIMESTAMP(3),
    "riders_count" INTEGER,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("trip_id")
);

-- CreateTable
CREATE TABLE "public"."Rider" (
    "id" SERIAL NOT NULL,
    "trip_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Rider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Demographic" (
    "user_id" TEXT NOT NULL,
    "age" INTEGER,

    CONSTRAINT "Demographic_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "public"."Rider" ADD CONSTRAINT "Rider_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."Trip"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;
