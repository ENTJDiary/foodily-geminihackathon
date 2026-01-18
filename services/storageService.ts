
import { Review, RestaurantData, HistoryEntry, UserProfile, MenuItem } from "../types";

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

export const saveReview = (restaurantId: string, restaurantName: string, review: Omit<Review, "id" | "timestamp">) => {
  const allData = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "{}");
  const restaurant = getRestaurantData(restaurantId);

  const newReview: Review = {
    ...review,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now()
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
