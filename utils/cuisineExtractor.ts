/**
 * Utility functions for extracting cuisine information from text
 */

/**
 * Extract cuisine types from restaurant details text
 * Looks for common cuisine keywords and patterns
 */
export function extractCuisineTypes(text: string, restaurantName?: string): string[] {
    if (!text) return [];

    const cuisines: Set<string> = new Set();
    const lowerText = text.toLowerCase();

    // Common cuisine patterns
    const cuisinePatterns = [
        // Explicit patterns
        /cuisine[s]?:\s*([^.\n]+)/gi,
        /type[s]?:\s*([^.\n]+)/gi,
        /serves?\s+([^.\n]+?)\s+(?:food|cuisine|dishes)/gi,
        /specializes?\s+in\s+([^.\n]+)/gi,

        // Direct mentions
        /\b(italian|chinese|japanese|korean|thai|vietnamese|indian|mexican|french|greek|spanish|mediterranean|american|british|german|turkish|lebanese|moroccan|ethiopian|brazilian|peruvian|argentinian|cuban)\b/gi,
        /\b(sushi|ramen|pizza|pasta|burger|bbq|barbecue|steakhouse|seafood|vegan|vegetarian|fusion|tapas|dim sum|pho|curry|noodles|dumplings|tacos|burritos|kebab|falafel|shawarma)\b/gi,
    ];

    cuisinePatterns.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            const captured = match[1] || match[0];
            // Clean up the captured text
            const cleaned = captured
                .replace(/\b(and|or|with|the|a|an|restaurant|food|cuisine|dishes?|style)\b/gi, '')
                .replace(/[,;]/g, ' ')
                .trim();

            if (cleaned) {
                // Split by spaces and add each word as a cuisine
                cleaned.split(/\s+/).forEach(word => {
                    if (word.length > 2) { // Ignore very short words
                        cuisines.add(capitalize(word));
                    }
                });
            }
        }
    });

    // Fallback: Try to infer from restaurant name
    if (cuisines.size === 0 && restaurantName) {
        const nameInferred = inferCuisineFromName(restaurantName);
        nameInferred.forEach(c => cuisines.add(c));
    }

    // If still no cuisines found, return a generic category
    if (cuisines.size === 0) {
        return ['Restaurant'];
    }

    return Array.from(cuisines).slice(0, 5); // Limit to 5 cuisines
}

/**
 * Try to infer cuisine type from restaurant name
 */
function inferCuisineFromName(name: string): string[] {
    const lowerName = name.toLowerCase();
    const cuisines: string[] = [];

    const namePatterns: Record<string, string> = {
        'sushi': 'Japanese',
        'ramen': 'Japanese',
        'pizza': 'Italian',
        'pasta': 'Italian',
        'taco': 'Mexican',
        'burrito': 'Mexican',
        'curry': 'Indian',
        'pho': 'Vietnamese',
        'dim sum': 'Chinese',
        'bbq': 'Barbecue',
        'steakhouse': 'Steakhouse',
        'burger': 'American',
        'cafe': 'Cafe',
        'bistro': 'French',
        'trattoria': 'Italian',
        'izakaya': 'Japanese',
    };

    Object.entries(namePatterns).forEach(([keyword, cuisine]) => {
        if (lowerName.includes(keyword)) {
            cuisines.push(cuisine);
        }
    });

    return cuisines;
}

/**
 * Capitalize first letter of a word
 */
function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
