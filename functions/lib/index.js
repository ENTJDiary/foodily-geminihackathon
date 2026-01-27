"use strict";
/**
 * Firebase Cloud Functions for food.ily
 *
 * This file contains all Cloud Functions for the application.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeUserData = void 0;
const v2_1 = require("firebase-functions/v2");
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const logger = __importStar(require("firebase-functions/logger"));
// Initialize Firebase Admin
admin.initializeApp();
// Set global options for all functions
(0, v2_1.setGlobalOptions)({
    maxInstances: 10,
    region: "us-central1",
});
/**
 * Callable function to initialize user data after sign-up
 * This is called from the client after successful authentication
 * Creates the complete essential Firestore schema for new users
 */
exports.initializeUserData = (0, https_1.onCall)(async (request) => {
    // Verify the user is authenticated
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
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
    }
    catch (error) {
        logger.error("Error creating user data:", error);
        throw new https_1.HttpsError("internal", "Failed to initialize user data");
    }
});
//# sourceMappingURL=index.js.map