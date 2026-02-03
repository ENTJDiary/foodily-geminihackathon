
import React, { useState, useEffect } from 'react';
import { searchRestaurantsByMaps } from '../services/geminiService';
import { Location, SearchResult, HistoryEntry } from '../types';
import RestaurantModal from '../components/common/RestaurantModal';
import { getAverageRating, getUserProfile, saveSearchToHistory } from '../services/storageService';
import { requestLocationPermission } from '../services/locationService';
import ExpertPicksSection from '../components/common/ExpertPicksSection';
import TrendingSlideshow from "@/components/common/TrendingSlideshow.tsx";
import Clueless from '../components/features/Clueless';
import LoadingRecommendations from '../components/common/LoadingRecommendations';
import { trackRestaurantClick } from '../services/restaurantClicksService';
import { useAuth } from '../src/contexts/AuthContext';
import { autoLogFoodSearch } from '../services/foodLogsService';
import { getTasteProfile } from '../services/tasteProfileService';
import { TasteProfile } from '../src/types/auth.types';
import { generateRestaurantId } from '../utils/restaurantIdUtils';


const FoodHunter: React.FC = () => {
  const { currentUser } = useAuth();
  const [dish, setDish] = useState('');
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [currentCoords, setCurrentCoords] = useState<Location | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ id: string; name: string; searchedDish?: string } | null>(null);
  const [applyFilters, setApplyFilters] = useState(false);
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);
  const [pickedRestaurants, setPickedRestaurants] = useState<string[]>([]);
  const [isCluelesOpen, setIsCluelesOpen] = useState(false);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const resultsRef = React.useRef<HTMLDivElement | null>(null);

  const profile = getUserProfile();
  const hasRestrictions = profile.dietaryRestrictions.length > 0;

  useEffect(() => {
    console.log('🚀 [FoodHunter] Component mounted - useEffect triggered');
    console.log('📍 [FoodHunter] About to request location permission...');

    // Request fresh location permission on page load (triggers browser popup)
    requestLocationPermission().then(location => {
      if (location) {
        console.log('✅ [FoodHunter] Location permission GRANTED:', location);
        setCurrentCoords(location);
      } else {
        console.log('❌ [FoodHunter] Location permission DENIED or unavailable');
        console.log('ℹ️ [FoodHunter] User can still enter locations manually');
      }
    }).catch(error => {
      console.error('💥 [FoodHunter] Unexpected error in location request:', error);
    });

    // Fetch taste profile
    if (currentUser) {
      getTasteProfile(currentUser.uid).then(profile => {
        setTasteProfile(profile);
        console.log('🧠 [FoodHunter] Taste profile loaded:', profile?.dataPoints || 0, 'data points');
      }).catch(error => {
        console.error('❌ [FoodHunter] Failed to load taste profile:', error);
      });
    }
  }, [currentUser]);

  const triggerSearch = async () => {
    if (!dish && !locationName) return;

    setLoading(true);
    setResults(null);

    // ⬇️ Scroll immediately after clicking search
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);

    try {
      let prompt = "";
      if (dish && locationName) {
        prompt = `Find the best restaurants serving "${dish}" in ${locationName}. List them with details.`;
      } else if (locationName) {
        prompt = `List top-rated restaurants in ${locationName} with diverse cuisines.`;
      } else if (dish) {
        // Explicitly mention "near me" to leverage geolocation
        prompt = `Find restaurants serving "${dish}" near me.`;
      } else {
        // Fallback if both are empty (though triggerSearch guard prevents this usually)
        prompt = "Recommend top-rated restaurants near me.";
      }

      const restrictions = applyFilters ? profile.dietaryRestrictions : [];
      const response = await searchRestaurantsByMaps(
        prompt,
        locationName ? undefined : (currentCoords || undefined),
        restrictions,
        [], // Initial search has no exclusions
        tasteProfile // Pass taste profile for personalization
      );

      setResults(response);

      // Log food search with actual dish name as cuisine (if dish is provided)
      if (dish && currentUser) {
        // Use the dish name as the cuisine - this is more accurate than "Search"
        // The taste profile will aggregate similar dishes over time
        autoLogFoodSearch(currentUser.uid, dish, dish);
      }
      // Skip logging for location-only searches - no cuisine info to extract

      if (dish) {
        saveSearchToHistory('', dish);
      }
    } catch (error) {
      console.error(error);
      alert("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (!results) return;

    setLoadingMore(true);
    try {
      let prompt = "";
      if (dish && locationName) {
        prompt = `Find the best restaurants serving "${dish}" in ${locationName}. List them with details.`;
      } else if (locationName) {
        prompt = `List top-rated restaurants in ${locationName} with diverse cuisines.`;
      } else if (dish) {
        prompt = `Find restaurants serving "${dish}" near me.`;
      } else {
        prompt = "Recommend top-rated restaurants near me.";
      }

      const restrictions = applyFilters ? profile.dietaryRestrictions : [];
      const response = await searchRestaurantsByMaps(
        prompt,
        locationName ? undefined : (currentCoords || undefined),
        restrictions,
        pickedRestaurants,
        tasteProfile // Pass taste profile for personalization
      );

      setResults(prev => prev ? {
        text: prev.text + '\n' + response.text,
        groundingChunks: [...prev.groundingChunks, ...response.groundingChunks]
      } : response);

    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="text-center space-y-4 pt-4">
        <h2 className="text-4xl md:text-5xl font-bold text-brand-black tracking-tight">
          What are we craving <span className="text-brand-orange">today?</span>
        </h2>
        <p className="text-brand-slate/70 font-medium text-lg max-w-xl mx-auto">
          Spicy ramen? Juicy burgers? Or maybe a fresh acai bowl? Let's find your perfect bite.
        </p>
      </div>

      <div className="relative">
        <form onSubmit={handleManualSearch} className="relative glass-panel p-8 md:p-10 rounded-3xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-brand-slate/60 uppercase tracking-widest ml-1">Craving</label>
              <input
                type="text"
                placeholder="e.g. Spicy Ramen"
                value={dish}
                onChange={(e) => setDish(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/60 border border-white/20 focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-brand-orange/10 transition-all font-semibold text-lg outline-none text-brand-black placeholder:text-brand-slate/30"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-brand-slate/60 uppercase tracking-widest ml-1">Location</label>
              <input
                type="text"
                placeholder="e.g. New York, NY"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/60 border border-white/20 focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-brand-orange/10 transition-all font-semibold text-lg outline-none text-brand-black placeholder:text-brand-slate/30"
              />
            </div>
          </div>

          {hasRestrictions && (
            <div className="flex items-center gap-3 bg-brand-orange/5 p-4 rounded-xl border border-brand-orange/10">
              <input
                id="apply-dietary"
                type="checkbox"
                checked={applyFilters}
                onChange={() => setApplyFilters(!applyFilters)}
                className="w-5 h-5 rounded-md text-brand-orange focus:ring-brand-orange border-brand-orange/30 cursor-pointer"
              />
              <label htmlFor="apply-dietary" className="text-xs font-bold text-brand-slate uppercase tracking-widest cursor-pointer select-none">
                Filter by my dietary needs: <span className="text-brand-orange">{profile.dietaryRestrictions.join(', ')}</span>
              </label>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              disabled={loading}
              type="submit"
              className="flex-1 bg-brand-orange hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-3 text-lg btn-bounce"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Restaurants
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsCluelesOpen(true)}
              className="px-6 py-4 bg-purple-50 hover:bg-purple-100 text-purple-600 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 btn-bounce border border-purple-200"
            >
              <span className="text-sm uppercase tracking-wider">Clueless?</span>
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-brand-black tracking-tight flex items-center gap-2">
          <span>🔥</span> Trending & Weekly Picks
        </h3>
        <TrendingSlideshow />
      </div>

      <div ref={resultsRef} className="scroll-mt-32">
        {loading && (
          <div className="animate-in fade-in duration-300 py-12">
            <LoadingRecommendations message="Finding the best spots for you..." />
          </div>
        )}

        {results && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
            <ExpertPicksSection
              text={results.text}
              maxInitialPicks={5}
              onRestaurantClick={(name) => {
                console.log('🍽️ [FoodHunter] Restaurant clicked:', name);
                setSelectedRestaurant({
                  id: name,
                  name: name,
                  searchedDish: dish
                });
                // Track restaurant click
                if (currentUser) {
                  console.log('📊 [FoodHunter] Tracking click for user:', currentUser.uid);
                  trackRestaurantClick(currentUser.uid, {
                    restaurantId: generateRestaurantId(name),
                    restaurantName: name,
                    source: 'food_hunter'
                  })
                    .then(() => console.log('✅ [FoodHunter] Click tracked successfully'))
                    .catch(err => console.error('❌ [FoodHunter] Failed to track click:', err));

                } else {
                  console.warn('⚠️ [FoodHunter] No user found, cannot track click');
                }
              }}
              onPicksExtracted={setPickedRestaurants}
              onLoadMore={handleLoadMore}
              isLoadingMore={loadingMore}
            />
          </div>
        )}
      </div>

      {selectedRestaurant && (
        <RestaurantModal
          restaurantId={selectedRestaurant.id}
          restaurantName={selectedRestaurant.name}
          searchedDish={selectedRestaurant.searchedDish}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}

      <Clueless
        isOpen={isCluelesOpen}
        onClose={() => setIsCluelesOpen(false)}
        onComplete={(cravingText) => {
          setDish(cravingText);
          setIsCluelesOpen(false);
        }}
      />
    </div>
  );
};

export default FoodHunter;
