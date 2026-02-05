import { FoodLog } from '../services/foodLogsService';
import { UserStats, UserRankings, NutrientAnalysis } from '../services/storageService';

// --- Helpers ---

export const getCurrentMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    };
};

export const getLastMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of last month
    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    };
};

/**
 * Calculate flavor intensity based on cuisine and food type
 * Returns a value from 0-100 representing flavor intensity
 */
export const calculateFlavorIntensity = (cuisine: string, foodType: string): number => {
    const cuisineLower = cuisine.toLowerCase();
    const foodTypeLower = foodType.toLowerCase();

    // High intensity foods/cuisines (70-95)
    const highIntensityKeywords = [
        'curry', 'laksa', 'spicy', 'szechuan', 'sichuan', 'kimchi', 'vindaloo',
        'hot pot', 'thai', 'indian', 'korean bbq', 'wasabi', 'chili', 'cajun',
        'jerk', 'tandoori', 'buffalo', 'sriracha', 'gochujang', 'sambal'
    ];

    // Medium-high intensity (50-70)
    const mediumHighKeywords = [
        'mexican', 'taco', 'burrito', 'salsa', 'garlic', 'onion', 'ginger',
        'barbecue', 'bbq', 'teriyaki', 'pho', 'ramen', 'miso', 'soy sauce',
        'fish sauce', 'anchovy', 'blue cheese', 'feta', 'olives'
    ];

    // Medium intensity (35-50)
    const mediumKeywords = [
        'italian', 'pasta', 'pizza', 'tomato', 'basil', 'oregano', 'chinese',
        'japanese', 'sushi', 'burger', 'cheese', 'bacon', 'mushroom',
        'american', 'french', 'mediterranean'
    ];

    // Low intensity (10-35)
    const lowIntensityKeywords = [
        'salad', 'caesar', 'lettuce', 'cucumber', 'plain', 'steamed', 'boiled',
        'grilled chicken', 'rice', 'bread', 'toast', 'oatmeal', 'yogurt',
        'smoothie', 'soup', 'broth', 'mild', 'bland'
    ];

    const combinedText = `${cuisineLower} ${foodTypeLower}`;

    // Check for high intensity
    for (const keyword of highIntensityKeywords) {
        if (combinedText.includes(keyword)) {
            return 70 + Math.floor(Math.random() * 26); // 70-95
        }
    }

    // Check for medium-high intensity
    for (const keyword of mediumHighKeywords) {
        if (combinedText.includes(keyword)) {
            return 50 + Math.floor(Math.random() * 21); // 50-70
        }
    }

    // Check for medium intensity
    for (const keyword of mediumKeywords) {
        if (combinedText.includes(keyword)) {
            return 35 + Math.floor(Math.random() * 16); // 35-50
        }
    }

    // Check for low intensity
    for (const keyword of lowIntensityKeywords) {
        if (combinedText.includes(keyword)) {
            return 10 + Math.floor(Math.random() * 26); // 10-35
        }
    }

    // Default medium intensity for unknown foods
    return 40 + Math.floor(Math.random() * 21); // 40-60
};

// --- Stat Calculation Logic ---

/**
 * Derives the hexagon stats (UserStats) from a list of FoodLogs.
 */
export const calculateUserStats = (logs: FoodLog[]): UserStats => {
    if (!logs || logs.length === 0) {
        return {
            healthLevel: 0,
            exp: 0,
            coinsSpent: 0,
            satisfactory: 0,
            balance: 0,
            intensity: 0
        };
    }

    // 1. Health Level (Estimate based on Cuisine)
    // Heuristic: Asian/Salad/Seafood = Higher, Fast Food/Burger/Pizza = Lower
    const healthyCuisines = ['japanese', 'vietnamese', 'salad', 'seafood', 'vegan', 'vegetarian', 'korean'];
    const unhealthyCuisines = ['fast food', 'burger', 'pizza', 'fried chicken', 'dessert', 'american'];

    let healthScoreSum = 0;
    logs.forEach(log => {
        const cuisine = log.cuisine.toLowerCase();
        if (healthyCuisines.some(c => cuisine.includes(c))) healthScoreSum += 80;
        else if (unhealthyCuisines.some(c => cuisine.includes(c))) healthScoreSum += 40;
        else healthScoreSum += 60; // Neutral
    });
    const healthLevel = Math.min(100, Math.round(healthScoreSum / logs.length));


    // 2. Experience Level (Based on Unique Cuisines & Unique Restaurants)
    const uniqueCuisines = new Set(logs.map(l => l.cuisine.toLowerCase())).size;
    const uniqueRestaurants = new Set(logs.map(l => l.restaurantName?.toLowerCase() || '')).size;
    // Cap at 100. Assume 5 unique cuisines + 5 unique restaurants = 100% for a month? Maybe too easy.
    // Let's say max exp requires 10 unique cuisines or 15 unique restaurants combined.
    const exp = Math.min(100, (uniqueCuisines * 8) + (uniqueRestaurants * 4));


    // 3. Coins Spent (Estimate)
    // Since we don't have price, assume avg meal is $15 ($ = 1 coin for simplicity in this metric, or scaled)
    // Let's say "Coins" metric 0-100 represents spending relative to a "budget".
    // Or it represents pure accumulation. Let's make it accumulation capped at 100 for graph.
    // Actually, the label is "Coins", usually implies wealth/spending power.
    // Let's map it to Frequency * Est Price.
    const estTotalSpent = logs.length * 15;
    const coinsSpent = Math.min(100, Math.round(estTotalSpent / 5)); // Cap at $500/mo normalized to 100


    // 4. Satisfactory (Average Rating)
    // Ratings are 1-5. Map 1->20, 5->100.
    const logsWithRatings = logs.filter(l => l.rating && l.rating > 0);
    let avgRating = 0;
    if (logsWithRatings.length > 0) {
        const sumRating = logsWithRatings.reduce((acc, l) => acc + (l.rating || 0), 0);
        avgRating = sumRating / logsWithRatings.length;
    }
    const satisfactory = logsWithRatings.length > 0 ? Math.round(avgRating * 20) : 0; // 5 * 20 = 100


    // 5. Balance (Diversity Score)
    // 1 cuisine = 0 balance. 5+ cuisines = 100 balance.
    const balance = Math.min(100, (uniqueCuisines - 1) * 25);


    // 6. Intensity (Average Flavor Intensity - Weighted by Frequency)
    // Calculate weighted average of flavor intensities
    // Foods eaten more frequently have greater impact
    let intensity = 0;
    if (logs.length > 0) {
        // Count frequency of each food type
        const foodFrequency: Record<string, { count: number, intensity: number }> = {};

        logs.forEach(log => {
            const key = `${log.cuisine}|${log.foodType}`.toLowerCase();
            const flavorIntensity = calculateFlavorIntensity(log.cuisine, log.foodType);

            if (!foodFrequency[key]) {
                foodFrequency[key] = { count: 0, intensity: flavorIntensity };
            }
            foodFrequency[key].count += 1;
        });

        // Calculate weighted average
        let totalWeightedIntensity = 0;
        let totalCount = 0;

        Object.values(foodFrequency).forEach(({ count, intensity: foodIntensity }) => {
            totalWeightedIntensity += foodIntensity * count;
            totalCount += count;
        });

        intensity = Math.round(totalWeightedIntensity / totalCount);
    }

    return {
        healthLevel,
        exp,
        coinsSpent,
        satisfactory,
        balance: balance < 0 ? 0 : balance,
        intensity
    };
};

/**
 * Derives Ranking cards data (UserRankings) from logs.
 */
export const calculateRankings = (logs: FoodLog[], prevLogs: FoodLog[] = []): UserRankings => {
    // Helper to calculate trend
    const calculateTrend = (current: number, past: number) => {
        if (past === 0) return { trend: 'stable' as const, trendValue: 0 };
        const diff = current - past;
        const pct = Math.round(Math.abs(diff / past) * 100);
        return {
            trend: diff > 0 ? 'up' as const : diff < 0 ? 'down' as const : 'stable' as const,
            trendValue: pct
        };
    };

    // 1. Top Cuisine
    const cuisineCounts: Record<string, number> = {};
    logs.forEach(l => {
        const c = l.cuisine || 'Unknown';
        cuisineCounts[c] = (cuisineCounts[c] || 0) + 1;
    });

    // Sort and get top
    const sortedCuisines = Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1]);
    const topCuisineName = sortedCuisines.length > 0 ? sortedCuisines[0][0] : 'None';
    const topCuisineCount = sortedCuisines.length > 0 ? sortedCuisines[0][1] : 0;

    // Calc trend for this specific cuisine
    const prevCuisineCount = prevLogs.filter(l => (l.cuisine || 'Unknown') === topCuisineName).length;
    const cuisineTrend = calculateTrend(topCuisineCount, prevCuisineCount);


    // 2. Top Restaurant
    const restaurantCounts: Record<string, { count: number, totalRating: number, ratingCount: number }> = {};
    logs.forEach(l => {
        const name = l.restaurantName || 'Unknown';
        if (!restaurantCounts[name]) restaurantCounts[name] = { count: 0, totalRating: 0, ratingCount: 0 };

        restaurantCounts[name].count += 1;
        if (l.rating) {
            restaurantCounts[name].totalRating += l.rating;
            restaurantCounts[name].ratingCount += 1;
        }
    });

    const sortedRestaurants = Object.entries(restaurantCounts).sort((a, b) => b[1].count - a[1].count);
    const topRestName = sortedRestaurants.length > 0 ? sortedRestaurants[0][0] : 'None';
    const topRestData = sortedRestaurants.length > 0 ? sortedRestaurants[0][1] : null;

    const topRestRating = topRestData && topRestData.ratingCount > 0
        ? Math.round(topRestData.totalRating / topRestData.ratingCount)
        : 0;

    // Trend for this restaurant visits
    const prevRestCount = prevLogs.filter(l => (l.restaurantName || 'Unknown') === topRestName).length;
    const topRestCountCurrent = topRestData ? topRestData.count : 0;
    // We only show trend icon in UI, but let's calc it anyway
    const restTrend = calculateTrend(topRestCountCurrent, prevRestCount);


    // 3. Eating Out Stats
    const timesEaten = logs.length;
    const estSpent = timesEaten * 15; // Assumption
    const prevTimesEaten = prevLogs.length;
    const eatingOutTrend = calculateTrend(timesEaten, prevTimesEaten);

    return {
        topCuisine: {
            name: topCuisineName,
            count: topCuisineCount,
            trend: cuisineTrend.trend,
            trendValue: cuisineTrend.trendValue
        },
        topRestaurant: {
            name: topRestName,
            rating: topRestRating,
            trend: restTrend.trend
        },
        eatingOutStats: {
            timesEaten,
            coinsSpent: estSpent,
            avgPerVisit: 15.0, // Hardcoded avg for now as we use constant
            trend: eatingOutTrend.trend,
            trendValue: eatingOutTrend.trendValue
        }
    };
};

/**
 * Derives Nutrient Analysis.
 * NOTE: Since we don't have real nutrient data, we mock this based on the log volume
 * to animate the UI. IN REAL APP, this would aggregate from backend/API.
 */
export const calculateNutrientAnalysis = (logs: FoodLog[]): NutrientAnalysis => {
    // Generate semi-random but consistent stats based on log count to show "activity"
    const seed = logs.length;

    // Base values + some variance based on logs
    const proteinPct = Math.min(100, 40 + (seed % 40));
    const fatPct = Math.min(100, 30 + ((seed * 2) % 40));
    const sugarPct = Math.min(100, 20 + ((seed * 3) % 40));

    // Est grams
    const proteinGrams = Math.round(proteinPct * 1.5 * (Math.max(1, logs.length) / 2));
    const fatGrams = Math.round(fatPct * 1.5 * (Math.max(1, logs.length) / 2));
    const sugarGrams = Math.round(sugarPct * 1.5 * (Math.max(1, logs.length) / 2));

    return {
        protein: { grams: proteinGrams, percentage: proteinPct },
        fat: { grams: fatGrams, percentage: fatPct },
        sugar: { grams: sugarGrams, percentage: sugarPct }
    };
};
