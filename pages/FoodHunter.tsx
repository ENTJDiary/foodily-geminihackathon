
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
  }, []);

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
        [] // Initial search has no exclusions
      );

      setResults(response);

      if (dish && currentUser) {
        autoLogFoodSearch(currentUser.uid, 'Search', dish);
      } else if (locationName && currentUser) {
        autoLogFoodSearch(currentUser.uid, 'Local Hunt', locationName);
      }

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
        pickedRestaurants
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
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-slate-900 uppercase tracking-tight">What are we craving for today?</h2>
        <p className="text-slate-500 font-medium italic">Spicy ramen? Juicy burgers? Or maybe a fresh acai bowl? Let's find your perfect bite.</p>
      </div>

      <div className="relative">
        <form onSubmit={handleManualSearch} className="relative bg-white p-10 rounded-[2rem] shadow-sm border border-orange-50 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Craving</label>
              <input
                type="text"
                placeholder="e.g. Spicy Ramen"
                value={dish}
                onChange={(e) => setDish(e.target.value)}
                className="w-full px-6 py-5 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 focus:bg-white transition-all font-semibold text-lg outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Location</label>
              <input
                type="text"
                placeholder="e.g. New York, NY"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-6 py-5 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 focus:bg-white transition-all font-semibold text-lg outline-none"
              />
            </div>
          </div>

          {hasRestrictions && (
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-orange-50">
              <input
                id="apply-dietary"
                type="checkbox"
                checked={applyFilters}
                onChange={() => setApplyFilters(!applyFilters)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="apply-dietary" className="text-xs font-black text-slate-600 uppercase tracking-widest cursor-pointer select-none">
                Filter by my dietary needs: <span className="text-orange-600">{profile.dietaryRestrictions.join(', ')}</span>
              </label>
            </div>
          )}

          <div className="space-y-4">
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 text-white font-bold py-5 rounded-xl transition-all shadow-md flex items-center justify-center gap-3 text-lg active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Restaurants
                </>
              )}
            </button>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsCluelesOpen(true)}
                className="px-8 py-3 bg-white hover:bg-purple-600 text-purple-600 hover:text-white font-bold rounded-xl transition-all shadow-md border-2 border-purple-600 active:scale-[0.99] text-sm"
              >
                Clueless
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Trending & Weekly Picks
        </h3>
        <TrendingSlideshow />
      </div>

      <div ref={resultsRef} className="scroll-mt-24">
        {loading && (
          <div className="animate-in fade-in duration-300">
            <LoadingRecommendations message="Finding the best spots for you 🍽️" />
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
                    restaurantId: name,
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
