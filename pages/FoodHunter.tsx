
import React, { useState, useEffect } from 'react';
import { searchRestaurantsByMaps } from '../services/geminiService';
import { Location, SearchResult, HistoryEntry } from '../types';
import RestaurantModal from '../components/common/RestaurantModal';
import { getAverageRating, getUserProfile, saveSearchToHistory } from '../services/storageService';
import ExpertPicksSection from '../components/common/ExpertPicksSection';
import TrendingSlideshow from "@/components/common/TrendingSlideshow.tsx";
import Clueless from '../components/features/Clueless';


const FoodHunter: React.FC = () => {
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => console.warn("Geolocation failed", err)
      );
    }
  }, []);

  const triggerSearch = async () => {
    if (!dish && !locationName) return;

    setLoading(true);
    setShowAllRestaurants(false); // Reset to show limited results on new search

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
        prompt = `Find restaurants serving "${dish}" near my current location.`;
      }

      const restrictions = applyFilters ? profile.dietaryRestrictions : [];
      const response = await searchRestaurantsByMaps(
        prompt,
        currentCoords || undefined,
        restrictions
      );

      setResults(response);

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
            <div className="p-10 bg-white border border-orange-50 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-6">
              <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />

              <div className="text-center space-y-1">
                <p className="font-bold text-slate-800 tracking-tight">
                  Finding the best spots for you 🍽️
                </p>
                <p className="text-sm text-slate-500">
                  Scanning menus, reviews, and hidden gems…
                </p>
              </div>
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
            <ExpertPicksSection
              text={results.text}
              maxInitialPicks={5}
              onPicksExtracted={(names) => setPickedRestaurants(names)}
              onRestaurantClick={(name) => setSelectedRestaurant({
                id: name,
                name: name,
                searchedDish: dish
              })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(showAllRestaurants ? results.groundingChunks : results.groundingChunks.slice(0, 10))
                .filter(chunk => {
                  // Filter out restaurants that are already in the top picks
                  const restaurantName = chunk.maps?.title || 'Unknown Restaurant';
                  return !pickedRestaurants.some(picked =>
                    restaurantName.toLowerCase().includes(picked.toLowerCase()) ||
                    picked.toLowerCase().includes(restaurantName.toLowerCase())
                  );
                })
                .map((chunk, idx) => {
                  if (!chunk.maps) return null;
                  // Handle optional title field from API metadata
                  const restaurantName = chunk.maps.title || 'Unknown Restaurant';
                  const appRating = getAverageRating(restaurantName);

                  return (
                    <div key={idx} className="p-8 bg-white border border-orange-50 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <h5 className="font-bold text-slate-900 text-xl truncate pr-4 tracking-tight group-hover:text-orange-600 transition-colors">{restaurantName}</h5>
                        {/* Handle optional uri field from API metadata */}
                        <a href={chunk.maps.uri || '#'} target="_blank" rel="noopener" className="text-slate-300 hover:text-orange-600 transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      </div>
                      <div className="flex items-center gap-2 mb-8">
                        <div className="flex text-orange-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} className={`w-4 h-4 ${appRating >= s ? 'fill-current' : 'text-slate-100'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{appRating > 0 ? `${appRating.toFixed(1)} Rating` : 'New'}</span>
                      </div>
                      <button
                        onClick={() => setSelectedRestaurant({ id: restaurantName, name: restaurantName, searchedDish: dish })}
                        className="w-full bg-orange-50 hover:bg-orange-600 hover:text-white text-orange-700 font-bold py-4 rounded-xl text-xs transition-all uppercase tracking-widest border border-orange-100"
                      >
                        Community Insights
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Show More Button */}
            {!showAllRestaurants && results.groundingChunks.length > 10 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowAllRestaurants(true)}
                  className="bg-white hover:bg-orange-600 text-orange-700 hover:text-white font-bold px-8 py-4 rounded-xl transition-all uppercase tracking-widest border-2 border-orange-600 shadow-sm hover:shadow-md active:scale-[0.99] flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  Show More Recommendations
                  <span className="text-xs font-black bg-orange-100 px-2 py-1 rounded-lg">
                    +{results.groundingChunks.length - 10}
                  </span>
                </button>
              </div>
            )}
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
