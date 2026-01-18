
import React, { useState, useEffect, useRef } from 'react';
import { conciergeChat } from '../services/geminiService';
import { SearchResult } from '../types';
import RestaurantModal from '../components/common/RestaurantModal';
import ExpertPicksSection from '../components/common/ExpertPicksSection';
import { getAverageRating } from '../services/storageService';

const Concierge: React.FC = () => {
  const [occasion, setOccasion] = useState('');
  const [people, setPeople] = useState('');
  const [request, setRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ id: string; name: string } | null>(null);
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);
  const [pickedRestaurants, setPickedRestaurants] = useState<string[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occasion || !people || !request) return;

    setLoading(true);
    setResult(null);
    setShowAllRestaurants(false); // Reset to show limited results on new search
    try {
      const response = await conciergeChat(occasion, people, request);
      setResult(response);
    } catch (error) {
      console.error(error);
      alert("Concierge is currently busy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-slate-900 uppercase tracking-tight">The Dining Concierge</h2>
        <p className="text-slate-500 font-medium italic">Planning something special? Let us curate the perfect table for your group.</p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-orange-50">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">The Occasion</label>
              <input
                type="text"
                placeholder="e.g. New Year's Eve Date"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-orange-500 focus:bg-white transition-all font-semibold outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">The Group</label>
              <input
                type="text"
                placeholder="e.g. My partner"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-orange-500 focus:bg-white transition-all font-semibold outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Your Vision</label>
            <textarea
              placeholder="e.g. Find a posh restaurant with a jazz band, intimate lighting, and a great wine list."
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              className="w-full px-6 py-5 rounded-2xl bg-slate-50 border border-transparent focus:border-orange-500 focus:bg-white transition-all font-semibold min-h-[120px] outline-none resize-none"
            />
          </div>

          <button
            disabled={loading || !occasion || !people || !request}
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-100 text-white font-black py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                Commence Planning
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div ref={resultRef} className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
          <ExpertPicksSection
            text={result.text}
            maxInitialPicks={5}
            onPicksExtracted={(names) => setPickedRestaurants(names)}
            onRestaurantClick={(name) => setSelectedRestaurant({
              id: name,
              name: name
            })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(showAllRestaurants ? result.groundingChunks : result.groundingChunks.slice(0, 10))
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
                return (
                  <div key={idx} className="bg-white p-8 rounded-3xl border border-orange-50 shadow-sm flex flex-col hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <h5 className="font-black text-slate-900 text-xl tracking-tight truncate pr-4 group-hover:text-orange-600 transition-colors">{restaurantName}</h5>
                      {/* Handle optional uri field from API metadata */}
                      <a href={chunk.maps.uri || '#'} target="_blank" className="text-slate-300 hover:text-orange-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </div>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="flex text-orange-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg key={s} className={`w-4 h-4 ${getAverageRating(restaurantName) >= s ? 'fill-current' : 'text-slate-200'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{getAverageRating(restaurantName).toFixed(1)} / 5.0</span>
                    </div>
                    <button
                      onClick={() => setSelectedRestaurant({ id: restaurantName, name: restaurantName })}
                      className="mt-auto bg-orange-50 hover:bg-orange-600 hover:text-white transition-all text-orange-700 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest border border-orange-100"
                    >
                      View Restaurant
                    </button>
                  </div>
                );
              })}
          </div>

          {/* Show More Button */}
          {!showAllRestaurants && result.groundingChunks.length > 10 && (
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
                  +{result.groundingChunks.length - 10}
                </span>
              </button>
            </div>
          )}
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
