# Firestore Database Schema - food.ily

## Overview
This document defines the complete Firestore database schema for the food.ily platform. The database uses Firebase/GCP as the backend with a user-centric data structure starting from `users/{uid}`.

**Schema Version:** 2.0  
**Last Updated:** 2026-01-29  
**Changes in v2.0:**
- Enhanced user authentication tracking (auth provider, email verification)
- Merged onboarding data into UserPreferences collection
- Added SearchHistory collection for tracking user searches
- Enhanced Restaurants collection with external API caching
- Added UserStats collection for analytics and visualization
- Added wheel options to UserPreferences for Food Gacha feature

## Collections Structure

### 1. Users Collection
**Path:** `users/{uid}`

Stores core user profile information and authentication data.

```typescript
interface User {
  uid: string;                    // Firebase Auth UID (document ID)
  email: string;                  // User email address
  displayName: string;            // User's display name
  profilePictureURL?: string;     // URL to profile picture in Firebase Storage
  dietaryPreferences: string[];   // Array of dietary preferences (e.g., ["vegetarian", "gluten-free"])
  bio?: string;                   // User biography/description
  phoneNumber?: string;           // User phone number (if provided)
  authProvider: 'google' | 'email' | 'phone'; // Authentication provider type
  emailVerified: boolean;         // Email verification status
  createdAt: Timestamp;           // Account creation timestamp
  updatedAt: Timestamp;           // Last profile update timestamp
  lastLoginAt?: Timestamp;        // Last login timestamp
}
```

**Indexes:**
- `email` (for lookup/validation)
- `createdAt` (for user analytics)

**Security Rules:**
- Users can read/write only their own document
- Profile pictures are publicly readable

---

### 2. Food Logs Collection
**Path:** `foodLogs/{logId}`

Tracks user's food hunting history and daily entries.

```typescript
interface FoodLog {
  logId: string;                  // Auto-generated document ID
  userId: string;                 // Reference to users/{uid}
  date: Timestamp;                // Date of the food log entry
  cuisineType: string;            // Type of cuisine (e.g., "Italian", "Japanese")
  foodType: string;               // Specific food type (e.g., "Pizza", "Sushi")
  restaurantId?: string;          // Reference to restaurants/{restaurantId} if visited
  restaurantName?: string;        // Restaurant name (denormalized for quick access)
  rating?: number;                // User rating (1-5 scale)
  notes?: string;                 // Additional notes or comments
  createdAt: Timestamp;           // Entry creation timestamp
  updatedAt: Timestamp;           // Last update timestamp
}
```

**Indexes:**
- Composite: `userId` + `date` (DESC) - for user's food log history
- `userId` + `createdAt` (DESC) - for chronological queries
- `restaurantId` - for restaurant-specific logs

**Security Rules:**
- Users can only read/write their own food logs
- Queries must filter by authenticated user's `userId`

---

### 3. Restaurants Collection
**Path:** `restaurants/{restaurantId}`

Shared collection of restaurant data accessible to all users. Caches data from external APIs and supports user-generated restaurants.

```typescript
interface Restaurant {
  restaurantId: string;           // Auto-generated or external API ID
  name: string;                   // Restaurant name
  address: string;                // Full address
  location: {                     // Geolocation data
    latitude: number;
    longitude: number;
  };
  cuisineTypes: string[];         // Array of cuisine types
  priceRange: number;             // Price indicator (1-4, $ to $$$$)
  rating?: number;                // Average rating from reviews
  totalReviews: number;           // Count of reviews (for aggregation)
  photos: string[];               // Array of photo URLs
  phoneNumber?: string;           // Contact number
  website?: string;               // Restaurant website
  hours?: {                       // Operating hours
    [day: string]: string;        // e.g., "monday": "9:00 AM - 10:00 PM"
  };
  tags: string[];                 // Searchable tags (e.g., ["outdoor seating", "family-friendly"])
  
  // Data Source & Caching
  dataSource: 'google_places' | 'gemini_ai' | 'user_generated'; // Where data originated
  externalId?: string;            // ID from external API (Google Places, Yelp, etc.)
  placeId?: string;               // Google Places ID (if from Google)
  lastSyncedAt?: Timestamp;       // Last time data was synced from external API
  cacheExpiresAt?: Timestamp;     // When cached data should be refreshed
  
  // User-Generated Restaurant Fields
  addedByUserId?: string;         // User who added this restaurant (if user-generated)
  isVerified: boolean;            // Whether restaurant has been verified by admin/system
  
  // Metadata
  createdAt: Timestamp;           // Entry creation timestamp
  updatedAt: Timestamp;           // Last update timestamp
}
```

**Indexes:**
- `name` (for search)
- Composite: `cuisineTypes` + `rating` (DESC)
- Geohash index for location-based queries
- `externalId` (for API synchronization)

**Security Rules:**
- All users can read restaurant data
- Only admin users can write/update restaurant data

---

### 4. Reviews Collection
**Path:** `reviews/{reviewId}`

User reviews and ratings for restaurants.

```typescript
interface Review {
  reviewId: string;               // Auto-generated document ID
  userId: string;                 // Reference to users/{uid}
  userName: string;               // Denormalized user display name
  userProfilePicture?: string;    // Denormalized user profile picture URL
  restaurantId: string;           // Reference to restaurants/{restaurantId}
  restaurantName: string;         // Denormalized restaurant name
  rating: number;                 // Rating (1-5 scale)
  commentText: string;            // Review text content
  photos: string[];               // Array of photo URLs from Firebase Storage
  likes: number;                  // Count of likes/reactions
  timestamp: Timestamp;           // Review creation timestamp
  updatedAt?: Timestamp;          // Last edit timestamp
  isEdited: boolean;              // Flag if review was edited
}
```

**Indexes:**
- Composite: `restaurantId` + `timestamp` (DESC) - for restaurant reviews
- Composite: `userId` + `timestamp` (DESC) - for user's review history
- `restaurantId` + `rating` (DESC) - for top-rated reviews

**Security Rules:**
- All users can read reviews
- Users can only create/edit/delete their own reviews
- Denormalized fields update via Cloud Functions

---

### 5. Review Likes Collection
**Path:** `reviewLikes/{likeId}`

Tracks which users liked which reviews.

```typescript
interface ReviewLike {
  likeId: string;                 // Auto-generated document ID
  reviewId: string;               // Reference to reviews/{reviewId}
  userId: string;                 // Reference to users/{uid}
  timestamp: Timestamp;           // When the like was created
}
```

**Indexes:**
- Composite: `reviewId` + `userId` (unique) - prevent duplicate likes
- `userId` + `timestamp` (DESC) - user's like history

**Security Rules:**
- Users can only create/delete their own likes
- Cloud Function updates `likes` count on reviews

---

### 6. Community Posts Collection
**Path:** `communityPosts/{postId}`

User-generated community posts and food-related content.

```typescript
interface CommunityPost {
  postId: string;                 // Auto-generated document ID
  userId: string;                 // Reference to users/{uid}
  userName: string;               // Denormalized user display name
  userProfilePicture?: string;    // Denormalized user profile picture URL
  content: string;                // Post text content
  photos: string[];               // Array of photo URLs
  restaurantId?: string;          // Optional reference to restaurants/{restaurantId}
  restaurantName?: string;        // Denormalized restaurant name
  tags: string[];                 // Hashtags or topic tags
  likes: number;                  // Count of likes/reactions
  commentCount: number;           // Count of comments
  timestamp: Timestamp;           // Post creation timestamp
  updatedAt?: Timestamp;          // Last edit timestamp
  isEdited: boolean;              // Flag if post was edited
}
```

**Indexes:**
- `timestamp` (DESC) - for feed chronological order
- Composite: `userId` + `timestamp` (DESC) - user's posts
- `restaurantId` + `timestamp` (DESC) - restaurant-related posts
- `tags` (array-contains) - for tag-based filtering

**Security Rules:**
- All users can read posts
- Users can only create/edit/delete their own posts

---

### 7. Post Likes Collection
**Path:** `postLikes/{likeId}`

Tracks which users liked which community posts.

```typescript
interface PostLike {
  likeId: string;                 // Auto-generated document ID
  postId: string;                 // Reference to communityPosts/{postId}
  userId: string;                 // Reference to users/{uid}
  timestamp: Timestamp;           // When the like was created
}
```

**Indexes:**
- Composite: `postId` + `userId` (unique) - prevent duplicate likes
- `userId` + `timestamp` (DESC) - user's like history

**Security Rules:**
- Users can only create/delete their own likes
- Cloud Function updates `likes` count on posts

---

### 8. Post Comments Collection
**Path:** `postComments/{commentId}`

Comments on community posts.

```typescript
interface PostComment {
  commentId: string;              // Auto-generated document ID
  postId: string;                 // Reference to communityPosts/{postId}
  userId: string;                 // Reference to users/{uid}
  userName: string;               // Denormalized user display name
  userProfilePicture?: string;    // Denormalized user profile picture URL
  commentText: string;            // Comment content
  timestamp: Timestamp;           // Comment creation timestamp
  updatedAt?: Timestamp;          // Last edit timestamp
  isEdited: boolean;              // Flag if comment was edited
}
```

**Indexes:**
- Composite: `postId` + `timestamp` (ASC) - chronological comments
- `userId` + `timestamp` (DESC) - user's comment history

**Security Rules:**
- All users can read comments
- Users can only create/edit/delete their own comments
- Cloud Function updates `commentCount` on posts

---

### 9. User Preferences Collection
**Path:** `userPreferences/{uid}`

Stores user's preferences, onboarding data, and personalization settings.

```typescript
interface WheelOption {
  id: string;                     // Unique option ID
  name: string;                   // Option name (cuisine/restaurant)
  color: string;                  // Hex color for wheel segment
  timestamp: number;              // When option was added
}

interface UserPreferences {
  userId: string;                 // Firebase Auth UID (document ID)
  
  // Onboarding Data (merged from onboardingData collection)
  city: string;                   // User's city location
  dateOfBirth: string;            // ISO date string (YYYY-MM-DD)
  sex: 'Male' | 'Female' | 'Prefer not to say'; // User's sex/gender
  termsAccepted: boolean;         // Terms and conditions acceptance
  onboardingCompletedAt?: Timestamp; // When onboarding was completed
  
  // Cuisine & Dietary Preferences
  cuisinePreferences: string[];   // Preferred cuisines (e.g., ["Italian", "Mexican"])
  dietaryRestrictions: string[];  // Dietary restrictions (e.g., ["vegetarian", "nut-free"])
  
  // Restaurant Preferences
  priceRangePreference?: number[]; // Preferred price range [min, max] (1-4)
  distancePreference?: number;    // Max distance in miles/km
  favoriteRestaurants: string[];  // Array of restaurant IDs
  blockedRestaurants: string[];   // Restaurants user wants to avoid
  
  // Food Wheel Options
  wheelOptions: WheelOption[];    // Custom options for food wheel feature
  
  // Metadata
  createdAt: Timestamp;           // Preferences creation timestamp
  updatedAt: Timestamp;           // Last update timestamp
}
```

**Indexes:**
- `userId` (document ID serves as index)

**Security Rules:**
- Users can only read/write their own preferences

---

### 10. Search History Collection
**Path:** `searchHistory/{searchId}`

Tracks user's search queries and exploration history (separate from actual food logs).

```typescript
interface SearchHistory {
  searchId: string;               // Auto-generated document ID
  userId: string;                 // Reference to users/{uid}
  searchQuery: string;            // The search query text
  searchType: 'dish' | 'cuisine' | 'restaurant' | 'location'; // Type of search
  dishName?: string;              // Dish searched for (if applicable)
  cuisineType?: string;           // Cuisine type searched (if applicable)
  locationSearched?: string;      // Location used in search
  resultsCount: number;           // Number of results returned
  timestamp: Timestamp;           // When search was performed
  userLocation?: {                // User's location at time of search
    latitude: number;
    longitude: number;
  };
}
```

**Indexes:**
- Composite: `userId` + `timestamp` (DESC) - for user's search history
- `userId` + `searchType` - for filtering by search type
- `timestamp` (DESC) - for recent searches across all users (analytics)

**Security Rules:**
- Users can only read/write their own search history
- Queries must filter by authenticated user's `userId`

---

### 11. Saved Restaurants Collection
**Path:** `savedRestaurants/{saveId}`

User's saved/favorited restaurants with metadata.

```typescript
interface SavedRestaurant {
  saveId: string;                 // Auto-generated document ID
  userId: string;                 // Reference to users/{uid}
  restaurantId: string;           // Reference to restaurants/{restaurantId}
  restaurantName: string;         // Denormalized restaurant name
  restaurantPhoto?: string;       // Denormalized primary photo URL
  cuisineTypes: string[];         // Denormalized cuisine types
  notes?: string;                 // User's personal notes about this restaurant
  tags: string[];                 // User's custom tags (e.g., ["date night", "quick lunch"])
  savedAt: Timestamp;             // When the restaurant was saved
  lastVisited?: Timestamp;        // Last time user logged visiting this place
  visitCount: number;             // Number of times visited
}
```

**Indexes:**
- Composite: `userId` + `savedAt` (DESC) - user's saved restaurants
- Composite: `userId` + `restaurantId` (unique) - prevent duplicates

**Security Rules:**
- Users can only read/write their own saved restaurants

---

### 12. Recommendation History Collection
**Path:** `recommendationHistory/{recommendationId}`

Tracks AI-generated recommendations from the Food Gacha feature.

```typescript
interface RecommendationHistory {
  recommendationId: string;       // Auto-generated document ID
  userId: string;                 // Reference to users/{uid}
  timestamp: Timestamp;           // When recommendation was generated
  cuisineType: string;            // Selected/recommended cuisine type
  foodType: string;               // Selected/recommended food type
  recommendedRestaurants: {       // Array of recommended restaurants
    restaurantId: string;
    restaurantName: string;
    reason?: string;              // AI-generated reason for recommendation
    rank: number;                 // Ranking in recommendation list (1-n)
  }[];
  userLocation?: {                // User's location at time of request
    latitude: number;
    longitude: number;
  };
  filters: {                      // Filters applied during recommendation
    priceRange?: number[];
    distance?: number;
    dietaryRestrictions?: string[];
  };
  selectedRestaurantId?: string;  // Which restaurant user chose (if any)
  wasHelpful?: boolean;           // User feedback on recommendation quality
}
```

**Indexes:**
- Composite: `userId` + `timestamp` (DESC) - user's recommendation history
- `userId` + `cuisineType` - for preference learning

**Security Rules:**
- Users can only read/write their own recommendation history

---

### 13. User Stats Collection
**Path:** `userStats/{uid}`

Stores aggregated user statistics for analytics and visualization. Updated via Cloud Functions and real-time calculations.

```typescript
interface UserStats {
  userId: string;                 // Firebase Auth UID (document ID)
  
  // Hexagon Stats (0-100 scale for visualization)
  healthLevel: number;            // Healthiness of food choices
  exp: number;                    // New restaurants/food tried (exploration)
  coinsSpent: number;             // Priciness level of dining
  satisfactory: number;           // Based on user ratings
  balance: number;                // Nutrient balance
  intensity: number;              // Flavor intensity preference
  
  // Top Rankings
  topCuisine: {
    name: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;           // Percentage change
  };
  topRestaurant: {
    restaurantId: string;
    name: string;
    rating: number;
    visitCount: number;
    trend: 'up' | 'down' | 'stable';
  };
  
  // Eating Out Statistics
  eatingOutStats: {
    timesEaten: number;           // Total dining out count
    coinsSpent: number;           // Total money spent
    avgPerVisit: number;          // Average cost per visit
    trend: 'up' | 'down' | 'stable';
    trendValue: number;           // Percentage change
  };
  
  // Nutrient Analysis (aggregated from food logs)
  nutrientAnalysis: {
    protein: { grams: number; percentage: number; };
    fat: { grams: number; percentage: number; };
    sugar: { grams: number; percentage: number; };
  };
  
  // Activity Counts
  totalRestaurantsExplored: number;
  totalReviewsWritten: number;
  totalMenuItemsPosted: number;
  totalLikesReceived: number;
  
  // Metadata
  lastCalculatedAt: Timestamp;    // Last time stats were calculated
  calculationMethod: 'realtime' | 'aggregated'; // How stats were computed
  updatedAt: Timestamp;           // Last update timestamp
}
```

**Indexes:**
- `userId` (document ID serves as index)
- `lastCalculatedAt` (for identifying stale stats)

**Security Rules:**
- Users can read their own stats
- Only Cloud Functions can write stats

**Cloud Function Triggers:**
- `calculateUserStats` - Triggered on schedule (daily) or on-demand
- `updateStatsOnActivity` - Triggered when user creates reviews, logs, etc.

---

## Data Relationships

```mermaid
graph TB
    Users[users/{uid}]
    FoodLogs[foodLogs/{logId}]
    Restaurants[restaurants/{restaurantId}]
    Reviews[reviews/{reviewId}]
    ReviewLikes[reviewLikes/{likeId}]
    CommunityPosts[communityPosts/{postId}]
    PostLikes[postLikes/{likeId}]
    PostComments[postComments/{commentId}]
    UserPrefs[userPreferences/{uid}]
    SearchHistory[searchHistory/{searchId}]
    SavedRest[savedRestaurants/{saveId}]
    RecHistory[recommendationHistory/{recommendationId}]
    UserStats[userStats/{uid}]

    Users -->|userId| FoodLogs
    Users -->|userId| Reviews
    Users -->|userId| ReviewLikes
    Users -->|userId| CommunityPosts
    Users -->|userId| PostLikes
    Users -->|userId| PostComments
    Users -->|userId| UserPrefs
    Users -->|userId| SearchHistory
    Users -->|userId| SavedRest
    Users -->|userId| RecHistory
    Users -->|userId| UserStats
    
    Restaurants -->|restaurantId| FoodLogs
    Restaurants -->|restaurantId| Reviews
    Restaurants -->|restaurantId| CommunityPosts
    Restaurants -->|restaurantId| SavedRest
    Restaurants -->|restaurantId| RecHistory
    
    Reviews -->|reviewId| ReviewLikes
    CommunityPosts -->|postId| PostLikes
    CommunityPosts -->|postId| PostComments
```

## Cloud Functions & Triggers

### Recommended Cloud Functions

1. **updateReviewAggregates**
   - Trigger: `onCreate`, `onUpdate`, `onDelete` on `reviews/{reviewId}`
   - Updates `restaurants/{restaurantId}` with new average rating and review count

2. **updateReviewLikeCount**
   - Trigger: `onCreate`, `onDelete` on `reviewLikes/{likeId}`
   - Updates `reviews/{reviewId}` likes count

3. **updatePostLikeCount**
   - Trigger: `onCreate`, `onDelete` on `postLikes/{likeId}`
   - Updates `communityPosts/{postId}` likes count

4. **updatePostCommentCount**
   - Trigger: `onCreate`, `onDelete` on `postComments/{commentId}`
   - Updates `communityPosts/{postId}` comment count

5. **syncUserProfile**
   - Trigger: `onUpdate` on `users/{uid}`
   - Updates denormalized user data across reviews, posts, and comments

6. **cleanupUserData**
   - Trigger: `onDelete` on `users/{uid}`
   - Removes all user-related data across collections (GDPR compliance)

## Security Rules Summary

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }
    
    // Food logs - users can only access their own
    match /foodLogs/{logId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Restaurants - read-only for users
    match /restaurants/{restaurantId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only admin via Cloud Functions
    }
    
    // Reviews - users can manage their own
    match /reviews/{reviewId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Review likes
    match /reviewLikes/{likeId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Community posts
    match /communityPosts/{postId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Post likes
    match /postLikes/{likeId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Post comments
    match /postComments/{commentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // User preferences
    match /userPreferences/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Saved restaurants
    match /savedRestaurants/{saveId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Recommendation history
    match /recommendationHistory/{recommendationId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Storage Structure

### Firebase Storage Buckets

**Path:** `gs://{project-id}.appspot.com/`

```
/users/{uid}/
  /profile/
    - profile-picture.jpg
  /reviews/{reviewId}/
    - photo-1.jpg
    - photo-2.jpg
  /posts/{postId}/
    - photo-1.jpg
    - photo-2.jpg

/restaurants/{restaurantId}/
  - photo-1.jpg
  - photo-2.jpg
  - menu.pdf
```

**Storage Rules:**
- Users can upload to their own `/users/{uid}/` path
- All uploaded images should be optimized/compressed
- Maximum file size: 10MB per image
- Allowed formats: JPEG, PNG, WebP

## Best Practices & Considerations

### 1. Data Denormalization
- User display names and profile pictures are denormalized in reviews, posts, and comments
- Restaurant names are denormalized in food logs and saved restaurants
- This improves read performance but requires Cloud Functions to keep data in sync

### 2. Pagination
- Use cursor-based pagination for feeds and lists
- Limit queries to 20-50 documents per page
- Use `startAfter()` with the last document for next page

### 3. Caching Strategy
- Cache restaurant data on client (updates infrequently)
- Use real-time listeners for user-specific data (food logs, preferences)
- Implement offline persistence for better UX

### 4. Cost Optimization
- Use composite indexes strategically (each adds cost)
- Implement client-side filtering when possible
- Cache frequently accessed data
- Use Cloud Functions for aggregations instead of client-side calculations

### 5. Scalability
- Restaurant collection can grow large - consider sharding by region if needed
- Use Cloud Functions for heavy computations (recommendation algorithms)
- Implement rate limiting on write operations

### 6. Privacy & Compliance
- User data deletion via Cloud Function ensures GDPR compliance
- Sensitive data (email) only in user's own document
- Audit logs for data access (if required)

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-09  
**Maintained By:** food.ily Development Team
