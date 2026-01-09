/**
 * Firebase Cloud Functions for food.ily
 * 
 * This file contains all Cloud Functions for the application.
 */

import { setGlobalOptions } from "firebase-functions/v2";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
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

    logger.info("Initializing user data for:", {
        uid: uid,
        email: email,
        displayName: displayName,
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

        // Create user profile document with complete schema
        // Using .doc(uid) ensures unique per-user document
        batch.set(userDocRef, {
            uid: uid,
            email: email,
            displayName: displayName,
            profilePictureURL: profilePictureURL,
            bio: "",
            dietaryPreferences: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.info("User profile document prepared", { uid });

        // Create user preferences document with complete schema
        // Using .doc(uid) ensures unique per-user document
        const prefsDocRef = db.collection("userPreferences").doc(uid);
        batch.set(prefsDocRef, {
            userId: uid,
            cuisinePreferences: [],
            dietaryRestrictions: [],
            priceRangePreference: null,
            distancePreference: null,
            favoriteRestaurants: [],
            blockedRestaurants: [],
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.info("User preferences document prepared", { uid });

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
