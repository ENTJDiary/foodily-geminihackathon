import React, { useState, useEffect } from 'react';
import { getRestaurantData, saveReview, getAverageRating, addMenuItem, toggleReviewLike } from '../../services/storageService';
import { getRestaurantDetails } from '../../services/geminiService';
import { searchPlaceByName, getGoogleMapsUrl } from '../../services/placesService';
import { Review, SearchResult, MenuItem, PlaceDetails } from '../../types';
import PriceRating from './PriceRating';
import GourmetBriefPage from '../restaurant/pages/GourmetBriefPage';
import CommunityInsightsPage from '../restaurant/pages/CommunityInsightsPage';
import CommunityMenuPage from '../restaurant/pages/CommunityMenuPage';

interface RestaurantModalProps {
  restaurantId: string;
  restaurantName: string;
  searchedDish?: string;
  onClose: () => void;
}

const RestaurantModal: React.FC<RestaurantModalProps> = ({ restaurantId, restaurantName, searchedDish, onClose }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [details, setDetails] = useState<SearchResult | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);

  // Modal states
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showAddDish, setShowAddDish] = useState(false);
  const [showInsightForm, setShowInsightForm] = useState(false);

  // Function to load restaurant details (can be called for retry)
  const loadDetails = async () => {
    setLoadingDetails(true);
    setDetailsError(null); // Reset error state
    try {
      console.log('🔍 Fetching restaurant details for:', restaurantName);
      const result = await getRestaurantDetails(restaurantName);
      console.log('✅ Restaurant details loaded:', result);
      setDetails(result);
    } catch (error) {
      console.error('❌ Failed to load restaurant details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setDetailsError(errorMessage);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const data = getRestaurantData(restaurantId);
    setReviews(data.reviews);
    setMenuItems(data.menuItems);
    setAvgRating(getAverageRating(restaurantId));
    loadDetails();

    // Fetch place details from Google Places API
    searchPlaceByName(restaurantName).then(place => {
      if (place) {
        console.log('📍 Place details loaded:', place);
        setPlaceDetails(place);
      }
    }).catch(error => {
      console.error('Failed to fetch place details:', error);
    });
  }, [restaurantId, restaurantName]);

  // Handlers for Community Insights
  const handleSubmitInsight = (data: { userName: string; rating: number; comment: string }) => {
    saveReview(restaurantId, restaurantName, data);
    const updatedData = getRestaurantData(restaurantId);
    setReviews(updatedData.reviews);
    setAvgRating(getAverageRating(restaurantId));
  };

  const handleToggleReviewLike = (reviewId: string) => {
    const updatedReviews = toggleReviewLike(restaurantId, reviewId);
    setReviews(updatedReviews);
    // Also update selectedReview if it matches
    if (selectedReview && selectedReview.id === reviewId) {
      const updatedReview = updatedReviews.find(r => r.id === reviewId);
      if (updatedReview) setSelectedReview(updatedReview);
    }
  };

  // Handlers for Community Menu
  const handleSubmitMenuItem = (data: {
    title: string;
    images: string[];
    dishes: { name: string; price: string; desc: string; rating: number }[];
    rating: number;
    experience: string;
  }) => {
    const primaryDish = data.dishes[0];

    try {
      addMenuItem(restaurantId, restaurantName, {
        name: primaryDish.name,
        description: primaryDish.desc || '',
        price: primaryDish.price,
        image: data.images[0] || undefined,
        title: data.title,
        images: data.images,
        dishes: data.dishes.map(d => ({
          name: d.name,
          price: d.price,
          description: d.desc,
          rating: d.rating
        })),
        rating: data.rating,
        experience: data.experience,
        userName: "Local Explorer",
        timestamp: Date.now()
      });

      const updatedData = getRestaurantData(restaurantId);
      setMenuItems(updatedData.menuItems);
    } catch (error) {
      console.error("❌ ERROR:", error);
      const isQuotaError = error instanceof Error &&
        (error.name === 'QuotaExceededError' ||
          error.message.includes('quota') ||
          error.message.includes('storage'));

      if (isQuotaError) {
        alert("Storage quota exceeded! Try using fewer or smaller images.");
      } else {
        alert("Failed to save post. Please try again.");
      }
    }
  };

  const toggleLike = (itemId: string) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const isLiked = !item.isLiked;
        const currentLikes = item.likes ?? Math.floor(Math.random() * 50) + 1;
        return {
          ...item,
          isLiked,
          likes: isLiked ? currentLikes + 1 : currentLikes - 1
        };
      }
      return item;
    }));
  };

  // Calculate price rating
  const calculatePriceRating = (): number => {
    const pricedItems = menuItems.filter(i => i.price);
    if (pricedItems.length > 0) {
      const total = pricedItems.reduce((sum, item) => {
        const val = parseFloat(item.price!.replace(/[^0-9.]/g, ''));
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
      const avg = total / pricedItems.length;
      if (avg < 10) return 1;
      else if (avg < 20) return 2;
      else if (avg < 40) return 3;
      else return 4;
    } else if (details?.text) {
      const match = details.text.match(/Price Rating:\s*([1-4])\s*\/?/i);
      if (match) return parseInt(match[1]);
    }
    return 0;
  };

  const priceRating = calculatePriceRating();

  const handleExploreClick = () => {
    const mapsUrl = getGoogleMapsUrl(restaurantName, placeDetails);
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-500 border border-orange-50">
        {/* Header */}
        <div className="p-10 bg-orange-600 text-white flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase leading-none mb-4">{restaurantName}</h2>
            <div className="flex items-center gap-3">
              <div className="flex text-white">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className={`w-5 h-5 ${avgRating >= s ? 'fill-current' : 'opacity-20'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-black text-lg">{avgRating > 0 ? avgRating.toFixed(1) : 'New'}</span>
              <span className="text-orange-200 text-xs font-bold uppercase tracking-widest ml-2">({reviews.length} Insights)</span>
            </div>
            <div className="mt-4 flex items-center gap-4">
              {priceRating > 0 && (
                <PriceRating rating={priceRating} />
              )}
              <button
                onClick={handleExploreClick}
                className="px-4 py-2 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-all shadow-md flex items-center gap-1.5 active:scale-95 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Explore
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Single Page Content - All Sections */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          {/* Gourmet Brief Section */}
          <GourmetBriefPage details={details} loadingDetails={loadingDetails} error={detailsError} onRetry={loadDetails} />

          {/* Community Insights Section */}
          <CommunityInsightsPage
            reviews={reviews}
            selectedReview={selectedReview}
            showInsightForm={showInsightForm}
            onAddInsightClick={() => setShowInsightForm(true)}
            onReviewClick={setSelectedReview}
            onCloseReviewDetail={() => setSelectedReview(null)}
            onCloseInsightForm={() => setShowInsightForm(false)}
            onSubmitInsight={handleSubmitInsight}
            onToggleLike={handleToggleReviewLike}
          />

          {/* Community Menu Section */}
          <CommunityMenuPage
            menuItems={menuItems}
            selectedMenuItem={selectedMenuItem}
            showAddDish={showAddDish}
            searchedDish={searchedDish}
            onAddDishClick={() => setShowAddDish(true)}
            onMenuItemClick={setSelectedMenuItem}
            onCloseMenuItemDetail={() => setSelectedMenuItem(null)}
            onCloseAddDish={() => setShowAddDish(false)}
            onSubmitMenuItem={handleSubmitMenuItem}
            onToggleLike={toggleLike}
          />
        </div>
      </div>
    </div>
  );
};

export default RestaurantModal;
