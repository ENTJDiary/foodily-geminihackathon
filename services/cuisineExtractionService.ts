import { GoogleGenAI, Type } from "@google/genai";

/**
 * Extract structured cuisine and food type from a search query using Gemini
 */
export const extractCuisineFromSearch = async (
    searchQuery: string
): Promise<{ cuisine: string; foodType: string }> => {
    try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

        const prompt = `Analyze this food search query and extract the cuisine type and specific food type.

Search query: "${searchQuery}"

Rules:
- cuisine: The broad cuisine category (e.g., "Italian", "Japanese", "Mexican", "American", "Chinese")
- foodType: The specific dish or food item (e.g., "Pizza", "Ramen", "Tacos", "Burger", "Dumplings")
- If the query is vague (e.g., "food", "restaurant"), use "General" for cuisine and "Exploring" for foodType
- If only cuisine is mentioned (e.g., "Italian food"), use that cuisine and "General" for foodType
- Be consistent with cuisine names (use standard English names)

Return ONLY a JSON object with "cuisine" and "foodType" fields.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        cuisine: { type: Type.STRING },
                        foodType: { type: Type.STRING }
                    },
                    required: ["cuisine", "foodType"]
                }
            }
        });

        const result = JSON.parse(response.text || '{"cuisine":"General","foodType":"Exploring"}');

        console.log(`🔍 [CuisineExtraction] "${searchQuery}" → Cuisine: "${result.cuisine}", FoodType: "${result.foodType}"`);

        return {
            cuisine: result.cuisine || 'General',
            foodType: result.foodType || 'Exploring'
        };
    } catch (error) {
        console.error('❌ [CuisineExtraction] Error extracting cuisine:', error);
        // Fallback to using the search query as-is
        return {
            cuisine: searchQuery || 'General',
            foodType: searchQuery || 'Exploring'
        };
    }
};
