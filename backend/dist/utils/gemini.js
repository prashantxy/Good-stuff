// utils/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const generationConfig = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
};
const safetySettings = [
    {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
];
export async function callGeminiWithRetry(prompt, maxRetries = 3, delayMs = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(` Gemini API call attempt ${attempt}/${maxRetries}`);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig, //@ts-ignore
                safetySettings,
            });
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            });
            const response = await result.response;
            const text = response.text();
            if (!text || text.trim().length === 0) {
                throw new Error("Empty response from Gemini API");
            }
            console.log(` Gemini API call successful on attempt ${attempt}`);
            console.log(` Response length: ${text.length} characters`);
            return text.trim();
        }
        catch (error) {
            lastError = error;
            console.error(`❌ Gemini API call failed on attempt ${attempt}:`, error?.message || error);
            if (error?.message?.includes("API_KEY") ||
                error?.message?.includes("PERMISSION_DENIED") ||
                error?.message?.includes("QUOTA_EXCEEDED")) {
                console.error("🚫 Non-retryable error detected, stopping retries");
                break;
            }
            if (attempt < maxRetries) {
                const waitTime = delayMs * Math.pow(2, attempt - 1);
                console.log(`⏳ Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    // If all retries failed, throw the last error with context
    throw new Error(`Gemini API failed after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
}
// Function to validate and format responses
export function formatGeminiResponse(rawResponse) {
    // Clean up common formatting issues
    let formatted = rawResponse
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
        .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>') // Code blocks
        .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
        .replace(/\n\s*\n/g, '\n\n') // Clean up extra whitespace
        .trim();
    return formatted;
}
// Function to estimate token count (rough approximation)
export function estimateTokenCount(text) {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
}
// Function to truncate context if too long
export function truncateContext(context, maxTokens = 15000) {
    const estimatedTokens = estimateTokenCount(context);
    if (estimatedTokens <= maxTokens) {
        return context;
    }
    // Calculate how much to keep (with some buffer)
    const keepRatio = (maxTokens * 0.8) / estimatedTokens;
    const keepLength = Math.floor(context.length * keepRatio);
    console.log(`⚠️ Truncating context from ${context.length} to ${keepLength} characters`);
    return context.substring(0, keepLength) + "\n\n[... context truncated for API limits ...]";
}
// Enhanced error handling for different types of API errors
export function handleGeminiError(error) {
    if (error?.message?.includes("SAFETY")) {
        return "I apologize, but I cannot provide a response due to safety guidelines. Please rephrase your question.";
    }
    if (error?.message?.includes("QUOTA_EXCEEDED")) {
        return "I'm currently experiencing high demand. Please try again in a few moments.";
    }
    if (error?.message?.includes("API_KEY")) {
        return "There's an issue with the API configuration. Please contact support.";
    }
    return "I'm having trouble processing your request right now. Please try again or rephrase your question.";
}
