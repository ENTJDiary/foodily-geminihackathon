
import { GoogleGenAI, Type } from "@google/genai";
import { Location, SearchResult, HistoryEntry, GroundingChunk } from "../types";

// Always initialize client with the API key from process.env.API_KEY
export const searchRestaurantsByMaps = async (
  query: string,
  location?: Location,
  dietaryRestrictions: string[] = []
): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const toolConfig = location ? {
    retrievalConfig: {
      latLng: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    }
  } : undefined;

  // Enhance prompt with dietary restrictions if provided
  let enhancedQuery = query;
  if (dietaryRestrictions.length > 0) {
    enhancedQuery += ` Ensure results strictly follow these dietary restrictions: ${dietaryRestrictions.join(', ')}.`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: enhancedQuery,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig,
    },
  });

  // Cast groundingChunks to compatible internal GroundingChunk[] type
  return {
    text: response.text || "No results found.",
    groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [],
  };
};

export const getRestaurantDetails = async (name: string): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide a very brief summary, current opening hours, and the top 3 popular dishes for the restaurant "${name}". Format the response clearly with headings.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  // Cast groundingChunks to compatible internal GroundingChunk[] type
  return {
    text: response.text || "No detailed information found.",
    groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [],
  };
};

// In-memory cache for expanded slot options
const slotOptionsCache = new Map<string, string[]>();

export const expandSlotOptions = async (
  targetType: 'cuisine' | 'food',
  constraintValue: string,
  constraintType: 'cuisine' | 'food'
): Promise<string[]> => {
  // Create cache key
  const cacheKey = `${targetType}:${constraintValue.toLowerCase()}`;

  // Return cached result if available
  if (slotOptionsCache.has(cacheKey)) {
    console.log(`Cache hit for ${cacheKey}`);
    return slotOptionsCache.get(cacheKey)!;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Reduced from 25 to 12 for faster response
  const prompt = targetType === 'food'
    ? `List 12 diverse, trending, and mouth-watering food items or dishes that belong to the "${constraintValue}" cuisine. Include both street food and gourmet options. Return ONLY a JSON array of strings.`
    : `List 12 diverse global cuisines or regional cooking styles that are famous for serving "${constraintValue}". Be creative and include niche regional cuisines. Return ONLY a JSON array of strings.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    const result = JSON.parse(response.text || "[]");
    // Cache the result
    slotOptionsCache.set(cacheKey, result);
    return result;
  } catch (e) {
    console.error("Failed to parse AI options", e);
    return [];
  }
};

export const analyzeWeeklyHabits = async (history: HistoryEntry[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const historySummary = history.map(h => `${h.date}: ${h.cuisine} ${h.foodType}`).join(', ');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this user's eating habits over the past week. Provide a very concise, simplified summary in point form using bullet points. Keep each point short, punchy, and easy to read. Suggest a "Next Step" suggestion. History: ${historySummary}`,
  });

  return response.text || "Not enough data to analyze yet!";
};

export const chatWithGemini = async (message: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'You are a world-class food assistant. Your goal is to give precise, appetizing food suggestions, explain cuisines, and help users decide what to eat. Be witty but helpful.',
    }
  });

  const result = await chat.sendMessage({ message });
  return result.text;
};

export const conciergeChat = async (occasion: string, people: string, request: string): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `I am planning a dinner for "${occasion}" with "${people}". Specifically: "${request}". 
  Use Google Maps and Google Search to find real, highly-rated restaurants that fit this specific vibe and requirement perfectly. 
  
  Provide a SIMPLIFIED, CONCISE summary in POINT FORM (bullet points). 
  Do not write long paragraphs. 
  For each suggestion, provide:
  - Name
  - Brief reason why it fits (1 sentence)
  - Key vibe/atmosphere note`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
      systemInstruction: `You are the Food.ily Dining Concierge. You specialize in planning high-end, high-impact dining experiences.
      Your tone is elegant but efficient. You prefer brevity and clarity over flowery language.
      Always provide the Google Maps URI if found.`,
    }
  });

  // Cast groundingChunks to compatible internal GroundingChunk[] type
  return {
    text: response.text || "I couldn't find the perfect spot. Could you provide more details?",
    groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [],
  };
};
