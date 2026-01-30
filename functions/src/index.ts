/**
 * Firebase Cloud Functions for food.ily
 * 
 * This file contains all Cloud Functions for the application.
 */

import { setGlobalOptions } from "firebase-functions/v2";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for all functions
setGlobalOptions({
    maxInstances: 10,
    region: "us-central1",
});

/**
 * Callable function to initialize user data after sign-up
 * This is called from the client after successful authentication
 * Creates the complete essential Firestore schema for new users
 */
export const initializeUserData = onCall(async (request) => {
    // Verify the user is authenticated
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email || "";
    const displayName = request.auth.token.name ||
        email.split("@")[0] ||
        "Food Lover";
    const profilePictureURL = request.auth.token.picture || null;

    // Detect authentication provider
    const authProvider = request.auth.token.firebase.sign_in_provider;
    let providerType: 'google' | 'email' | 'phone' = 'email';
    if (authProvider === 'google.com') {
        providerType = 'google';
    } else if (authProvider === 'phone') {
        providerType = 'phone';
    }

    const emailVerified = request.auth.token.email_verified || false;

    logger.info("Initializing user data for:", {
        uid: uid,
        email: email,
        displayName: displayName,
        authProvider: providerType,
        emailVerified: emailVerified,
    });

    const db = admin.firestore();
    const batch = db.batch();

    try {
        // Check if user document already exists
        const userDocRef = db.collection("users").doc(uid);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
            logger.info("User data already exists", { uid });
            return {
                success: true,
                message: "User data already exists",
                alreadyExists: true,
            };
        }

        // Create user profile document with schema-compliant fields
        // Schema reference: firestore-schema.md lines 24-37
        // Only core user info - NO onboarding or preference data here
        batch.set(userDocRef, {
            uid: uid,
            email: email,
            displayName: displayName,
            profilePictureURL: profilePictureURL,
            dietaryPreferences: [], // Array of dietary preferences
            bio: "",
            phoneNumber: null,
            authProvider: providerType,
            emailVerified: emailVerified,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            lastLoginAt: FieldValue.serverTimestamp(),
        });

        logger.info("User profile document prepared", { uid });

        // Create user preferences document with complete schema
        // Schema reference: firestore-schema.md lines 299-325
        const prefsDocRef = db.collection("userPreferences").doc(uid);
        batch.set(prefsDocRef, {
            userId: uid,

            // Onboarding Data (will be filled during onboarding)
            city: "",
            dateOfBirth: "",
            sex: "",
            termsAccepted: false,
            onboardingCompletedAt: null,

            // Cuisine & Dietary Preferences
            cuisinePreferences: [],
            dietaryRestrictions: [],

            // Restaurant Preferences
            priceRangePreference: null,
            distancePreference: null,
            favoriteRestaurants: [],
            blockedRestaurants: [],

            // Food Wheel Options
            wheelOptions: [],

            // Metadata
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        logger.info("User preferences document prepared", { uid });

        // Create user stats document with initial values
        const statsDocRef = db.collection("userStats").doc(uid);
        batch.set(statsDocRef, {
            userId: uid,
            healthLevel: 0,
            exp: 0,
            coinsSpent: 0,
            satisfactory: 0,
            balance: 0,
            intensity: 0,
            topCuisine: {
                name: "",
                count: 0,
                trend: "stable",
                trendValue: 0,
            },
            topRestaurant: {
                restaurantId: "",
                name: "",
                rating: 0,
                visitCount: 0,
                trend: "stable",
            },
            eatingOutStats: {
                timesEaten: 0,
                coinsSpent: 0,
                avgPerVisit: 0,
                trend: "stable",
                trendValue: 0,
            },
            nutrientAnalysis: {
                protein: { grams: 0, percentage: 0 },
                fat: { grams: 0, percentage: 0 },
                sugar: { grams: 0, percentage: 0 },
            },
            totalRestaurantsExplored: 0,
            totalReviewsWritten: 0,
            totalMenuItemsPosted: 0,
            totalLikesReceived: 0,
            lastCalculatedAt: FieldValue.serverTimestamp(),
            calculationMethod: "realtime",
            updatedAt: FieldValue.serverTimestamp(),
        });

        logger.info("User stats document prepared", { uid });

        // Commit the batch write atomically
        await batch.commit();

        logger.info("User data initialization complete", { uid });

        return {
            success: true,
            message: "User data created successfully",
            alreadyExists: false,
        };
    } catch (error) {
        logger.error("Error creating user data:", error);
        throw new HttpsError("internal", "Failed to initialize user data");
    }
});
