import { PlaceDetails } from '../types';

/**
 * Search for a place by name using Google Places API (New)
 * Returns place details including address and coordinates
 */
export const searchPlaceByName = async (restaurantName: string): Promise<PlaceDetails | null> => {
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
        console.warn('⚠️ Google Places API key not configured. Skipping place search.');
        return null;
    }

    try {
        console.log(`🔍 Searching for place: "${restaurantName}"`);

        // Use Places API (New) - Text Search
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.internationalPhoneNumber,places.websiteUri,places.rating'
            },
            body: JSON.stringify({
                textQuery: restaurantName,
                maxResultCount: 1
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Places API error:', response.status, errorText);
            return null;
        }

        const data = await response.json();

        if (!data.places || data.places.length === 0) {
            console.warn(`⚠️ No place found for: "${restaurantName}"`);
            return null;
        }

        const place = data.places[0];
        console.log('✅ Place found:', place.displayName?.text || place.id);

        return {
            placeId: place.id,
            name: place.displayName?.text || restaurantName,
            formattedAddress: place.formattedAddress,
            location: place.location ? {
                latitude: place.location.latitude,
                longitude: place.location.longitude
            } : undefined,
            phoneNumber: place.internationalPhoneNumber,
            website: place.websiteUri,
            rating: place.rating
        };
    } catch (error) {
        console.error('❌ Failed to fetch place details:', error);
        return null;
    }
};

/**
 * Generate Google Maps URL for directions
 * Uses coordinates if available, otherwise falls back to name search
 */
export const getGoogleMapsUrl = (restaurantName: string, placeDetails: PlaceDetails | null): string => {
    if (placeDetails?.location) {
        // Use coordinates for accurate directions
        const { latitude, longitude } = placeDetails.location;
        return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    } else {
        // Fallback to name search
        const encodedName = encodeURIComponent(restaurantName);
        return `https://www.google.com/maps/search/?api=1&query=${encodedName}`;
    }
};
