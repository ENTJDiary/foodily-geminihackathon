import {
    collection,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../src/firebase/config';
import { TasteProfile } from '../src/types/auth.types';
import { getFoodLogs } from './foodLogsService';
import { getSavedRestaurants } from './savedRestaurantsService';
import { getUserLikedPostsWithDetails } from './postLikesService';
import { getUserActivity } from './activityTrackingService';
import { getClickedRestaurants } from './restaurantClicksService';

const TASTE_PROFILES_COLLECTION = 'tasteProfiles';

/**
 * Compute taste profile from user data
 */
export const computeTasteProfile = async (userId: string): Promise<TasteProfile> => {
    try {
        console.log('🧠 [TasteProfile] Computing taste profile for user:', userId);

        // Gather all data sources with individual error handling
        console.log('📊 [TasteProfile] Fetching data sources...');

        let foodLogs, savedRestaurants, likedPosts, activity, clicks;

        try {
            foodLogs = await getFoodLogs(userId);
            console.log('✅ [TasteProfile] Food logs fetched:', foodLogs.length);
        } catch (error) {
            console.error('❌ [TasteProfile] Error fetching food logs:', error);
            foodLogs = [];
        }

        try {
            savedRestaurants = await getSavedRestaurants(userId);
            console.log('✅ [TasteProfile] Saved restaurants fetched:', savedRestaurants.length);
        } catch (error) {
            console.error('❌ [TasteProfile] Error fetching saved restaurants:', error);
            savedRestaurants = [];
        }

        try {
            likedPosts = await getUserLikedPostsWithDetails(userId);
            console.log('✅ [TasteProfile] Liked posts fetched:', likedPosts.length);
        } catch (error) {
            console.error('❌ [TasteProfile] Error fetching liked posts:', error);
            likedPosts = [];
        }

        try {
            activity = await getUserActivity(userId, 200);
            console.log('✅ [TasteProfile] User activity fetched:', activity.length);
        } catch (error) {
            console.error('❌ [TasteProfile] Error fetching user activity:', error);
            activity = [];
        }

        try {
            clicks = await getClickedRestaurants(userId);
            console.log('✅ [TasteProfile] Restaurant clicks fetched:', clicks.length);
        } catch (error) {
            console.error('❌ [TasteProfile] Error fetching restaurant clicks:', error);
            clicks = [];
        }

        console.log('📊 [TasteProfile] All data sources fetched successfully');

        // Initialize profile structure
        const cuisineScores: TasteProfile['cuisineScores'] = {};
        const foodTypeScores: TasteProfile['foodTypeScores'] = {};
        const restaurantScores: TasteProfile['restaurantScores'] = {};
        const timePatterns: TasteProfile['timePatterns'] = {
            hourOfDay: {},
            dayOfWeek: {},
        };
        const negativeSignals: TasteProfile['negativeSignals'] = {
            quickExits: {},
            repeatedSearchNoClick: {},
        };

        let totalDataPoints = 0;

        // 1. Process Food Logs (40% weight)
        foodLogs.forEach((log) => {
            const cuisine = log.cuisine;
            const foodType = log.foodType;

            // Cuisine scoring
            if (!cuisineScores[cuisine]) {
                cuisineScores[cuisine] = { score: 0, frequency: 0 };
            }
            cuisineScores[cuisine].frequency += 1;
            cuisineScores[cuisine].score += 40; // Base score from food log

            // Track last eaten
            const logDate = new Date(log.date);
            if (!cuisineScores[cuisine].lastEaten || logDate > cuisineScores[cuisine].lastEaten!) {
                cuisineScores[cuisine].lastEaten = logDate;
            }

            // Food type scoring
            if (!foodTypeScores[foodType]) {
                foodTypeScores[foodType] = { score: 0, frequency: 0 };
            }
            foodTypeScores[foodType].frequency += 1;
            foodTypeScores[foodType].score += 40;

            // Time patterns
            const hour = logDate.getHours();
            const day = logDate.getDay();

            if (!timePatterns.hourOfDay[hour]) timePatterns.hourOfDay[hour] = [];
            if (!timePatterns.hourOfDay[hour].includes(cuisine)) {
                timePatterns.hourOfDay[hour].push(cuisine);
            }

            if (!timePatterns.dayOfWeek[day]) timePatterns.dayOfWeek[day] = [];
            if (!timePatterns.dayOfWeek[day].includes(cuisine)) {
                timePatterns.dayOfWeek[day].push(cuisine);
            }

            totalDataPoints++;
        });

        // 2. Process Saved Restaurants (30% weight)
        savedRestaurants.forEach((restaurant) => {
            const restaurantId = restaurant.restaurantId;

            if (!restaurantScores[restaurantId]) {
                restaurantScores[restaurantId] = {
                    score: 0,
                    visitCount: 0,
                    avgTimeSpent: 0,
                    saved: false,
                };
            }

            restaurantScores[restaurantId].score += 30;
            restaurantScores[restaurantId].saved = true;

            // Add cuisine scores from saved restaurants
            restaurant.cuisineTypes?.forEach((cuisine) => {
                if (!cuisineScores[cuisine]) {
                    cuisineScores[cuisine] = { score: 0, frequency: 0 };
                }
                cuisineScores[cuisine].score += 30;
            });

            totalDataPoints++;
        });

        // 3. Process Liked Posts (20% weight)
        likedPosts.forEach((post: any) => {
            const restaurantId = post.restaurantId;

            if (!restaurantScores[restaurantId]) {
                restaurantScores[restaurantId] = {
                    score: 0,
                    visitCount: 0,
                    avgTimeSpent: 0,
                    saved: false,
                };
            }

            restaurantScores[restaurantId].score += 20;
            totalDataPoints++;
        });

        // 4. Process Restaurant Clicks (20% weight)
        clicks.forEach((click: any) => {
            const restaurantId = click.id;

            if (!restaurantScores[restaurantId]) {
                restaurantScores[restaurantId] = {
                    score: 0,
                    visitCount: 0,
                    avgTimeSpent: 0,
                    saved: false,
                };
            }

            restaurantScores[restaurantId].score += 20;
            restaurantScores[restaurantId].visitCount += 1;

            // Add cuisine scores from clicks
            click.cuisineTypes?.forEach((cuisine: string) => {
                if (!cuisineScores[cuisine]) {
                    cuisineScores[cuisine] = { score: 0, frequency: 0 };
                }
                cuisineScores[cuisine].score += 10;
            });

            totalDataPoints++;
        });

        // 5. Process Activity (negative signals)
        activity.forEach((act) => {
            if (act.activityType === 'quick_exit' && act.restaurantId) {
                negativeSignals.quickExits[act.restaurantId] =
                    (negativeSignals.quickExits[act.restaurantId] || 0) + 1;

                // Reduce restaurant score
                if (restaurantScores[act.restaurantId]) {
                    restaurantScores[act.restaurantId].score *= 0.8;
                }

                // Reduce cuisine scores
                act.cuisineTypes?.forEach((cuisine) => {
                    if (cuisineScores[cuisine]) {
                        cuisineScores[cuisine].score *= 0.8;
                    }
                });
            }

            if (act.activityType === 'search_no_click' && act.searchQuery) {
                negativeSignals.repeatedSearchNoClick[act.searchQuery] =
                    (negativeSignals.repeatedSearchNoClick[act.searchQuery] || 0) + 1;
            }

            if (act.activityType === 'restaurant_view' && act.restaurantId && act.timeSpent) {
                if (restaurantScores[act.restaurantId]) {
                    const currentAvg = restaurantScores[act.restaurantId].avgTimeSpent;
                    const count = restaurantScores[act.restaurantId].visitCount || 1;
                    restaurantScores[act.restaurantId].avgTimeSpent =
                        (currentAvg * count + act.timeSpent) / (count + 1);
                }
            }
        });

        // 6. Apply recency multiplier (recent activity weighted higher)
        const now = Date.now();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

        Object.keys(cuisineScores).forEach((cuisine) => {
            const lastEaten = cuisineScores[cuisine].lastEaten;
            if (lastEaten) {
                const daysSince = (now - lastEaten.getTime()) / (24 * 60 * 60 * 1000);
                const recencyMultiplier = Math.max(0.5, 1 - daysSince / 90); // Decay over 90 days
                cuisineScores[cuisine].score *= recencyMultiplier;
            }
        });

        // 7. Normalize scores to 0-100 range
        const maxCuisineScore = Math.max(...Object.values(cuisineScores).map((c) => c.score), 1);
        Object.keys(cuisineScores).forEach((cuisine) => {
            cuisineScores[cuisine].score = Math.min(
                100,
                (cuisineScores[cuisine].score / maxCuisineScore) * 100
            );
        });

        const maxFoodTypeScore = Math.max(...Object.values(foodTypeScores).map((f) => f.score), 1);
        Object.keys(foodTypeScores).forEach((foodType) => {
            foodTypeScores[foodType].score = Math.min(
                100,
                (foodTypeScores[foodType].score / maxFoodTypeScore) * 100
            );
        });

        const maxRestaurantScore = Math.max(...Object.values(restaurantScores).map((r) => r.score), 1);
        Object.keys(restaurantScores).forEach((restaurantId) => {
            restaurantScores[restaurantId].score = Math.min(
                100,
                (restaurantScores[restaurantId].score / maxRestaurantScore) * 100
            );
        });

        // 8. Calculate confidence score (0-100 based on data volume)
        const confidenceScore = Math.min(100, (totalDataPoints / 50) * 100);

        // 9. Build final profile
        const tasteProfile: TasteProfile = {
            userId,
            cuisineScores,
            foodTypeScores,
            restaurantScores,
            timePatterns,
            budgetPreference: {
                avgPriceRating: 2.5, // TODO: Calculate from saved restaurants
                range: [1, 4],
            },
            locationPreference: {
                maxDistance: 10, // km
                preferredAreas: [],
            },
            negativeSignals,
            lastComputed: Timestamp.now(),
            dataPoints: totalDataPoints,
            confidenceScore,
        };

        // 10. Save to Firestore
        await saveTasteProfile(userId, tasteProfile);

        console.log('✅ Taste profile computed:', {
            cuisines: Object.keys(cuisineScores).length,
            restaurants: Object.keys(restaurantScores).length,
            dataPoints: totalDataPoints,
            confidence: confidenceScore,
        });

        return tasteProfile;
    } catch (error) {
        console.error('❌ Error computing taste profile:', error);
        throw new Error('Failed to compute taste profile');
    }
};

/**
 * Get taste profile (from cache or compute if needed)
 */
export const getTasteProfile = async (userId: string): Promise<TasteProfile | null> => {
    try {
        const profileRef = doc(db, TASTE_PROFILES_COLLECTION, userId);
        const profileDoc = await getDoc(profileRef);

        if (profileDoc.exists()) {
            const profile = profileDoc.data() as TasteProfile;

            // Force recomputation if profile is empty (0 data points)
            // This handles cases where profile was created before user had any activity
            if (profile.dataPoints === 0) {
                console.log('📊 Profile has 0 data points, checking for new activity...');
                return await computeTasteProfile(userId);
            }

            // Check if profile is stale (older than 6 hours)
            const lastComputed = profile.lastComputed.toMillis();
            const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;

            if (lastComputed < sixHoursAgo) {
                console.log('⏰ Taste profile is stale, recomputing...');
                return await computeTasteProfile(userId);
            }

            return profile;
        }

        // No profile exists, compute new one
        console.log('🆕 No taste profile found, computing...');
        return await computeTasteProfile(userId);
    } catch (error) {
        console.error('❌ Error getting taste profile:', error);
        return null;
    }
};


/**
 * Save taste profile to Firestore
 */
const saveTasteProfile = async (userId: string, profile: TasteProfile): Promise<void> => {
    try {
        console.log('💾 [TasteProfile] Attempting to save profile to Firestore...');
        console.log('📍 [TasteProfile] Collection:', TASTE_PROFILES_COLLECTION, 'User ID:', userId);
        console.log('📊 [TasteProfile] Profile data points:', profile.dataPoints);

        const profileRef = doc(db, TASTE_PROFILES_COLLECTION, userId);
        await setDoc(profileRef, profile);

        console.log('✅ [TasteProfile] Profile saved successfully to Firestore!');
        console.log('🔍 [TasteProfile] Check Firebase Emulator UI at http://localhost:4000');
    } catch (error) {
        console.error('❌ [TasteProfile] Error saving taste profile:', error);
        console.error('❌ [TasteProfile] Error details:', JSON.stringify(error, null, 2));
        throw error;
    }
};

/**
 * Reset taste profile (clear all data)
 */
export const resetTasteProfile = async (userId: string): Promise<void> => {
    try {
        const emptyProfile: TasteProfile = {
            userId,
            cuisineScores: {},
            foodTypeScores: {},
            restaurantScores: {},
            timePatterns: {
                hourOfDay: {},
                dayOfWeek: {},
            },
            budgetPreference: {
                avgPriceRating: 2.5,
                range: [1, 4],
            },
            locationPreference: {
                maxDistance: 10,
                preferredAreas: [],
            },
            negativeSignals: {
                quickExits: {},
                repeatedSearchNoClick: {},
            },
            lastComputed: Timestamp.now(),
            dataPoints: 0,
            confidenceScore: 0,
        };

        await saveTasteProfile(userId, emptyProfile);
        console.log('🔄 Taste profile reset');
    } catch (error) {
        console.error('❌ Error resetting taste profile:', error);
        throw new Error('Failed to reset taste profile');
    }
};

/**
 * Get top cuisines from taste profile
 */
export const getTopCuisines = (profile: TasteProfile, limit: number = 5): string[] => {
    return Object.entries(profile.cuisineScores)
        .sort(([, a], [, b]) => b.score - a.score)
        .slice(0, limit)
        .map(([cuisine]) => cuisine);
};

/**
 * Get cuisine preference summary for Gemini
 */
export const getCuisinePreferenceSummary = (profile: TasteProfile): string => {
    const topCuisines = getTopCuisines(profile, 5);
    if (topCuisines.length === 0) return '';

    const cuisineDetails = topCuisines.map((cuisine) => {
        const data = profile.cuisineScores[cuisine];
        return `${cuisine} (score: ${Math.round(data.score)}, frequency: ${data.frequency})`;
    });

    return `User prefers: ${cuisineDetails.join(', ')}`;
};
