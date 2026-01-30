import { getUserProfile, getSearchHistory as getLocalSearchHistory, getWheelOptions as getLocalWheelOptions } from './storageService';
import { saveOnboardingToPreferences } from './preferencesService';
import { saveSearchHistory } from './searchHistoryService';
import { updateUserPreferences } from './preferencesService';

const MIGRATION_KEY = 'foodily_migration_completed';

/**
 * Check if migration has been completed
 */
export const isMigrationCompleted = (): boolean => {
    return localStorage.getItem(MIGRATION_KEY) === 'true';
};

/**
 * Mark migration as complete
 */
export const markMigrationComplete = (): void => {
    localStorage.setItem(MIGRATION_KEY, 'true');
    console.log('✅ Migration marked as complete');
};

/**
 * Migrate user profile data from localStorage to Firestore
 * Note: Basic user data is created by Cloud Function, this migrates additional preferences
 */
export const migrateUserProfile = async (userId: string): Promise<void> => {
    try {
        const localProfile = getUserProfile();

        if (localProfile && (localProfile.favoriteCuisines.length > 0 || localProfile.dietaryRestrictions.length > 0)) {
            console.log('📦 Migrating user profile preferences...');

            await updateUserPreferences(userId, {
                cuisinePreferences: localProfile.favoriteCuisines,
                dietaryRestrictions: localProfile.dietaryRestrictions,
            });

            console.log('✅ User profile preferences migrated successfully');
        } else {
            console.log('ℹ️ No user profile preferences to migrate');
        }
    } catch (error) {
        console.error('❌ Error migrating user profile:', error);
        throw error;
    }
};

/**
 * Migrate search history from localStorage to Firestore
 */
export const migrateSearchHistory = async (userId: string): Promise<void> => {
    try {
        const localHistory = getLocalSearchHistory();

        if (localHistory && localHistory.length > 0) {
            console.log(`📦 Migrating ${localHistory.length} search history entries...`);

            const migrationPromises = localHistory.map(entry => {
                return saveSearchHistory(userId, {
                    searchQuery: entry.foodType || entry.cuisine || '',
                    searchType: entry.foodType ? 'dish' : 'cuisine',
                    dishName: entry.foodType,
                    cuisineType: entry.cuisine,
                    locationSearched: entry.restaurantName,
                    resultsCount: 0, // Not tracked in old system
                });
            });

            await Promise.all(migrationPromises);
            console.log('✅ Search history migrated successfully');
        } else {
            console.log('ℹ️ No search history to migrate');
        }
    } catch (error) {
        console.error('❌ Error migrating search history:', error);
        // Don't throw - search history migration is not critical
        console.warn('⚠️ Continuing without search history migration');
    }
};

/**
 * Migrate wheel options from localStorage to Firestore
 */
export const migrateWheelOptions = async (userId: string): Promise<void> => {
    try {
        const localWheelOptions = getLocalWheelOptions();

        if (localWheelOptions && localWheelOptions.length > 0) {
            console.log(`📦 Migrating ${localWheelOptions.length} wheel options...`);

            await updateUserPreferences(userId, {
                wheelOptions: localWheelOptions,
            });

            console.log('✅ Wheel options migrated successfully');
        } else {
            console.log('ℹ️ No wheel options to migrate');
        }
    } catch (error) {
        console.error('❌ Error migrating wheel options:', error);
        // Don't throw - wheel options migration is not critical
        console.warn('⚠️ Continuing without wheel options migration');
    }
};

/**
 * Run complete migration process
 */
export const runMigration = async (userId: string): Promise<void> => {
    if (isMigrationCompleted()) {
        console.log('ℹ️ Migration already completed, skipping...');
        return;
    }

    console.log('🚀 Starting data migration from localStorage to Firestore...');

    try {
        // Migrate in sequence to avoid overwhelming Firestore
        await migrateUserProfile(userId);
        await migrateSearchHistory(userId);
        await migrateWheelOptions(userId);

        // Mark migration as complete
        markMigrationComplete();

        console.log('✅ All data migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw new Error('Failed to complete data migration. Please try again or contact support.');
    }
};

/**
 * Reset migration status (for testing purposes)
 */
export const resetMigrationStatus = (): void => {
    localStorage.removeItem(MIGRATION_KEY);
    console.log('🔄 Migration status reset');
};
