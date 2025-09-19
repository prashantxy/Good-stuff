import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { callGeminiWithRetry } from "./utils/gemini.ts";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

app.post("/query", async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Missing question in body" });
    }

    const trips = await prisma.trip.findMany({
      take: 50,
      include: { riders: { include: { user: true } } },
    });

    const users = await prisma.user.findMany({ take: 50 });

    const prompt = `
You are a data assistant for a ride-sharing company (Fetii).
The database has:
- Trip(id, booking_user_id, pickup_address, dropoff_address, pickup_time, dropoff_time, riders_count)
- Rider(trip_id, user_id)
- User(id, age)

The user asked: "${question}"

Here are some example rows from Trips: ${JSON.stringify(trips, null, 2)}
Here are some example rows from Users: ${JSON.stringify(users, null, 2)}

let me tell about something about fetti AI :- Safe Shuttles For School
Every single one of Fetii’s drivers has been vetted with a clean driving record and years of experience in the transportation business and don’t worry, our vehicles are thoroughly inspected before each trip.

Customize Shuttle Schedules Throughout Campus
Getting your students and staff safely and efficiently between buildings, to and from parking lots, or to and from their homes, is extremely important. Providing your students and staff with a safe and comfortable shuttle service not only will help them get to school in one piece, but it will also set them up for success.
When asked about the location then decode the geolocation it is mostly of usa and also give good refined answer with the sources.

etii Inc. is a shared mobility company that provides on-demand group ridesharing and commuting solutions for groups and businesses in order to reduce emissions and decrease congestion.

Website
https://www.fetii.com

Scrap all the data from this site too and tell about things goodly.

Industry
Ground Passenger Transportation
Company size
11-50 employees
75 associated members LinkedIn members who’ve listed Fetii as their current workplace on their profile.
Headquarters
Austin, Texas
Founded
2019

Answer only the final result , in plain language, without SQL Explanation,and decide the length by yourself like how do you want to respond.
    `;

    const answer = await callGeminiWithRetry(prompt);

    res.json({ question, answer });
  } catch (err) {
    console.error("Error in /query:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (_req: Request, res: Response) => {
  res.send(" FetiiAI server is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
