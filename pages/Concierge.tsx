
import React, { useState, useEffect, useRef } from 'react';
import { conciergeChat } from '../services/geminiService';
import { SearchResult } from '../types';
import RestaurantModal from '../components/common/RestaurantModal';
import ExpertPicksSection from '../components/common/ExpertPicksSection';
import { getAverageRating } from '../services/storageService';
import { getCurrentLocation } from '../services/locationService';
import LoadingRecommendations from '../components/common/LoadingRecommendations';
import { trackRestaurantClick } from '../services/restaurantClicksService';
import { useAuth } from '../src/contexts/AuthContext';
import { autoLogFoodSearch } from '../services/foodLogsService';
import { getTasteProfile } from '../services/tasteProfileService';
import { TasteProfile } from '../src/types/auth.types';
import { generateRestaurantId } from '../utils/restaurantIdUtils';


const Concierge: React.FC = () => {
  const { currentUser } = useAuth();
  const [occasion, setOccasion] = useState('');
  const [people, setPeople] = useState('');
  const [request, setRequest] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState(50);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ id: string; name: string } | null>(null);
  const [pickedRestaurants, setPickedRestaurants] = useState<string[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentSearch, setCurrentSearch] = useState<{
    occasion: string;
    people: string;
    request: string;
    location?: string;
    budget?: number;
    locationCoords?: { latitude: number; longitude: number };
  } | null>(null);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occasion || !people || !request) return;

    setLoading(true);
    setResult(null);
    try {
      // Only pass location and budget if the advanced section is open
      const effectiveLocation = showAdvanced ? location : undefined;
      const effectiveBudget = showAdvanced ? budget : undefined;

      // If no location text provided, try to get current location
      let coords;
      if (!effectiveLocation) {
        const currentLoc = await getCurrentLocation();
        if (currentLoc) {
          coords = currentLoc;
        }
      }

      setCurrentSearch({
        occasion,
        people,
        request,
        location: effectiveLocation,
        budget: effectiveBudget,
        locationCoords: coords
      });

      const response = await conciergeChat(occasion, people, request, effectiveLocation, effectiveBudget, [], coords, tasteProfile);
      setResult(response);

      if (currentUser) {
        autoLogFoodSearch(currentUser.uid, 'Concierge', occasion);
      }
    } catch (error) {
      console.error(error);
      alert("Concierge is currently busy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!result || !currentSearch) return;

    setLoadingMore(true);
    try {
      const response = await conciergeChat(
        currentSearch.occasion,
        currentSearch.people,
        currentSearch.request,
        currentSearch.location,
        currentSearch.budget,
        pickedRestaurants,
        currentSearch.locationCoords,
        tasteProfile
      );

      setResult(prev => prev ? {
        text: prev.text + '\n' + response.text,
        groundingChunks: [...prev.groundingChunks, ...response.groundingChunks]
      } : response);
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if ((result || loading) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result, loading]);

  // Fetch taste profile
  useEffect(() => {
    if (currentUser) {
      getTasteProfile(currentUser.uid).then(profile => {
        setTasteProfile(profile);
        console.log('🧠 [Concierge] Taste profile loaded:', profile?.dataPoints || 0, 'data points');
      }).catch(error => {
        console.error('❌ [Concierge] Failed to load taste profile:', error);
      });
    }
  }, [currentUser]);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      <div className="text-center space-y-4 pt-4">
        <h2 className="text-4xl md:text-5xl font-bold text-brand-black tracking-tight">
          The Dining <span className="text-brand-orange">Concierge</span>
        </h2>
        <p className="text-brand-slate/70 font-medium text-lg max-w-xl mx-auto">
          Planning something special? Let us curate the perfect table for your group.
        </p>
      </div>

      <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-brand-slate/60 uppercase tracking-widest ml-1">The Occasion</label>
              <input
                type="text"
                placeholder="e.g. New Year's Eve Date"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/60 border border-white/20 focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-brand-orange/10 transition-all font-semibold text-lg outline-none text-brand-black placeholder:text-brand-slate/30"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-brand-slate/60 uppercase tracking-widest ml-1">The Group</label>
              <input
                type="text"
                placeholder="e.g. My partner"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/60 border border-white/20 focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-brand-orange/10 transition-all font-semibold text-lg outline-none text-brand-black placeholder:text-brand-slate/30"
              />
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-bold text-brand-orange uppercase tracking-widest ml-1 hover:text-orange-700 transition-colors group"
            >
              <div className={`p-1 rounded-full bg-brand-orange/10 group-hover:bg-brand-orange/20 transition-colors ${showAdvanced ? 'rotate-180' : ''}`}>
                <svg
                  className="w-4 h-4 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              Advanced Options
            </button>
          </div>

          {/* Advanced Options - Expandable */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${showAdvanced ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 pb-2">
              {/* Location Input */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-brand-slate/60 uppercase tracking-widest ml-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Downtown Manhattan"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-white/60 border border-white/20 focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-brand-orange/10 transition-all font-semibold text-lg outline-none text-brand-black placeholder:text-brand-slate/30"
                />
              </div>

              {/* Budget Slider */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-brand-slate/60 uppercase tracking-widest ml-1">Budget per Person</label>
                <div className="space-y-6 pt-1">
                  <div className="relative pt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={budget}
                      onChange={(e) => setBudget(parseInt(e.target.value))}
                      className="w-full h-2 bg-brand-slate/10 rounded-lg appearance-none cursor-pointer relative z-10 accent-brand-orange"
                      style={{
                        background: `linear-gradient(to right, #ea580c 0%, #ea580c ${(budget / 100) * 100}%, #e2e8f0 ${(budget / 100) * 100}%, #e2e8f0 100%)`
                      }}
                    />

                    {/* Visual Ticks */}
                    <div className="absolute top-2 left-0 w-full h-2 pointer-events-none z-0">
                      <div className="absolute left-[0%] w-0.5 h-3 -top-0.5 bg-brand-slate/20"></div>
                      <div className="absolute left-[50%] w-0.5 h-3 -top-0.5 bg-brand-slate/20"></div>
                      <div className="absolute left-[100%] w-0.5 h-3 -top-0.5 bg-brand-slate/20" style={{ transform: 'translateX(-100%)' }}></div>
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-brand-slate/40 mt-2 relative uppercase tracking-widest">
                      <span className="absolute left-0 -translate-x-1/4">$0</span>
                      <span className="absolute left-[50%] -translate-x-1/2">$50</span>
                      <span className="absolute right-0">Premium</span>
                    </div>
                  </div>

                  {/* Editable Budget Input */}
                  <div className="flex justify-center">
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange/60 font-bold">$</span>
                      <input
                        type="number"
                        min="0"
                        value={budget}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) setBudget(val);
                        }}
                        className="w-32 py-2 pl-8 pr-4 bg-brand-orange/10 text-brand-orange font-black rounded-xl text-center outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all border border-brand-orange/20 group-hover:bg-brand-orange/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-brand-slate/60 uppercase tracking-widest ml-1">Your Vision</label>
            <textarea
              placeholder="e.g. Find a posh restaurant with a jazz band, intimate lighting, and a great wine list."
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              className="w-full px-6 py-5 rounded-2xl bg-white/60 border border-white/20 focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-brand-orange/10 transition-all font-semibold outline-none resize-none min-h-[140px] text-brand-black placeholder:text-brand-slate/30"
            />
          </div>

          <button
            disabled={loading || !occasion || !people || !request}
            type="submit"
            className="w-full bg-brand-black hover:bg-brand-slate disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 text-sm uppercase tracking-widest btn-bounce"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 text-brand-orange" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                Commence Planning
              </>
            )}
          </button>
        </form>
      </div>

      {loading && (
        <div ref={resultRef}>
          <LoadingRecommendations />
        </div>
      )}

      {result && (
        <div ref={resultRef} className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
          <ExpertPicksSection
            text={result.text}
            maxInitialPicks={5}
            onRestaurantClick={(name) => {
              setSelectedRestaurant({
                id: name,
                name: name
              });
              // Track restaurant click
              if (currentUser) {
                trackRestaurantClick(currentUser.uid, {
                  restaurantId: generateRestaurantId(name),
                  restaurantName: name,
                  source: 'concierge'
                }).catch(err => console.error('Failed to track click:', err));
              }

            }}
            onPicksExtracted={setPickedRestaurants}
            onLoadMore={handleLoadMore}
            isLoadingMore={loadingMore}
          />
        </div>
      )}

      {selectedRestaurant && (
        <RestaurantModal
          restaurantId={selectedRestaurant.id}
          restaurantName={selectedRestaurant.name}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}
    </div>
  );
};

export default Concierge;
