import { PrismaClient } from "@prisma/client";
import xlsx from "xlsx";
import path from "path";

const prisma = new PrismaClient();

type ExcelRow = Record<string, any>;

function parseExcelDate(value: any) {
  if (!value) return null;
  if (typeof value === "number") {
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

async function main() {
  const workbook = xlsx.readFile(path.join("data", "FetiiAI_Data_Austin.xlsx"));
  const [tripName, riderName, demoName] = workbook.SheetNames;

  const tripSheet = xlsx.utils.sheet_to_json<ExcelRow>(workbook.Sheets[tripName]);
  const riderSheet = xlsx.utils.sheet_to_json<ExcelRow>(workbook.Sheets[riderName]);
  const demoSheet = xlsx.utils.sheet_to_json<ExcelRow>(workbook.Sheets[demoName]);

  console.log("Trip headers:", Object.keys(tripSheet[0]));
  console.log("Rider headers:", Object.keys(riderSheet[0]));
  console.log("Demo headers:", Object.keys(demoSheet[0]));

  await prisma.rider.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();

  const userMap = new Map<string, number | null>();

  for (const row of demoSheet) {
    const userId = row["User ID"] || row["user_id"];
    const ageValue = row["Age"] || row["age"];
    if (userId) {
      userMap.set(userId.toString(), ageValue ? Number(ageValue) : null);
    }
  }

  for (const row of tripSheet) {
    const bookingId = row["Booking User ID"] || row["booking_user_id"];
    if (bookingId && !userMap.has(bookingId.toString())) {
      userMap.set(bookingId.toString(), null);
    }
  }

  const usersData = Array.from(userMap.entries()).map(([id, age]) => ({ id, age }));

  await prisma.user.createMany({ data: usersData, skipDuplicates: true });

  const tripsData = tripSheet.map((row) => ({
    id: String(row["Trip ID"] || row["trip_id"]),
    booking_user_id: (row["Booking User ID"] || row["booking_user_id"] || "").toString(),
    pickup_address: row["Pick Up Address"] || row["pickup_address"] || null,
    dropoff_address: row["Drop Off Address"] || row["dropoff_address"] || null,
    pickup_lat: row["Pick Up Latitude"] ? Number(row["Pick Up Latitude"]) : null,
    pickup_lon: row["Pick Up Longitude"] ? Number(row["Pick Up Longitude"]) : null,
    dropoff_lat: row["Drop Off Latitude"] ? Number(row["Drop Off Latitude"]) : null,
    dropoff_lon: row["Drop Off Longitude"] ? Number(row["Drop Off Longitude"]) : null,
    pickup_time: parseExcelDate(row["Trip Date and Time"] || row["trip_date_time"]),
    dropoff_time: null,
    riders_count: row["Total Passengers"] ? Number(row["Total Passengers"]) : null,
  }));

  await prisma.trip.createMany({ data: tripsData, skipDuplicates: true });

  const ridersData = riderSheet.map((row) => ({
    trip_id: String(row["Trip ID"] || row["trip_id"]),
    user_id: (row["User ID"] || row["user_id"] || "").toString(),
  }));

  await prisma.rider.createMany({ data: ridersData, skipDuplicates: true });

  console.log("✅ Data ingested into Postgres successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
