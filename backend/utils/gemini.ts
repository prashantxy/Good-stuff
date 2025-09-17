import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function callGeminiWithRetry(prompt: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await model.generateContent(prompt);
      return response.response.text();
    } catch (err: any) {
      if (err.status === 429 && i < retries - 1) {
        const waitTime = 60000; // 1 min backoff
        console.warn(`⚠️ Rate limit hit. Retrying in ${waitTime / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        throw err;
      }
    }
  }
  throw new Error("❌ Max retries reached for Gemini API.");
}
