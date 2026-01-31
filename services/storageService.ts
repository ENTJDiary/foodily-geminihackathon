
import { Review, RestaurantData, HistoryEntry, UserProfile, MenuItem } from "../types";

/**
 * ⚠️ DEPRECATION NOTICE ⚠️
 * 
 * This file contains legacy localStorage-based storage functions.
 * Most functions have been migrated to Firestore services:
 * 
 * - Reviews → reviewsService.ts, reviewLikesService.ts
 * - Menu Items → communityPostsService.ts, postLikesService.ts
 * - Food Logs → foodLogsService.ts
 * - Saved Restaurants → savedRestaurantsService.ts
 * - Habit Analysis → habitAnalysisService.ts
 * 
 * Only user profile functions remain active for backward compatibility.
 * All other functions should be considered deprecated.
 */

const REVIEWS_KEY = "flavorfinder_reviews";
const HISTORY_KEY = "flavorfinder_search_history";
const PROFILE_KEY = "flavorfinder_user_profile";

const DEFAULT_PROFILE: UserProfile = {
  name: "Gourmet Explorer",
  email: "hello@flavorfinder.ai",
  favoriteCuisines: [],
  dietaryRestrictions: [],
  darkMode: false,
};

// User Profile Storage
export const getUserProfile = (): UserProfile => {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : DEFAULT_PROFILE;
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

// Review & Menu Storage
export const getRestaurantData = (restaurantId: string): RestaurantData => {
  const allData = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "{}");
  const data = allData[restaurantId] || { id: restaurantId, name: "", reviews: [], menuItems: [], communityDescription: "" };
  // Ensure menuItems and communityDescription exist for backward compatibility
  if (!data.menuItems) data.menuItems = [];
  return data;
};

export const saveRestaurantDescription = (restaurantId: string, restaurantName: string, description: string) => {
  const allData = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "{}");
  const restaurant = getRestaurantData(restaurantId);
  restaurant.communityDescription = description;
  restaurant.name = restaurantName;
  allData[restaurantId] = restaurant;
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(allData));
};

export const saveReview = (restaurantId: string, restaurantName: string, review: Omit<Review, "id" | "timestamp" | "reviewId" | "createdAt">) => {
  const allData = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "{}");
  const restaurant = getRestaurantData(restaurantId);

  const newReview: Review = {
    ...review,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    reviewId: 'legacy-' + Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
  };

  restaurant.reviews.unshift(newReview);
  restaurant.name = restaurantName;
  allData[restaurantId] = restaurant;

  localStorage.setItem(REVIEWS_KEY, JSON.stringify(allData));
};

export const toggleReviewLike = (restaurantId: string, reviewId: string): Review[] => {
  const allData = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "{}");
  const restaurant = allData[restaurantId];
  if (!restaurant || !restaurant.reviews) return [];

  const updatedReviews = restaurant.reviews.map((review: Review) => {
    if (review.id === reviewId) {
      const isLiked = !review.isLiked;
      const currentLikes = review.likes ?? Math.floor(Math.random() * 10) + 1;
      return {
        ...review,
        isLiked,
        likes: isLiked ? currentLikes + 1 : currentLikes - 1
      };
    }
    return review;
  });

  restaurant.reviews = updatedReviews;
  allData[restaurantId] = restaurant;
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(allData));

  return updatedReviews;
};

export const addMenuItem = (restaurantId: string, restaurantName: string, item: Omit<MenuItem, "id">) => {
  const allData = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "{}");
  const restaurant = getRestaurantData(restaurantId);

  const newItem: MenuItem = {
    ...item,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
  };

  restaurant.menuItems.unshift(newItem);
  restaurant.name = restaurantName;
  allData[restaurantId] = restaurant;

  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(allData));
    console.log('✅ Successfully saved to localStorage');
  } catch (error) {
    console.error('❌ localStorage.setItem failed:', error);
    throw error; // Re-throw to be caught by caller
  }
};

export const getAverageRating = (restaurantId: string): number => {
  const data = getRestaurantData(restaurantId);
  if (!data.reviews.length) return 0;
  const sum = data.reviews.reduce((acc, rev) => acc + rev.rating, 0);
  return sum / data.reviews.length;
};

// History Storage
export const saveSearchToHistory = (cuisine: string, foodType: string) => {
  const history = getSearchHistory();
  // Use local date to match calendar
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  const date = d.toISOString().split('T')[0];

  const newEntry: HistoryEntry = {
    id: Math.random().toString(36).substr(2, 9),
    date,
    cuisine,
    foodType,
    timestamp: Date.now()
  };

  history.push(newEntry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const getSearchHistory = (): HistoryEntry[] => {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
};

export const getWeeklyHistory = (): HistoryEntry[] => {
  const history = getSearchHistory();
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return history.filter(h => h.timestamp > oneWeekAgo);
};

export const clearSearchHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};

export const updateHistoryEntry = (id: string, updates: Partial<HistoryEntry>) => {
  const history = getSearchHistory();
  const index = history.findIndex(h => h.id === id);
  if (index !== -1) {
    history[index] = { ...history[index], ...updates };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
};

// Wheel Storage
const WHEEL_KEY = "foodily_wheel_options";
const WHEEL_COLORS = ['#FF6B35', '#FF8C42', '#FFA74F', '#FFB85C', '#FF9A56', '#FFA060'];

export const getWheelOptions = () => {
  const saved = localStorage.getItem(WHEEL_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load wheel options', e);
    return [];
  }
};

export const addToWheel = (name: string): boolean => {
  if (!name.trim()) return false;

  const options = getWheelOptions();

  // Check for duplicates (case-insensitive)
  const isDuplicate = options.some((opt: any) =>
    opt.name.toLowerCase() === name.trim().toLowerCase()
  );

  if (isDuplicate) {
    return false; // Already exists
  }

  const newOption = {
    id: Math.random().toString(36).substr(2, 9),
    name: name.trim(),
    color: WHEEL_COLORS[options.length % WHEEL_COLORS.length],
    timestamp: Date.now(),
  };

  const updatedOptions = [...options, newOption];
  localStorage.setItem(WHEEL_KEY, JSON.stringify(updatedOptions));

  // Dispatch custom event to notify SpinTheWheel component
  window.dispatchEvent(new CustomEvent('wheelOptionsUpdated'));

  return true; // Successfully added
};

export const removeFromWheel = (optionId: string) => {
  const options = getWheelOptions();
  const updatedOptions = options.filter((opt: any) => opt.id !== optionId);

  if (updatedOptions.length === 0) {
    localStorage.removeItem(WHEEL_KEY);
  } else {
    localStorage.setItem(WHEEL_KEY, JSON.stringify(updatedOptions));
  }

  // Dispatch custom event to notify SpinTheWheel component
  window.dispatchEvent(new CustomEvent('wheelOptionsUpdated'));
};

// Activity Tracking - Dummy Data (to be replaced with backend API)
export interface ExploredRestaurant {
  id: string;
  name: string;
  cuisine: string;
  timestamp: number;
}

export interface UserComment {
  id: string;
  restaurantId: string;
  restaurantName: string;
  rating: number;
  comment: string;
  timestamp: number;
}

export interface LikedPost {
  id: string;
  restaurantId: string;
  restaurantName: string;
  postId: string;
  image?: string;
  userName: string;
  timestamp: number;
}

// Dummy data generators
const DUMMY_EXPLORED_RESTAURANTS: ExploredRestaurant[] = [
  { id: 'r1', name: 'Saiko Ramen Bar', cuisine: 'Japanese', timestamp: Date.now() - 86400000 },
  { id: 'r2', name: 'La Bella Italia', cuisine: 'Italian', timestamp: Date.now() - 172800000 },
  { id: 'r3', name: 'Spice Garden', cuisine: 'Indian', timestamp: Date.now() - 259200000 },
  { id: 'r4', name: 'The Burger Joint', cuisine: 'American', timestamp: Date.now() - 345600000 },
  { id: 'r5', name: 'Taco Fiesta', cuisine: 'Mexican', timestamp: Date.now() - 432000000 },
];

const DUMMY_USER_COMMENTS: UserComment[] = [
  {
    id: 'c1',
    restaurantId: 'r1',
    restaurantName: "Raising Cane's Chicken Fingers",
    rating: 5,
    comment: 'Real Nice Recommend!',
    timestamp: Date.now() - 86400000
  },
  {
    id: 'c2',
    restaurantId: 'r2',
    restaurantName: 'Noodle Doodle',
    rating: 4,
    comment: 'Great atmosphere and authentic flavors',
    timestamp: Date.now() - 172800000
  },
  {
    id: 'c3',
    restaurantId: 'r3',
    restaurantName: 'Spice Garden',
    rating: 5,
    comment: 'Best curry in town!',
    timestamp: Date.now() - 259200000
  },
];

const DUMMY_LIKED_POSTS: LikedPost[] = [
  {
    id: 'lp1',
    restaurantId: 'r4',
    restaurantName: 'Noodle Doodle',
    postId: 'p1',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    userName: 'Monsoon Seed',
    timestamp: Date.now() - 86400000
  },
  {
    id: 'lp2',
    restaurantId: 'r5',
    restaurantName: 'Taco Fiesta',
    postId: 'p2',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
    userName: 'Food Explorer',
    timestamp: Date.now() - 172800000
  },
  {
    id: 'lp3',
    restaurantId: 'r1',
    restaurantName: 'Saiko Ramen Bar',
    postId: 'p3',
    image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400',
    userName: 'Ramen Lover',
    timestamp: Date.now() - 259200000
  },
];

// Activity retrieval functions
export const getExploredRestaurants = (): ExploredRestaurant[] => {
  // TODO: Replace with actual API call
  return DUMMY_EXPLORED_RESTAURANTS;
};

export const getUserComments = (): UserComment[] => {
  // TODO: Replace with actual API call
  return DUMMY_USER_COMMENTS;
};

export const getLikedPosts = (): LikedPost[] => {
  // TODO: Replace with actual API call
  return DUMMY_LIKED_POSTS;
};

// Saved Posts - Different from Liked Posts
export interface SavedPost {
  id: string;
  restaurantId: string;
  restaurantName: string;
  postId: string;
  dishName: string;
  image: string;
  userName: string;
  rating: number;
  experience?: string;
  timestamp: number;
}

// Dummy saved posts data
const DUMMY_SAVED_POSTS: SavedPost[] = [
  {
    id: 'sp1',
    restaurantId: 'r1',
    restaurantName: 'Crispy',
    postId: 'post1',
    dishName: 'Fried Chicken',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
    userName: 'LOCAL EXPLORER',
    rating: 5,
    experience: 'damnnnnn nice',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'sp2',
    restaurantId: 'r2',
    restaurantName: 'Noodle Doodle',
    postId: 'post2',
    dishName: 'Nasi Lemak',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    userName: 'Monsoon Seed',
    rating: 4,
    experience: 'Authentic Malaysian flavors',
    timestamp: Date.now() - 172800000,
  },
  {
    id: 'sp3',
    restaurantId: 'r3',
    restaurantName: 'Pasta Paradise',
    postId: 'post3',
    dishName: 'Carbonara',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
    userName: 'Italian Foodie',
    rating: 5,
    experience: 'Best carbonara outside Italy!',
    timestamp: Date.now() - 259200000,
  },
  {
    id: 'sp4',
    restaurantId: 'r4',
    restaurantName: 'Sushi Master',
    postId: 'post4',
    dishName: 'Salmon Sashimi',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    userName: 'Sushi Lover',
    rating: 5,
    experience: 'Fresh and delicious',
    timestamp: Date.now() - 345600000,
  },
  {
    id: 'sp5',
    restaurantId: 'r5',
    restaurantName: 'Taco Fiesta',
    postId: 'post5',
    dishName: 'Beef Tacos',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
    userName: 'Taco Tuesday',
    rating: 4,
    experience: 'Spicy and flavorful!',
    timestamp: Date.now() - 432000000,
  },
  {
    id: 'sp6',
    restaurantId: 'r6',
    restaurantName: 'Burger Haven',
    postId: 'post6',
    dishName: 'Double Cheeseburger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    userName: 'Burger King',
    rating: 5,
    experience: 'Juicy and satisfying',
    timestamp: Date.now() - 518400000,
  },
];

// State to track saved posts (in real app, this would be in backend)
let savedPostsState = [...DUMMY_SAVED_POSTS];

export const getSavedPosts = (): SavedPost[] => {
  // TODO: Replace with actual API call
  return savedPostsState;
};

export const toggleSavePost = (postId: string): SavedPost[] => {
  // TODO: Replace with actual API call
  const index = savedPostsState.findIndex(post => post.id === postId);

  if (index !== -1) {
    // Post is saved, remove it (unsave)
    savedPostsState = savedPostsState.filter(post => post.id !== postId);
  } else {
    // Post is not saved, add it (this would come from the post data in real app)
    // For now, we just handle removal since we start with dummy saved posts
    console.warn('Adding new saved posts not implemented in dummy data mode');
  }

  return savedPostsState;
};

export const isPostSaved = (postId: string): boolean => {
  // TODO: Replace with actual API call
  return savedPostsState.some(post => post.id === postId);
};

// User Stats - Hexagon Visualization
export interface UserStats {
  healthLevel: number; // 0-100: healthiness of food
  exp: number; // 0-100: new restaurants/food tried
  coinsSpent: number; // 0-100: priciness level
  satisfactory: number; // 0-100: based on user ratings
  balance: number; // 0-100: nutrient balance
  intensity: number; // 0-100: flavor intensity
}

export const getUserStats = (): UserStats => {
  // TODO: Replace with actual calculation from user data
  return {
    healthLevel: 72,
    exp: 85,
    coinsSpent: 58,
    satisfactory: 91,
    balance: 68,
    intensity: 79,
  };
};

// User Rankings
export interface UserRankings {
  topCuisine: {
    name: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number; // percentage change
  };
  topRestaurant: {
    name: string;
    rating: number;
    trend: 'up' | 'down' | 'stable';
  };
  eatingOutStats: {
    timesEaten: number;
    coinsSpent: number;
    avgPerVisit: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number; // percentage change
  };
}

export const getUserRankings = (): UserRankings => {
  // TODO: Replace with actual calculation from user data
  return {
    topCuisine: {
      name: 'Japanese',
      count: 24,
      trend: 'up',
      trendValue: 15,
    },
    topRestaurant: {
      name: 'Saiko Ramen Bar',
      rating: 5,
      trend: 'stable',
    },
    eatingOutStats: {
      timesEaten: 47,
      coinsSpent: 2840,
      avgPerVisit: 60.4,
      trend: 'up',
      trendValue: 8,
    },
  };
};

// Nutrient Analysis
export interface NutrientAnalysis {
  protein: {
    grams: number;
    percentage: number; // 0-100 for visual bar
  };
  fat: {
    grams: number;
    percentage: number;
  };
  sugar: {
    grams: number;
    percentage: number;
  };
}

export const getNutrientAnalysis = (): NutrientAnalysis => {
  // TODO: Replace with actual calculation from user data
  return {
    protein: {
      grams: 145,
      percentage: 72,
    },
    fat: {
      grams: 98,
      percentage: 58,
    },
    sugar: {
      grams: 62,
      percentage: 41,
    },
  };
};

// Saved Restaurants - For bookmarking restaurants
export interface SavedRestaurant {
  id: string;
  name: string;
  rating: number;
  priceRating: number;
  cuisine?: string;
  image?: string;
  timestamp: number;
}

const SAVED_RESTAURANTS_KEY = "foodily_saved_restaurants";

export const getSavedRestaurants = (): SavedRestaurant[] => {
  const saved = localStorage.getItem(SAVED_RESTAURANTS_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load saved restaurants', e);
    return [];
  }
};

export const toggleSaveRestaurant = (restaurant: Omit<SavedRestaurant, 'timestamp'>): SavedRestaurant[] => {
  const savedRestaurants = getSavedRestaurants();
  const index = savedRestaurants.findIndex(r => r.id === restaurant.id);

  if (index !== -1) {
    // Restaurant is saved, remove it (unsave)
    savedRestaurants.splice(index, 1);
  } else {
    // Restaurant is not saved, add it
    const newSavedRestaurant: SavedRestaurant = {
      ...restaurant,
      timestamp: Date.now(),
    };
    savedRestaurants.unshift(newSavedRestaurant);
  }

  localStorage.setItem(SAVED_RESTAURANTS_KEY, JSON.stringify(savedRestaurants));
  return savedRestaurants;
};

export const isRestaurantSaved = (restaurantId: string): boolean => {
  const savedRestaurants = getSavedRestaurants();
  return savedRestaurants.some(r => r.id === restaurantId);
};


