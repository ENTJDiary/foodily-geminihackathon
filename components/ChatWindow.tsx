
import React, { useState, useRef, useEffect } from 'react';
import { searchRestaurantsByMaps } from '../services/geminiService';
import WeeklyFoodHunt from './WeeklyFoodHunt';
import FoodRandomizer from './FoodRandomizer';
import { Location, SearchResult, HistoryEntry } from '../types';
import RestaurantModal from './RestaurantModal';
import { getAverageRating, saveSearchToHistory, getWeeklyHistory, getUserProfile } from '../services/storageService';

const ChatWindow: React.FC = () => {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ id: string; name: string; searchedDish?: string } | null>(null);
  const [currentCoords, setCurrentCoords] = useState<Location | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(getWeeklyHistory());
  const [applyFilters, setApplyFilters] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const profile = getUserProfile();
  const hasRestrictions = profile.dietaryRestrictions.length > 0;

  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => console.warn("Geolocation failed", err)
      );
    }
  }, []);

  const handleRandomSelection = async (cuisine: string, foodType: string) => {
    const query = `${cuisine} ${foodType}`;
    setLoadingResults(true);
    setResults(null);
    try {
      const prompt = `Suggest top-tier restaurants for ${query} near me.`;
      const restrictions = applyFilters ? profile.dietaryRestrictions : [];
      const response = await searchRestaurantsByMaps(prompt, currentCoords || undefined, restrictions);
      setResults(response);
      saveSearchToHistory(cuisine, foodType);
      setHistory(getWeeklyHistory());
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingResults(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-12 max-w-4xl mx-auto">
      <div className="space-y-12">
        <WeeklyFoodHunt history={history} />
        <div className="space-y-6">
            {hasRestrictions && (
              <div className="flex items-center gap-3 bg-white p-6 rounded-[2rem] border border-orange-50 shadow-sm">
                <input 
                  id="assistant-dietary"
                  type="checkbox" 
                  checked={applyFilters} 
                  onChange={() => setApplyFilters(!applyFilters)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="assistant-dietary" className="text-xs font-black text-slate-600 uppercase tracking-widest cursor-pointer select-none">
                  Respect my dietary needs: <span className="text-orange-600">{profile.dietaryRestrictions.join(', ')}</span>
                </label>
              </div>
            )}
            <FoodRandomizer onSelection={handleRandomSelection} />
        </div>
      </div>

      {loadingResults && (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <div className="w-8 h-8 border-2 border-orange-100 border-t-orange-600 rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400">Consulting Chefs...</span>
        </div>
      )}

      {results && (
        <div ref={resultsRef} className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
          <div className="bg-orange-600 p-10 rounded-[2.5rem] shadow-xl text-white">
            <h3 className="text-sm font-black mb-6 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              Expert Picks
            </h3>
            <div className="whitespace-pre-wrap text-white font-medium text-lg leading-relaxed">
              {results.text}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.groundingChunks.map((chunk, idx) => {
              if (!chunk.maps) return null;
              // Handle optional title field from API metadata
              const restaurantName = chunk.maps.title || 'Unknown Restaurant';
              return (
                <div key={idx} className="bg-white p-8 rounded-3xl border border-orange-50 shadow-sm flex flex-col hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-black text-slate-900 text-xl tracking-tight truncate pr-4 group-hover:text-orange-600 transition-colors">{restaurantName}</h5>
                    {/* Handle optional uri field from API metadata */}
                    <a href={chunk.maps.uri || '#'} target="_blank" className="text-slate-300 hover:text-orange-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  </div>
                  <div className="flex items-center gap-2 mb-8">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Community:</span>
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{getAverageRating(restaurantName).toFixed(1)} / 5.0</span>
                  </div>
                  <button 
                    onClick={() => setSelectedRestaurant({ id: restaurantName, name: restaurantName, searchedDish: history[history.length-1]?.foodType })}
                    className="mt-auto bg-orange-50 hover:bg-orange-600 hover:text-white transition-all text-orange-700 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest border border-orange-100"
                  >
                    View App Ledger
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedRestaurant && (
        <RestaurantModal 
          restaurantId={selectedRestaurant.id}
          restaurantName={selectedRestaurant.name}
          searchedDish={selectedRestaurant.searchedDish}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}
    </div>
  );
};

export default ChatWindow;
