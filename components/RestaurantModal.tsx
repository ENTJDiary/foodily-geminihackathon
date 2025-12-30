
import React, { useState, useEffect, useRef } from 'react';
import { getRestaurantData, saveReview, getAverageRating, addMenuItem, saveRestaurantDescription } from '../services/storageService';
import { getRestaurantDetails } from '../services/geminiService';
import { Review, SearchResult, MenuItem } from '../types';

interface RestaurantModalProps {
  restaurantId: string;
  restaurantName: string;
  searchedDish?: string;
  onClose: () => void;
}

const RestaurantModal: React.FC<RestaurantModalProps> = ({ restaurantId, restaurantName, searchedDish, onClose }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [commDesc, setCommDesc] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [avgRating, setAvgRating] = useState(0);
  
  const [details, setDetails] = useState<SearchResult | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Add Dish State
  const [showAddDish, setShowAddDish] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [newDishName, setNewDishName] = useState(searchedDish || '');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishImg, setNewDishImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const data = getRestaurantData(restaurantId);
    setReviews(data.reviews);
    setMenuItems(data.menuItems || []);
    setCommDesc(data.communityDescription || '');
    setAvgRating(getAverageRating(restaurantId));

    const fetchGourmetDetails = async () => {
      setLoadingDetails(true);
      try {
        const aiDetails = await getRestaurantDetails(restaurantName);
        setDetails(aiDetails);
      } catch (err) {
        console.error("Failed to fetch detailed restaurant info", err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchGourmetDetails();
  }, [restaurantId, restaurantName]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || !userName) return;
    saveReview(restaurantId, restaurantName, { rating, comment, userName });
    const data = getRestaurantData(restaurantId);
    setReviews(data.reviews);
    setAvgRating(getAverageRating(restaurantId));
    setComment('');
    setUserName('');
    setRating(5);
  };

  const handleSaveDescription = () => {
    saveRestaurantDescription(restaurantId, restaurantName, commDesc);
    setIsEditingDesc(false);
  };

  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishDesc) return;
    addMenuItem(restaurantId, restaurantName, {
      name: newDishName,
      description: newDishDesc,
      image: newDishImg || undefined
    });
    const data = getRestaurantData(restaurantId);
    setMenuItems(data.menuItems);
    setNewDishName(searchedDish || '');
    setNewDishDesc('');
    setNewDishImg(null);
    setShowAddDish(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDishImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sourceLinks = details?.groundingChunks
    ?.map(chunk => chunk.web?.uri)
    .filter((uri): uri is string => !!uri) || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-500 border border-orange-50">
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
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          {/* Gourmet Brief */}
          <section className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400">Gourmet Brief</h3>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Live Grounding</span>
                </div>
              </div>

              {loadingDetails ? (
                <div className="py-6 space-y-4">
                  <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse"></div>
                </div>
              ) : details ? (
                <div className="space-y-6">
                  <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-200">
                    {details.text}
                  </div>
                  {sourceLinks.length > 0 && (
                    <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-3">
                      {sourceLinks.map((link, i) => (
                        <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-orange-400 font-bold hover:text-white flex items-center gap-1 underline underline-offset-4">
                          Source {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-xs italic">Searching for deeper insights...</p>
              )}
            </div>
          </section>

          {/* COMMUNITY DESCRIPTION */}
          <section className="space-y-4 px-2">
             <div className="flex justify-between items-center">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">COMMUNITY BIO</h3>
                {!isEditingDesc && (
                  <button onClick={() => setIsEditingDesc(true)} className="text-[9px] font-black text-orange-600 uppercase tracking-widest hover:underline">Edit Bio</button>
                )}
             </div>
             {isEditingDesc ? (
               <div className="space-y-3">
                 <textarea 
                   value={commDesc}
                   onChange={(e) => setCommDesc(e.target.value)}
                   className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-orange-100 font-medium text-sm outline-none h-32 resize-none"
                   placeholder="Share a general description of this restaurant's vibe and specialty..."
                 />
                 <div className="flex gap-2">
                    <button onClick={handleSaveDescription} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Save Bio</button>
                    <button onClick={() => setIsEditingDesc(false)} className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">Cancel</button>
                 </div>
               </div>
             ) : (
               <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
                 {commDesc || "No community description yet. Be the first to tell others what this place is like!"}
               </p>
             )}
          </section>

          {/* COMMUNITY MENU SECTION */}
          <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">COMMUNITY MENU</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dishes recommended by local explorers</p>
              </div>
              <button 
                onClick={() => setShowAddDish(true)}
                className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              {menuItems.length === 0 ? (
                <div className="p-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.082.477 4 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.082.477-4 1.253" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">The menu is empty. Start building it!</p>
                  {searchedDish && (
                    <button 
                      onClick={() => setShowAddDish(true)}
                      className="text-[9px] font-black text-orange-600 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 uppercase tracking-widest hover:bg-orange-100"
                    >
                      Add "{searchedDish}"
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {menuItems.map((item) => {
                    const isSearched = searchedDish && item.name.toLowerCase().includes(searchedDish.toLowerCase());
                    return (
                      <div key={item.id} className={`p-6 bg-white border rounded-[2rem] flex gap-8 items-center transition-all ${isSearched ? 'border-orange-500 shadow-xl ring-4 ring-orange-50 scale-[1.02]' : 'border-orange-50 hover:border-orange-200'}`}>
                        <div className="w-32 h-32 bg-slate-100 rounded-[1.5rem] overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-50 shadow-inner">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-1 opacity-20">
                              <svg className="w-10 h-10 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg>
                              <span className="text-[8px] font-black uppercase">No Photo</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-start">
                             <h4 className={`font-black text-lg uppercase tracking-tight leading-tight ${isSearched ? 'text-orange-600' : 'text-slate-900'}`}>{item.name}</h4>
                             {isSearched && (
                                <div className="bg-orange-600 text-white p-1 rounded-full shadow-lg">
                                   <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                </div>
                             )}
                          </div>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3 italic">"{item.description}"</p>
                          {isSearched && (
                            <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">Top Match for your craving</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ADD MENU ITEM MODAL */}
          {showAddDish && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-200 border border-orange-50">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Add a Dish</h3>
                  <button onClick={() => setShowAddDish(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleAddDish} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Dish Name</label>
                    <input 
                      type="text" 
                      value={newDishName}
                      onChange={(e) => setNewDishName(e.target.value)}
                      placeholder="e.g. Signature Truffle Pizza"
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 transition-all font-bold outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">What makes it good?</label>
                    <textarea 
                      value={newDishDesc}
                      onChange={(e) => setNewDishDesc(e.target.value)}
                      placeholder="Atmosphere? Taste? Texture? Give the community a description."
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 transition-all font-bold outline-none h-24 resize-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Add a Photo</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all group overflow-hidden"
                    >
                      {newDishImg ? (
                        <img src={newDishImg} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <svg className="w-6 h-6 text-slate-300 group-hover:text-orange-600 transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tap to upload image</span>
                        </>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                  </div>
                  <button type="submit" className="w-full bg-orange-600 text-white font-black py-4 rounded-xl hover:bg-orange-700 transition-all uppercase tracking-widest text-xs shadow-lg shadow-orange-100">
                    Post to Menu
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* INSIGHTS FORM */}
          <section className="bg-slate-50 p-8 rounded-3xl border border-orange-50 shadow-inner">
            <h3 className="font-black text-orange-600 uppercase tracking-widest text-xs mb-6">Leave an Insight</h3>
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Your Alias</label>
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="e.g. Foodie123" className="w-full px-5 py-4 rounded-xl bg-white border border-transparent focus:border-orange-500 transition-all font-bold outline-none shadow-sm" required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Score</label>
                  <div className="flex items-center gap-1 bg-white p-3.5 rounded-xl shadow-sm border border-transparent">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)} className="focus:outline-none group transition-transform active:scale-90">
                        <svg className={`w-7 h-7 transition-all duration-200 ${(hoverRating || rating) >= star ? 'text-orange-500 fill-current' : 'text-slate-200 fill-transparent stroke-slate-200'}`} viewBox="0 0 24 24" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </button>
                    ))}
                    <span className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">{rating} / 5</span>
                  </div>
                </div>
              </div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us about the atmosphere..." className="w-full px-5 py-4 rounded-xl bg-white border border-transparent focus:border-orange-500 transition-all font-bold outline-none h-28 resize-none shadow-sm" required />
              <button type="submit" className="w-full bg-orange-600 text-white font-black py-5 rounded-xl hover:bg-orange-700 transition-all uppercase tracking-[0.2em] text-xs shadow-lg">Post Insight</button>
            </form>
          </section>

          {/* LEDGER */}
          <section className="space-y-6">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-3">
              Community Ledger
              <span className="w-6 h-6 bg-orange-50 rounded-full flex items-center justify-center text-[10px] text-orange-600 font-black">{reviews.length}</span>
            </h3>
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-10 text-slate-300 font-bold uppercase text-[10px] tracking-widest">No records yet.</div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-6 bg-white border border-orange-50 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="font-black text-slate-900 uppercase text-sm">{rev.userName}</span>
                        <div className="flex text-orange-500 text-xs mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} className={`w-3 h-3 ${rev.rating > i ? 'fill-current' : 'text-slate-100'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-300 font-black uppercase">{new Date(rev.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-800 font-medium text-sm leading-relaxed italic">"{rev.comment}"</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RestaurantModal;
