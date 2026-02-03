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

        // 1. Process Food Logs (50% weight - increased from 40)
        foodLogs.forEach((log) => {
            const cuisine = log.cuisine;
            const foodType = log.foodType;

            // Cuisine scoring
            if (!cuisineScores[cuisine]) {
                cuisineScores[cuisine] = { score: 0, frequency: 0 };
            }
            cuisineScores[cuisine].frequency += 1;
            cuisineScores[cuisine].score += 50; // Increased from 40

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
            foodTypeScores[foodType].score += 50; // Increased from 40

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

        // 2. Process Saved Restaurants (30% weight - unchanged)
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

        // 3. Process Liked Posts (15% weight - reduced from 20)
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

            restaurantScores[restaurantId].score += 15; // Reduced from 20
            totalDataPoints++;
        });

        // 4. Process Restaurant Clicks (15% for view, 35% for explore)
        clicks.forEach((click: any) => {
            const restaurantId = click.id;
            const clickType = click.clickType || 'view'; // Default to 'view' for backward compatibility

            if (!restaurantScores[restaurantId]) {
                restaurantScores[restaurantId] = {
                    score: 0,
                    visitCount: 0,
                    avgTimeSpent: 0,
                    saved: false,
                };
            }

            // Apply different weights based on click type
            const clickWeight = clickType === 'explore' ? 35 : 15;
            restaurantScores[restaurantId].score += clickWeight;
            restaurantScores[restaurantId].visitCount += 1;

            // Add cuisine scores from clicks (higher for explore)
            const cuisineWeight = clickType === 'explore' ? 20 : 10;
            click.cuisineTypes?.forEach((cuisine: string) => {
                if (!cuisineScores[cuisine]) {
                    cuisineScores[cuisine] = { score: 0, frequency: 0 };
                }
                cuisineScores[cuisine].score += cuisineWeight;
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
        const confidenceScore = Math.min(100, (totalDataPoints / 20) * 100);

        // Check if profile just reached 100% confidence (for notifications)
        let justCompletedProfile = false;
        try {
            const existingProfileDoc = await getDoc(doc(db, TASTE_PROFILES_COLLECTION, userId));
            if (existingProfileDoc.exists()) {
                const existingProfile = existingProfileDoc.data() as TasteProfile;
                // Profile just completed if it was < 100% and now is 100%
                if (existingProfile.confidenceScore < 100 && confidenceScore >= 100) {
                    justCompletedProfile = true;
                    console.log('🎉 [TasteProfile] Profile just reached 100% confidence!');
                }
            }
        } catch (error) {
            console.error('❌ Error checking profile completion status:', error);
        }

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
            justCompleted: justCompletedProfile
        });

        // Store completion flag in localStorage for UI notification
        if (justCompletedProfile && typeof window !== 'undefined') {
            localStorage.setItem(`tasteProfile_completed_${userId}`, 'true');
        }

        return tasteProfile;
    } catch (error) {
        console.error('❌ Error computing taste profile:', error);
        throw new Error('Failed to compute taste profile');
    }
};

/**
 * Get taste profile (from cache or compute if needed)
 */
export const getTasteProfile = async (userId: string, forceUpdate: boolean = false): Promise<TasteProfile | null> => {
    try {
        console.log('🔍 [getTasteProfile] Called with userId:', userId);
        console.log('🔍 [getTasteProfile] Collection:', TASTE_PROFILES_COLLECTION);

        const profileRef = doc(db, TASTE_PROFILES_COLLECTION, userId);
        console.log('🔍 [getTasteProfile] Document path:', `${TASTE_PROFILES_COLLECTION}/${userId}`);

        const profileDoc = await getDoc(profileRef);
        console.log('🔍 [getTasteProfile] Document exists:', profileDoc.exists());

        if (profileDoc.exists()) {
            const profile = profileDoc.data() as TasteProfile;
            console.log('🔍 [getTasteProfile] Found profile for userId:', profile.userId);

            // CRITICAL: Verify document userId matches requested userId
            if (profile.userId !== userId) {
                console.error('❌ [getTasteProfile] CRITICAL: Document userId mismatch!');
                console.error('Requested userId:', userId);
                console.error('Document userId:', profile.userId);
                console.error('This should NEVER happen - document ID should match userId!');
                // Recompute with correct userId
                return await computeTasteProfile(userId);
            }

            // Force recomputation if explicitly requested (manual refresh)
            if (forceUpdate) {
                console.log('🔄 Manual refresh requested, recomputing profile...');
                return await computeTasteProfile(userId);
            }

            // Force recomputation if profile is empty (0 data points)
            // This handles cases where profile was created before user had any activity
            if (profile.dataPoints === 0) {
                console.log('📊 Profile has 0 data points, checking for new activity...');
                return await computeTasteProfile(userId);
            }

            // Confidence-based update logic:
            // - If confidence < 100% (less than 20 data points): Always recompute to reflect new data
            // - If confidence = 100% (20+ data points): Only recompute if stale (6 hours old)
            const isProfileComplete = profile.confidenceScore >= 100;

            if (!isProfileComplete) {
                // Profile still building - always recompute to show latest data
                console.log(`🔨 Profile building (${profile.confidenceScore}% confidence), recomputing...`);
                return await computeTasteProfile(userId);
            }

            // Profile is complete (100% confidence) - check staleness
            const lastComputed = profile.lastComputed.toMillis();
            const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;

            if (lastComputed < sixHoursAgo) {
                console.log('⏰ Taste profile is stale (6+ hours old), recomputing...');
                return await computeTasteProfile(userId);
            }

            console.log(`✅ Using cached profile (${profile.confidenceScore}% confidence, ${profile.dataPoints} data points)`);
            return profile;
        }

        // No profile exists, compute new one
        console.log('🆕 [getTasteProfile] No profile found for userId:', userId);
        console.log('🆕 [getTasteProfile] Creating new profile...');
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
        console.log('💾 [saveTasteProfile] ========== SAVE OPERATION START ==========');
        console.log('💾 [saveTasteProfile] Requested userId:', userId);
        console.log('💾 [saveTasteProfile] Profile userId:', profile.userId);
        console.log('💾 [saveTasteProfile] Collection:', TASTE_PROFILES_COLLECTION);
        console.log('💾 [saveTasteProfile] Document path:', `${TASTE_PROFILES_COLLECTION}/${userId}`);
        console.log('💾 [saveTasteProfile] Profile data points:', profile.dataPoints);
        console.log('💾 [saveTasteProfile] Profile confidence:', profile.confidenceScore);

        // CRITICAL: Verify userId consistency
        if (profile.userId !== userId) {
            console.error('❌ [saveTasteProfile] CRITICAL ERROR: userId mismatch!');
            console.error('Document ID (userId param):', userId);
            console.error('Profile userId field:', profile.userId);
            throw new Error(`userId mismatch: document=${userId}, profile=${profile.userId}`);
        }

        const profileRef = doc(db, TASTE_PROFILES_COLLECTION, userId);
        await setDoc(profileRef, profile);

        console.log('✅ [saveTasteProfile] Profile saved successfully!');
        console.log('✅ [saveTasteProfile] Saved to:', `${TASTE_PROFILES_COLLECTION}/${userId}`);
        console.log('✅ [saveTasteProfile] Check Firebase Emulator UI at http://localhost:4000/firestore');
        console.log('💾 [saveTasteProfile] ========== SAVE OPERATION END ==========');
    } catch (error) {
        console.error('❌ [saveTasteProfile] Error saving taste profile:', error);
        console.error('❌ [saveTasteProfile] Error details:', JSON.stringify(error, null, 2));
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
