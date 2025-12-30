
import React, { useState, useEffect, useRef } from 'react';
import { conciergeChat } from '../services/geminiService';
import { SearchResult } from '../types';
import RestaurantModal from './RestaurantModal';

const ConciergeInterface: React.FC = () => {
  const [occasion, setOccasion] = useState('');
  const [people, setPeople] = useState('');
  const [request, setRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ id: string; name: string } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occasion || !people || !request) return;

    setLoading(true);
    setResult(null);
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
            className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-100 text-white font-black py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] active:scale-[0.98]"
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
          <div className="bg-slate-900 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.827c.073-.441.344-.794.677-.794.404 0 .73.512.73 1.144 0 .633-.326 1.145-.73 1.145-.333 0-.604-.353-.677-.794-.037.228-.11.433-.202.595-.19.336-.45.541-.75.541-.3 0-.56-.205-.75-.541-.092-.162-.165-.367-.202-.595-.073.441-.344.794-.677.794-.404 0-.73-.512-.73-1.145 0-.632.326-1.144.73-1.144.333 0 .604.353.677.794.037-.228.11-.433.202-.595.19-.336.45-.541.75-.541.3 0 .56.205.75.541.092.162.165.367.202.595zM4.394 5.827c.073-.441.344-.794.677-.794.404 0 .73.512.73 1.144 0 .633-.326 1.145-.73 1.145-.333 0-.604-.353-.677-.794-.037.228-.11.433-.202.595-.19.336-.45.541-.75.541-.3 0-.56-.205-.75-.541-.092-.162-.165-.367-.202-.595-.073.441-.344.794-.677.794-.404 0-.73-.512-.73-1.145 0-.632.326-1.144.73-1.144.333 0 .604.353.677.794.037-.228.11-.433.202-.595.19-.336.45-.541.75-.541.3 0 .56.205.75.541.092.162.165.367.202.595z"/></svg>
             </div>
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-400 mb-8 flex items-center gap-3">
               <span className="w-12 h-px bg-orange-400/30"></span>
               Concierge Recommendations
             </h3>
             <div className="whitespace-pre-wrap font-medium text-lg leading-relaxed text-slate-100 mb-10">
               {result.text}
             </div>
             
             {result.groundingChunks.length > 0 && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {result.groundingChunks.map((chunk, i) => {
                   if (!chunk.maps) return null;
                   // Handle optional fields from API metadata to ensure local state and props receive strings
                   const restaurantName = chunk.maps.title || 'Unknown Restaurant';
                   return (
                     <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm flex justify-between items-center group/item hover:bg-white/10 transition-all">
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-sm">{restaurantName}</h4>
                          <button 
                            onClick={() => setSelectedRestaurant({ id: restaurantName, name: restaurantName })}
                            className="text-[9px] font-black text-orange-400 uppercase tracking-widest hover:text-white transition-colors"
                          >
                            Explore Local Ledger
                          </button>
                        </div>
                        {/* Handle optional uri from API metadata */}
                        <a href={chunk.maps.uri || '#'} target="_blank" className="text-white/20 group-hover/item:text-orange-400 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </a>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
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

export default ConciergeInterface;
