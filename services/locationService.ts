import { Location } from '../types';

const LOCATION_STORAGE_KEY = 'foodily_user_location';
const LOCATION_TIMESTAMP_KEY = 'foodily_location_timestamp';
const LOCATION_MAX_AGE = 30 * 60 * 1000; // 30 minutes

interface StoredLocation {
    latitude: number;
    longitude: number;
    timestamp: number;
}

/**
 * Request location permission and get current position with high accuracy
 */
export const requestLocationPermission = async (): Promise<Location | null> => {
    console.log('🔍 [LocationService] requestLocationPermission() called');

    return new Promise((resolve) => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            console.error('❌ [LocationService] Geolocation is NOT supported by this browser');
            resolve(null);
            return;
        }

        console.log('✅ [LocationService] Geolocation API is available');
        console.log('📍 [LocationService] Calling navigator.geolocation.getCurrentPosition()...');
        console.log('⚙️ [LocationService] Settings: enableHighAccuracy=true, timeout=10000ms, maximumAge=0');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('✅ [LocationService] SUCCESS - Location permission granted!');
                const location: Location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                console.log('📍 [LocationService] Location coordinates:', location);

                // Store location with timestamp
                const storedLocation: StoredLocation = {
                    ...location,
                    timestamp: Date.now(),
                };
                localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(storedLocation));
                console.log('💾 [LocationService] Location saved to localStorage');

                resolve(location);
            },
            (error) => {
                console.error('❌ [LocationService] FAILED - Geolocation error');
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);

                // Provide user-friendly error messages
                let errorMessage = 'Unable to get your location. ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Location permission was denied. You can still use the app by entering locations manually.';
                        console.warn('🚫 [LocationService] User denied location permission');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        console.warn('📍 [LocationService] Position unavailable');
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        console.warn('⏱️ [LocationService] Location request timed out');
                        break;
                    default:
                        errorMessage += 'An unknown error occurred.';
                        console.warn('❓ [LocationService] Unknown error');
                }

                console.warn(errorMessage);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );

        console.log('⏳ [LocationService] Waiting for user response to location permission prompt...');
    });
};

/**
 * Get stored location if it's still fresh (within max age)
 */
export const getStoredLocation = (): Location | null => {
    try {
        const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
        if (!stored) return null;

        const storedLocation: StoredLocation = JSON.parse(stored);
        const age = Date.now() - storedLocation.timestamp;

        // If location is too old, return null
        if (age > LOCATION_MAX_AGE) {
            localStorage.removeItem(LOCATION_STORAGE_KEY);
            return null;
        }

        return {
            latitude: storedLocation.latitude,
            longitude: storedLocation.longitude,
        };
    } catch (error) {
        console.error('Error reading stored location:', error);
        return null;
    }
};

/**
 * Get current location - tries stored location first, then requests fresh location
 */
export const getCurrentLocation = async (): Promise<Location | null> => {
    // Try stored location first
    const stored = getStoredLocation();
    if (stored) {
        return stored;
    }

    // If no stored location or it's stale, request fresh location
    return requestLocationPermission();
};

/**
 * Clear stored location
 */
export const clearStoredLocation = (): void => {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    localStorage.removeItem(LOCATION_TIMESTAMP_KEY);
};

/**
 * Check if location permission has been granted
 */
export const checkLocationPermission = async (): Promise<PermissionState | null> => {
    if (!navigator.permissions) {
        return null;
    }

    try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state;
    } catch (error) {
        console.warn('Unable to check location permission:', error);
        return null;
    }
};
