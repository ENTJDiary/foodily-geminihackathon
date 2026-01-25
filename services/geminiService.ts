
import { GoogleGenAI, Type } from "@google/genai";
import { Location, SearchResult, HistoryEntry, GroundingChunk } from "../types";

// Always initialize client with the API key from process.env.API_KEY
export const searchRestaurantsByMaps = async (
  query: string,
  location?: Location,
  dietaryRestrictions: string[] = [],
  excludeNames: string[] = []
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

  if (excludeNames.length > 0) {
    enhancedQuery += ` Do NOT include these restaurants: ${excludeNames.join(', ')}.`;
  }

  // Format prompt to match conciergeChat style for consistent UI display
  const formattedPrompt = `${enhancedQuery}

Provide a brief introduction paragraph explaining the search results, then list 5 restaurant recommendations.

Format each restaurant as a SINGLE bullet point with this structure:
* **Restaurant Name** - Brief description including why it fits, key vibe/atmosphere, and what makes it special (2-3 sentences max).

Keep descriptions concise but informative. Focus on the unique selling points and atmosphere.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: formattedPrompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig,
      systemInstruction: `You are a Food.ily expert. You specialize in finding the perfect restaurants.
Your tone is enthusiastic but efficient. You prefer brevity and clarity.
When listing restaurants, use ONLY the format: * **Restaurant Name** - Description.
Do NOT use sub-bullets or multi-line entries for each restaurant.`,
    },
  });

  // Cast groundingChunks to compatible internal GroundingChunk[] type
  return {
    text: response.text || "No results found.",
    groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [],
  };
};

export const getRestaurantDetails = async (name: string): Promise<SearchResult> => {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s exponential backoff
        console.log(`⏳ Retry attempt ${attempt}/${maxRetries} after ${delay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      console.log(`📡 API Call: getRestaurantDetails for "${name}" (attempt ${attempt + 1}/${maxRetries + 1})`);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a very brief summary, current opening hours, the top 3 popular dishes, and an estimated Price Rating (1-4, where 1 is cheap and 4 is expensive) for the restaurant "${name}". Format the response clearly with headings. PROMINENTLY STATE "Price Rating: X/4" on its own line.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      console.log('✅ API Response received');

      // Validate response
      if (!response || !response.text) {
        throw new Error('Empty response received from API');
      }

      const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];

      console.log(`📊 Response stats: ${response.text.length} chars, ${groundingChunks.length} sources`);

      // Cast groundingChunks to compatible internal GroundingChunk[] type
      return {
        text: response.text,
        groundingChunks,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error(`❌ API Error (attempt ${attempt + 1}/${maxRetries + 1}):`, lastError.message);

      // Don't retry on certain errors
      if (lastError.message.includes('API key') || lastError.message.includes('quota')) {
        console.error('🚫 Non-retryable error detected, failing immediately');
        break;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }
    }
  }

  // If we get here, all retries failed
  const errorMessage = lastError?.message || 'Failed to fetch restaurant details';
  console.error('💥 All retry attempts exhausted:', errorMessage);
  throw new Error(`Unable to load restaurant details: ${errorMessage}`);
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

export const conciergeChat = async (occasion: string, people: string, request: string, locationInput?: string, budget?: number, excludeNames: string[] = [], locationCoords?: Location): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const toolConfig = locationCoords ? {
    retrievalConfig: {
      latLng: {
        latitude: locationCoords.latitude,
        longitude: locationCoords.longitude
      }
    }
  } : undefined;

  let detailedPrompt = `I am planning a dinner for "${occasion}" with "${people}". Specifically: "${request}".`;

  if (locationInput) {
    detailedPrompt += ` The preferred location is "${locationInput}".`;
  } else if (locationCoords) {
    detailedPrompt += ` Search near my current location.`;
  }

  if (budget) {
    detailedPrompt += ` The budget is around $${budget} per person.`;
  }

  if (excludeNames.length > 0) {
    detailedPrompt += ` Do NOT include these restaurants: ${excludeNames.join(', ')}.`;
  }

  const prompt = `${detailedPrompt} 
  Use Google Maps and Google Search to find real, highly-rated restaurants that fit this specific vibe and requirement perfectly. 
  
  Provide a brief introduction paragraph, then list 5 restaurant recommendations.
  
  Format each restaurant as a SINGLE bullet point with this structure:
  * **Restaurant Name** - Brief description including why it fits, key vibe/atmosphere, and what makes it special (2-3 sentences max).
  
  Keep descriptions concise but informative. Focus on the unique selling points and atmosphere.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
      toolConfig,
      systemInstruction: `You are the Food.ily Dining Concierge. You specialize in planning high-end, high-impact dining experiences.
      Your tone is elegant but efficient. You prefer brevity and clarity over flowery language.
      When listing restaurants, use ONLY the format: * **Restaurant Name** - Description.
      Do NOT use sub-bullets or multi-line entries for each restaurant.`,
    }
  });

  // Cast groundingChunks to compatible internal GroundingChunk[] type
  return {
    text: response.text || "I couldn't find the perfect spot. Could you provide more details?",
    groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [],
  };
};
