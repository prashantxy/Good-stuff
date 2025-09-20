import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { callGeminiWithRetry } from "./utils/gemini.ts";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const allowedOrigins = [
  'http://localhost:3001',
  'https://fetiiai-hackathon.vercel.app',  
  'https://www.fetiiai-hackathon.vercel.app', 
  'http://localhost:3000', 
];

app.use(cors({
  origin: function(origin, callback) {
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,

  maxAge: 86400 
}));


app.use(express.json({ limit: '10mb' }));

app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Fetii AI Analytics Server is running',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Add CORS headers manually as fallback
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

async function getSmartDataContext(question: string) {
  const questionLower = question.toLowerCase();
  
  let tripsQuery: any = {
    take: 100,
    include: { 
      riders: { 
        include: { 
          user: {
            select: {
              id: true,
              age: true,
             
            }
          } 
        } 
      } 
    },
    orderBy: { pickup_time: 'desc' }
  };

  if (questionLower.includes('peak') || questionLower.includes('hour') || questionLower.includes('time')) {
   
    tripsQuery.where = {
      pickup_time: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
      }
    };
    tripsQuery.take = 200;
  } else if (questionLower.includes('location') || questionLower.includes('area') || questionLower.includes('pickup') || questionLower.includes('drop')) {
    
    tripsQuery.take = 150;
  } else if (questionLower.includes('weekend') || questionLower.includes('weekday') || questionLower.includes('pattern')) {
   
    tripsQuery.where = {
      pickup_time: {
        gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) 
      }
    };
    tripsQuery.take = 300;
  }

  const [trips, users, tripStats] = await Promise.all([
    prisma.trip.findMany(tripsQuery),
    prisma.user.findMany({ 
      take: 100,
      orderBy: { id: 'desc' }
    }),
    
    prisma.trip.aggregate({
      _count: { id: true },
      _avg: { riders_count: true },
      where: {
        pickup_time: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
        }
      }
    })
  ]);

  return { trips, users, tripStats };
}

function generateAnalyticsContext(trips: any[], users: any[], tripStats: any) {
  
  const timeAnalytics = analyzeTimePatterns(trips);
  
  const locationAnalytics = analyzeLocationPatterns(trips);
  
  const userAnalytics = analyzeUserDemographics(users);
  
  const rideAnalytics = analyzeRidePatterns(trips);

  return {
    timeAnalytics,
    locationAnalytics,
    userAnalytics,
    rideAnalytics,
    overallStats: tripStats
  };
}

function analyzeTimePatterns(trips: any[]) {
  const hourCounts: { [key: number]: number } = {};
  const dayOfWeekCounts: { [key: number]: number } = {};
  
  trips.forEach(trip => {
    if (trip.pickup_time) {
      const date = new Date(trip.pickup_time);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1;
    }
  });

  const peakHours = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }));

  return {
    peakHours,
    hourlyDistribution: hourCounts,
    weekdayDistribution: dayOfWeekCounts,
    totalTripsAnalyzed: trips.length
  };
}

function analyzeLocationPatterns(trips: any[]) {
  const pickupCounts: { [key: string]: number } = {};
  const dropoffCounts: { [key: string]: number } = {};
  
  trips.forEach(trip => {
    if (trip.pickup_address) {
      pickupCounts[trip.pickup_address] = (pickupCounts[trip.pickup_address] || 0) + 1;
    }
    if (trip.dropoff_address) {
      dropoffCounts[trip.dropoff_address] = (dropoffCounts[trip.dropoff_address] || 0) + 1;
    }
  });

  const topPickups = Object.entries(pickupCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([location, count]) => ({ location, count }));

  const topDropoffs = Object.entries(dropoffCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([location, count]) => ({ location, count }));

  return {
    topPickupLocations: topPickups,
    topDropoffLocations: topDropoffs,
    uniquePickupLocations: Object.keys(pickupCounts).length,
    uniqueDropoffLocations: Object.keys(dropoffCounts).length
  };
}

function analyzeUserDemographics(users: any[]) {
  const ageCounts: { [key: string]: number } = {};
  const totalUsers = users.length;
  let ageSum = 0;
  let validAgeCount = 0;

  users.forEach(user => {
    if (user.age && user.age > 0) {
      ageSum += user.age;
      validAgeCount++;
      
      if (user.age < 25) ageCounts['18-24'] = (ageCounts['18-24'] || 0) + 1;
      else if (user.age < 35) ageCounts['25-34'] = (ageCounts['25-34'] || 0) + 1;
      else if (user.age < 45) ageCounts['35-44'] = (ageCounts['35-44'] || 0) + 1;
      else if (user.age < 55) ageCounts['45-54'] = (ageCounts['45-54'] || 0) + 1;
      else ageCounts['55+'] = (ageCounts['55+'] || 0) + 1;
    }
  });

  return {
    totalUsers,
    averageAge: validAgeCount > 0 ? Math.round(ageSum / validAgeCount) : null,
    ageDistribution: ageCounts,
    usersWithValidAge: validAgeCount
  };
}

function analyzeRidePatterns(trips: any[]) {
  let totalRiders = 0;
  let totalDuration = 0;
  let validDurationCount = 0;
  const riderCountDistribution: { [key: number]: number } = {};

  trips.forEach(trip => {
    if (trip.riders_count) {
      totalRiders += trip.riders_count;
      riderCountDistribution[trip.riders_count] = (riderCountDistribution[trip.riders_count] || 0) + 1;
    }
    
    if (trip.pickup_time && trip.dropoff_time) {
      const duration = new Date(trip.dropoff_time).getTime() - new Date(trip.pickup_time).getTime();
      const durationMinutes = duration / (1000 * 60);
      if (durationMinutes > 0 && durationMinutes < 300) { // Reasonable duration
        totalDuration += durationMinutes;
        validDurationCount++;
      }
    }
  });

  return {
    averageRidersPerTrip: trips.length > 0 ? Math.round(totalRiders / trips.length * 10) / 10 : 0,
    averageTripDuration: validDurationCount > 0 ? Math.round(totalDuration / validDurationCount) : null,
    riderCountDistribution,
    totalTripsAnalyzed: trips.length
  };
}

app.post("/query", async (req: Request, res: Response) => {
  try {
    console.log(' Query request from origin:', req.headers.origin);
    
    const { question, query } = req.body; 
    const userQuestion = question || query;
    
    if (!userQuestion) {
      return res.status(400).json({ 
        error: "Missing 'question' or 'query' in request body",
        example: { question: "What are the peak rideshare hours in Austin?" }
      });
    }

    const { trips, users, tripStats } = await getSmartDataContext(userQuestion);
    
    const analytics = generateAnalyticsContext(trips, users, tripStats);

    const enhancedPrompt = `
 **FETII AI - INTELLIGENT RIDESHARE ANALYTICS ASSISTANT**

You are Fetii AI, Austin's most advanced rideshare analytics assistant. You have deep knowledge of transportation patterns, user behavior, and market insights.

**ABOUT FETII:**
• **Company:** Fetii Inc. - Shared mobility company (Founded 2019, Austin, Texas)
• **Mission:** On-demand group ridesharing solutions to reduce emissions & decrease congestion
• **Services:** Safe school shuttles, campus transportation, corporate commuting
• **Website:** https://www.fetii.com
• **Team:** 11-50 employees, Ground Passenger Transportation industry
• **Safety Focus:** Vetted drivers with clean records, thoroughly inspected vehicles

**CURRENT DATA INSIGHTS:**
📊 **Time Analytics:**
${JSON.stringify(analytics.timeAnalytics, null, 2)}

📍 **Location Analytics:**
${JSON.stringify(analytics.locationAnalytics, null, 2)}

👥 **User Demographics:**
${JSON.stringify(analytics.userAnalytics, null, 2)}

🚗 **Ride Patterns:**
${JSON.stringify(analytics.rideAnalytics, null, 2)}

📈 **Overall Statistics:**
${JSON.stringify(analytics.overallStats, null, 2)}

**SAMPLE DATA CONTEXT:**
Recent Trips Sample: ${JSON.stringify(trips.slice(0, 5), null, 2)}
User Demographics Sample: ${JSON.stringify(users.slice(0, 5), null, 2)}

**USER QUESTION:** "${userQuestion}"

**RESPONSE GUIDELINES:**
 Provide data-driven insights with specific numbers and percentages
 Use clear, engaging language suitable for business stakeholders
 Include actionable recommendations when relevant
 Reference Austin-specific context and locations when applicable
 Highlight safety and efficiency aspects of Fetii's service
 Use emojis and formatting to make responses visually appealing
 Decode any location data to provide geographical context
 Connect insights to broader transportation and business trends

**RESPONSE FORMAT:**
• Start with a direct answer to the question
• Provide supporting data and analysis
• Include relevant trends or patterns
• End with actionable insights or recommendations

Answer comprehensively but concisely. Be conversational yet professional. Focus on delivering maximum value through data-driven insights.
`;

    console.log("✅ Processing question:", userQuestion);
    console.log("📊 Retrieved", trips.length, "trips and", users.length, "users");
    
    const answer = await callGeminiWithRetry(enhancedPrompt);

    res.json({ 
      question: userQuestion,
      answer,
      response: answer, 
      metadata: {
        dataPoints: {
          tripsAnalyzed: trips.length,
          usersAnalyzed: users.length,
          timeRange: "Last 30 days",
          totalTripsInDB: tripStats._count.id
        },
        analytics: {
          averageRidersPerTrip: analytics.rideAnalytics.averageRidersPerTrip,
          averageTripDuration: analytics.rideAnalytics.averageTripDuration,
          peakHours: analytics.timeAnalytics.peakHours.map(h => `${h.hour}:00`),
          topPickupLocation: analytics.locationAnalytics.topPickupLocations[0]?.location
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error("❌ Error in /query:", err);
    res.status(500).json({ 
      error: "Internal server error",
      message: "Failed to process your question. Please try again.",
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Fetii AI Analytics Server running on http://localhost:${PORT}`);
  console.log(` CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  console.log(` Ready to process intelligent rideshare analytics queries!`);
});