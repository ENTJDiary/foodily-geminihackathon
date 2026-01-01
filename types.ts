
export interface Location {
  latitude: number;
  longitude: number;
}

export interface GroundingChunk {
  /**
   * Represents a location or place from Google Maps.
   */
  maps?: {
    uri?: string;
    title?: string;
  };
  /**
   * Represents a search result from the web.
   */
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface SearchResult {
  text: string;
  groundingChunks: GroundingChunk[];
}

export type AppTab = 'search' | 'chat' | 'concierge' | 'profile';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  timestamp: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  image?: string; // base64 string
}

export interface RestaurantData {
  id: string;
  name: string;
  reviews: Review[];
  menuItems: MenuItem[];
  communityDescription?: string;
}

export interface HistoryLogItem {
  id: string;
  foodName: string;
  rating: number;
}

export interface HistoryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  cuisine: string;
  foodType: string;
  restaurantName?: string;
  logs?: HistoryLogItem[];
  timestamp: number;
}

export interface UserProfile {
  name: string;
  email: string;
  favoriteCuisines: string[];
  dietaryRestrictions: string[];
  darkMode: boolean;
}
