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
      take: 10,
      include: { riders: { include: { user: true } } },
    });

    const users = await prisma.user.findMany({ take: 10 });

    const prompt = `
You are a data assistant for a ride-sharing company (Fetii).
The database has:
- Trip(id, booking_user_id, pickup_address, dropoff_address, pickup_time, dropoff_time, riders_count)
- Rider(trip_id, user_id)
- User(id, age)

The user asked: "${question}"

Here are some example rows from Trips: ${JSON.stringify(trips, null, 2)}
Here are some example rows from Users: ${JSON.stringify(users, null, 2)}

Answer only the final result, in plain language, without SQL or long explanations.
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
