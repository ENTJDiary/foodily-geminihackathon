
import React, { useState, useEffect, useRef } from 'react';
import { getRestaurantData, saveReview, getAverageRating, addMenuItem } from '../../services/storageService';
import { getRestaurantDetails } from '../../services/geminiService';
import { Review, SearchResult, MenuItem } from '../../types';
import PriceRating from './PriceRating';

interface RestaurantModalProps {
  restaurantId: string;
  restaurantName: string;
  searchedDish?: string;
  onClose: () => void;
}

const RestaurantModal: React.FC<RestaurantModalProps> = ({ restaurantId, restaurantName, searchedDish, onClose }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [avgRating, setAvgRating] = useState(0);

  const [details, setDetails] = useState<SearchResult | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Add Dish State
  const [showAddDish, setShowAddDish] = useState(false);
  // View Dish Detail State
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [activeDetailImage, setActiveDetailImage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedMenuItem) {
      setActiveDetailImage(selectedMenuItem.image || (selectedMenuItem.images && selectedMenuItem.images[0]) || null);
    }
  }, [selectedMenuItem]);

  // Load initial data on mount
  useEffect(() => {
    const data = getRestaurantData(restaurantId);
    setReviews(data.reviews);
    setMenuItems(data.menuItems);
    setAvgRating(getAverageRating(restaurantId));

    // Load restaurant details
    const loadDetails = async () => {
      setLoadingDetails(true);
      try {
        const result = await getRestaurantDetails(restaurantName);
        setDetails(result);
      } catch (error) {
        console.error('Failed to load restaurant details:', error);
      } finally {
        setLoadingDetails(false);
      }
    };
    loadDetails();
  }, [restaurantId, restaurantName, searchedDish]);

  // Sync visibleReviews with reviews whenever reviews changes
  useEffect(() => {
    setVisibleReviews(reviews);
  }, [reviews]);

  // Insights State
  const [visibleReviews, setVisibleReviews] = useState<Review[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showInsightForm, setShowInsightForm] = useState(false);

  // New Post State
  const [newDishTitle, setNewDishTitle] = useState('');
  const [newDishImages, setNewDishImages] = useState<string[]>([]);
  const [newPostRating, setNewPostRating] = useState(5);
  const [hoverPostRating, setHoverPostRating] = useState(0);
  const [newPostExperience, setNewPostExperience] = useState('');

  // Dynamic Dishes State
  const [dishItems, setDishItems] = useState<{ name: string, price: string, desc: string, rating: number }[]>([
    { name: '', price: '', desc: '', rating: 0 } // Start with 1 empty dish
  ]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || !userName) return;
    saveReview(restaurantId, restaurantName, { rating, comment, userName });
    const data = getRestaurantData(restaurantId);
    setReviews(data.reviews);
    setVisibleReviews(data.reviews); // Update visibleReviews immediately
    setAvgRating(getAverageRating(restaurantId));
    setComment('');
    setUserName('');
    setRating(5);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image compression utility
  const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = height * (maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = width * (maxHeight / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 12 - newDishImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    console.log(`🖼️ Processing ${filesToProcess.length} images...`);

    for (const file of filesToProcess) {
      try {
        const originalSize = ((file as File).size / 1024).toFixed(2);
        console.log(`Original: ${originalSize}KB`);

        const compressed = await compressImage(file as File);
        const compressedSize = ((compressed.length * 0.75) / 1024).toFixed(2); // Approximate base64 size
        console.log(`Compressed: ${compressedSize}KB (${((1 - parseFloat(compressedSize) / parseFloat(originalSize)) * 100).toFixed(0)}% reduction)`);

        setNewDishImages(prev => [...prev, compressed]);
      } catch (error) {
        console.error('Failed to compress image:', error);
        alert('Failed to process one or more images. Please try again.');
      }
    }

    // Reset input to allow re-uploading same file
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setNewDishImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDishChange = (index: number, field: 'name' | 'price' | 'desc' | 'rating', value: string | number) => {
    const newItems = [...dishItems];
    if (field === 'rating') {
      newItems[index][field] = value as number;
    } else {
      newItems[index][field] = value as string;
    }
    setDishItems(newItems);
  };

  const handleAddDishItem = () => {
    setDishItems(prev => [...prev, { name: '', price: '', desc: '', rating: 0 }]);
  };

  const handleRemoveDishItem = (index: number) => {
    if (dishItems.length > 1) {
      setDishItems(prev => prev.filter((_, i) => i !== index));
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
            {/* Price Rating Display */}
            <div className="mt-4">
              {(() => {
                // 1. Try to calculate from menu items
                let priceRating = 0;
                const pricedItems = menuItems.filter(i => i.price);

                if (pricedItems.length > 0) {
                  const total = pricedItems.reduce((sum, item) => {
                    // Extract number from string like "$15.50" or "15" or "£12"
                    const val = parseFloat(item.price!.replace(/[^0-9.]/g, ''));
                    return sum + (isNaN(val) ? 0 : val);
                  }, 0);
                  const avg = total / pricedItems.length;

                  // Tier 1: $0 - $10
                  // Tier 2: $10 - $20
                  // Tier 3: $20 - $40
                  // Tier 4: $40+
                  if (avg < 10) priceRating = 1;
                  else if (avg < 20) priceRating = 2;
                  else if (avg < 40) priceRating = 3;
                  else priceRating = 4;
                } else if (details?.text) {
                  // 2. Fallback to extracting from AI text
                  // Look for "Price Rating: X/4" or "Price Rating: X"
                  const match = details.text.match(/Price Rating:\s*([1-4])\s*\/?/i);
                  if (match) {
                    priceRating = parseInt(match[1]);
                  }
                }

                return priceRating > 0 ? <PriceRating rating={priceRating} /> : null;
              })()}
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

          {/* COMMUNITY INSIGHTS (Floating Bubbles) */}
          <section className="space-y-4 px-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">COMMUNITY INSIGHT</h3>
              <button
                onClick={() => setShowInsightForm(true)}
                className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            <div className="flex flex-nowrap items-center gap-4 min-h-[60px] overflow-hidden w-full mask-linear-fade">
              {reviews.length === 0 ? (
                <p className="text-sm font-medium text-slate-400 italic leading-relaxed w-full text-center py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  No insights yet. Be the first to share!
                </p>
              ) : (
                visibleReviews.map((rev, idx) => (
                  <div
                    key={`${rev.id}-${idx}`}
                    className="flex-shrink-0 animate-in fade-in zoom-in slide-in-from-right-4 duration-700 fill-mode-both"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <button
                      onClick={() => setSelectedReview(rev)}
                      className="relative inline-flex flex-col items-center justify-center gap-1 px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-full shadow-sm text-slate-700 font-medium text-xs italic hover:scale-105 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer max-w-[220px] active:scale-95 group text-center"
                    >
                      {/* Stars centered in bubble */}
                      <div className="flex items-center gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className={`w-3 h-3 ${rev.rating >= star ? 'text-orange-400 fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        ))}
                      </div>
                      <span className="truncate whitespace-nowrap group-hover:text-blue-600 transition-colors max-w-full">"{rev.comment}"</span>
                      <div className="absolute -bottom-1 left-6 w-2 h-2 bg-blue-200 rotate-45 transform translate-y-1/2 rounded-sm group-hover:bg-blue-400 transition-colors"></div>
                    </button>
                  </div>
                ))
              )}
            </div>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              {menuItems.length === 0 ? (
                <div className="p-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.082.477 4 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.082.477-4 1.253" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
                <div className="grid grid-cols-2 gap-4">
                  {menuItems.map((item) => {
                    const isSearched = searchedDish && item.name.toLowerCase().includes(searchedDish.toLowerCase());
                    // Generate dummy user avatar color
                    const colors = ['bg-orange-100', 'bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-pink-100'];
                    const colorIndex = item.userName ? item.userName.length % colors.length : 0;
                    const avatarColor = colors[colorIndex];
                    const textColor = avatarColor.replace('100', '600');
                    // Likes count (use item.likes if exists, otherwise random for new items or legacy)
                    const displayLikes = item.likes ?? Math.floor(Math.random() * 50) + 1;

                    return (
                      <div key={item.id} onClick={() => setSelectedMenuItem(item)} className="flex flex-col gap-3 group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all">
                        {/* Card Image - Full width rounded */}
                        <div className="w-full aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden relative shadow-sm border border-slate-100">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              <span className="text-[10px] font-bold uppercase">No Photo</span>
                            </div>
                          )}

                          {/* Multi-Image Indicator */}
                          {item.images && item.images.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 z-10">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              <span className="text-[9px] font-bold text-white">{item.images.length}</span>
                            </div>
                          )}
                          {/* Price Tag Overlay */}
                          {item.price && (
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                              <span className="text-[10px] font-bold text-white">{item.price}</span>
                            </div>
                          )}
                        </div>

                        {/* Card Content using Social Style */}
                        <div className="px-1 space-y-1">
                          {/* Post Title */}
                          <h4 className="font-bold text-xs text-slate-900 leading-tight line-clamp-2">
                            {item.title || item.name}
                          </h4>

                          {/* User Info Row */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <div className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[8px] font-black ${avatarColor} ${textColor} uppercase border border-white shadow-sm`}>
                                {(item.userName || 'U').charAt(0)}
                              </div>
                              <span className="text-[9px] font-medium text-slate-400 truncate">{item.userName || 'Explorer'}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(item.id);
                              }}
                              className={`flex items-center gap-1 transition-colors ${item.isLiked ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}`}
                            >
                              <svg className={`w-4 h-4 transition-transform active:scale-125 ${item.isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                              <span className="text-[9px] font-medium">{displayLikes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ADD MENU ITEM MODAL - Multi-Post Design */}
          {showAddDish && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-orange-50 flex flex-col md:flex-row max-h-[90vh]">

                {/* Left Column: Image Upload (Grid Layout) */}
                <div className="w-full md:w-5/12 bg-slate-50 border-r border-orange-50 p-6 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {newDishImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm">
                        <img src={img} className="w-full h-full object-cover" />
                        <button onClick={() => handleRemoveImage(idx)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}

                    {newDishImages.length < 12 && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square bg-white border-2 border-dashed border-orange-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 hover:border-orange-400 transition-all group"
                      >
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-400 mb-2 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Add Photo</span>
                        <span className="text-[9px] font-bold text-slate-300">{newDishImages.length}/12</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
                </div>

                {/* Right Column: Form */}
                <div className="w-full md:w-7/12 p-8 flex flex-col overflow-y-auto bg-white">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-lg">Create Post</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-xs font-bold text-slate-400">Share your foodie adventure</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setHoverPostRating(star)}
                              onMouseLeave={() => setHoverPostRating(0)}
                              onClick={() => setNewPostRating(star)}
                              className="focus:outline-none transition-transform active:scale-90"
                            >
                              <svg className={`w-5 h-5 transition-all duration-200 ${(hoverPostRating || newPostRating) >= star ? 'text-orange-500 fill-current' : 'text-slate-200 fill-transparent stroke-slate-200'}`} viewBox="0 0 24 24" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setShowAddDish(false)} className="text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 p-2 rounded-full">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    console.log('Form submitting...', { newDishTitle, dishItems, newDishImages });

                    if (!newDishTitle) {
                      alert("Please add a Post Title!");
                      return;
                    }
                    if (dishItems.some(d => !d.name)) {
                      alert("Please ensure all dishes have a name!");
                      return;
                    }

                    const primaryDish = dishItems[0];

                    try {
                      addMenuItem(restaurantId, restaurantName, {
                        // Mapped backwards compatible fields to the first item
                        name: primaryDish.name,
                        description: primaryDish.desc || '',
                        price: primaryDish.price,
                        image: newDishImages[0] || undefined,

                        // New Fields
                        title: newDishTitle,
                        images: newDishImages,
                        dishes: dishItems.map(d => ({
                          name: d.name,
                          price: d.price,
                          description: d.desc,
                          rating: d.rating
                        })),
                        rating: newPostRating,
                        experience: newPostExperience,

                        userName: "Local Explorer",
                        timestamp: Date.now()
                      });

                      const data = getRestaurantData(restaurantId);
                      setMenuItems(data.menuItems);

                      // Reset State
                      setNewDishTitle('');
                      setNewDishImages([]);
                      setDishItems([{ name: '', price: '', desc: '' }]);
                      setNewPostRating(5);
                      setNewPostExperience('');
                      setShowAddDish(false);
                    } catch (error) {
                      console.error("❌ ERROR:", error);

                      // Check if it's a quota error
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
                  }} className="space-y-6 flex-1 flex flex-col">

                    {/* Post Title Field */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Post Title (Caption)</label>
                      <input
                        type="text"
                        value={newDishTitle}
                        onChange={(e) => setNewDishTitle(e.target.value)}
                        placeholder="e.g. Feast at Oba! 🍱"
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 transition-all font-bold outline-none text-lg text-slate-800 placeholder:text-slate-300"
                      />
                    </div>

                    {/* Experience/Diary Field */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Captions</label>
                      <textarea
                        value={newPostExperience}
                        onChange={(e) => setNewPostExperience(e.target.value)}
                        placeholder="Describe your experience at this restaurant..."
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 transition-all font-medium outline-none text-sm text-slate-700 placeholder:text-slate-300 resize-none h-24"
                      />
                    </div>

                    <div className="w-full h-px bg-slate-100 my-2"></div>

                    {/* Dynamic Dish Fields */}
                    <div className="space-y-6">
                      {dishItems.map((dish, idx) => (
                        <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative group/dish">
                          {dishItems.length > 1 && (
                            <button type="button" onClick={() => handleRemoveDishItem(idx)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                          <span className="absolute -top-3 left-4 bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-white">Dish {idx + 1}</span>

                          <div className="space-y-4 mt-2">
                            {/* Dish Name and Rating Row */}
                            <div className="flex gap-4 items-start">
                              <div className="flex-1 space-y-2">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dish Name</label>
                                <input
                                  type="text"
                                  value={dish.name}
                                  onChange={(e) => handleDishChange(idx, 'name', e.target.value)}
                                  placeholder="e.g. Bibimbap"
                                  className="w-full px-4 py-3 rounded-xl bg-white border border-transparent focus:border-orange-500 transition-all font-bold outline-none text-sm"
                                  required
                                />
                              </div>
                              {/* Star Rating for Dish */}
                              <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rate</label>
                                <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl">
                                  {[1, 2, 3, 4, 5].map((starIndex) => {
                                    const rating = dish.rating || 0;
                                    const isFull = rating >= starIndex;
                                    const isHalf = rating >= starIndex - 0.5 && rating < starIndex;

                                    return (
                                      <div key={starIndex} className="relative cursor-pointer" style={{ width: '24px', height: '24px' }}>
                                        {/* Left half clickable area */}
                                        <div
                                          className="absolute left-0 top-0 w-1/2 h-full z-10"
                                          onClick={() => handleDishChange(idx, 'rating', starIndex - 0.5)}
                                        />
                                        {/* Right half clickable area */}
                                        <div
                                          className="absolute right-0 top-0 w-1/2 h-full z-10"
                                          onClick={() => handleDishChange(idx, 'rating', starIndex)}
                                        />
                                        {/* Star visual */}
                                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
                                          {/* Background (empty) star */}
                                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#e2e8f0" />
                                          {/* Filled portion */}
                                          <defs>
                                            <clipPath id={`clip-${idx}-${starIndex}`}>
                                              <rect x="0" y="0" width={isFull ? '24' : isHalf ? '12' : '0'} height="24" />
                                            </clipPath>
                                          </defs>
                                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f97316" clipPath={`url(#clip-${idx}-${starIndex})`} />
                                        </svg>
                                      </div>
                                    );
                                  })}
                                  <span className="ml-1 text-[10px] font-bold text-slate-600">{dish.rating?.toFixed(1) || '0.0'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <div className="w-1/3 space-y-2">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Price</label>
                                <input
                                  type="text"
                                  value={dish.price}
                                  onChange={(e) => handleDishChange(idx, 'price', e.target.value)}
                                  placeholder="$12"
                                  className="w-full px-4 py-3 rounded-xl bg-white border border-transparent focus:border-orange-500 transition-all font-bold outline-none text-sm"
                                />
                              </div>
                              <div className="flex-1 space-y-2">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Comments</label>
                                <input
                                  type="text"
                                  value={dish.desc}
                                  onChange={(e) => handleDishChange(idx, 'desc', e.target.value)}
                                  placeholder="Very nice Bibimbap"
                                  className="w-full px-4 py-3 rounded-xl bg-white border border-transparent focus:border-orange-500 transition-all font-bold outline-none text-sm"
                                />
                              </div>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>

                    <button type="button" onClick={handleAddDishItem} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      Add Another Dish
                    </button>

                    <div className="mt-auto pt-6">
                      <button type="submit" className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl hover:bg-orange-700 transition-all uppercase tracking-widest text-sm shadow-xl shadow-orange-200/50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                        POST
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* INSIGHTS FORM POPUP */}
          {showInsightForm && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowInsightForm(false)}>
              <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-orange-100 p-10" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-8">
                  <h3 className="font-black text-orange-600 uppercase tracking-widest text-sm">Leave an Insight</h3>
                  <button onClick={() => setShowInsightForm(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={(e) => { handleSubmitReview(e); setShowInsightForm(false); }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Your Alias</label>
                      <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="e.g. Foodie123" className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 transition-all font-bold outline-none text-slate-700" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Score</label>
                      <div className="flex items-center gap-2 bg-slate-50 p-3.5 rounded-xl border border-transparent">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)} className="focus:outline-none group transition-transform active:scale-90">
                            <svg className={`w-8 h-8 transition-all duration-200 ${(hoverRating || rating) >= star ? 'text-orange-500 fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          </button>
                        ))}
                        <span className="ml-auto text-xs font-black text-slate-400">{rating} / 5</span>
                      </div>
                    </div>
                  </div>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us about the atmosphere..." className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 transition-all font-medium outline-none h-32 resize-none text-slate-700 placeholder:text-slate-400" required />
                  <button type="submit" className="w-full bg-orange-600 text-white font-black py-5 rounded-xl hover:bg-orange-700 transition-all uppercase tracking-[0.2em] text-sm shadow-lg">Post Insight</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MENU ITEM DETAIL MODAL */}
      {
        selectedMenuItem && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedMenuItem(null)}>
            <div className="bg-white w-full max-w-5xl h-[600px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-orange-50 flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>

              {/* Left Column: Image Gallery */}
              <div className="w-full md:w-1/2 bg-slate-100 relative group flex flex-col h-full">
                <div className="relative flex-1 overflow-hidden h-full">
                  {activeDetailImage ? (
                    <img src={activeDetailImage} alt={selectedMenuItem.name} className="w-full h-full object-cover transition-all duration-300" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className="text-xs font-bold uppercase">No Photo</span>
                    </div>
                  )}
                  <button onClick={() => setSelectedMenuItem(null)} className="absolute top-6 left-6 p-3 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors md:hidden">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Thumbnails Strip */}
                {selectedMenuItem.images && selectedMenuItem.images.length > 1 && (
                  <div className="h-24 bg-white border-t border-slate-100 p-3 overflow-x-auto flex gap-2 snap-x shrink-0">
                    {selectedMenuItem.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveDetailImage(img)}
                        className={`flex-shrink-0 h-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeDetailImage === img ? 'border-orange-500 scale-95' : 'border-transparent hover:border-orange-200'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Details */}
              <div className="w-full md:w-1/2 flex flex-col h-full bg-white relative">
                <button onClick={() => setSelectedMenuItem(null)} className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors hidden md:block z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="p-8 md:p-10 flex-1 overflow-y-auto space-y-6">
                  {/* Post Title - Moved to Top */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                        {selectedMenuItem.title || selectedMenuItem.name}
                      </h2>
                      {/* Share Button - Small Icon */}
                      <button className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      </button>
                    </div>
                  </div>

                  {/* User Profile Header - Smaller & More Aesthetic */}
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black bg-orange-100 text-orange-600 uppercase`}>
                      {(selectedMenuItem.userName || 'U').charAt(0)}
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">{selectedMenuItem.userName || 'Local Explorer'}</h4>
                      <span className="text-slate-300">•</span>
                      <span className="text-[8px] font-medium text-slate-400 uppercase tracking-wide">Just Now</span>
                    </div>
                  </div>

                  {/* Star Rating Display */}
                  {selectedMenuItem.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className={`w-4 h-4 ${selectedMenuItem.rating! >= star ? 'text-orange-500 fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-600">{selectedMenuItem.rating}/5</span>
                    </div>
                  )}

                  {/* Experience/Captions Section */}
                  {selectedMenuItem.experience && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                      <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Experience</h3>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{selectedMenuItem.experience}</p>
                    </div>
                  )}

                  <div className="w-full h-px bg-slate-100"></div>

                  {/* Dishes List */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ordered Items</h3>

                    {/* Multi-Dish Rendering */}
                    {selectedMenuItem.dishes && selectedMenuItem.dishes.length > 0 ? (
                      selectedMenuItem.dishes.map((dish, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 group hover:border-orange-200 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-base font-black text-slate-900">{dish.name}</h3>
                            {dish.price && (
                              <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                                <svg className="w-3.5 h-4 text-green-700" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <rect x="5" y="3" width="14" height="24" rx="3" stroke="currentColor" fill="white" />
                                  <circle cx="12" cy="15" r="4" stroke="currentColor" />
                                  <path d="M8 8L6 10M16 8L18 10M8 22L6 20M16 22L18 20" strokeLinecap="round" />
                                </svg>
                                <span className="text-xs font-black text-green-700">{dish.price}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{dish.description}</p>
                        </div>
                      ))
                    ) : (
                      // Legacy Single Dish Rendering
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-base font-black text-slate-900">{selectedMenuItem.name}</h3>
                          {selectedMenuItem.price && (
                            <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                              <svg className="w-3.5 h-4 text-green-700" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="5" y="3" width="14" height="24" rx="3" stroke="currentColor" fill="white" />
                                <circle cx="12" cy="15" r="4" stroke="currentColor" />
                                <path d="M8 8L6 10M16 8L18 10M8 22L6 20M16 22L18 20" strokeLinecap="round" />
                              </svg>
                              <span className="text-xs font-black text-green-700">{selectedMenuItem.price}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{selectedMenuItem.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 mt-auto">
                    <button className="flex-1 bg-white border-2 border-red-200 text-red-500 font-bold py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2 group">
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      Like
                    </button>
                    <button className="flex-1 bg-orange-600 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-orange-700 transition-all flex items-center justify-center gap-2 group">
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" /></svg>
                      Save
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* REVIEW DETAIL MODAL - Moved outside to escape transforms/overflow */}
      {
        selectedReview && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedReview(null)}>
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200 border border-blue-100 relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedReview(null)} className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">{selectedReview.userName}</h4>
                  <div className="flex text-orange-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${selectedReview.rating > i ? 'fill-current' : 'text-slate-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                </div>
                <div className="w-full h-px bg-slate-100"></div>
                <p className="text-slate-600 font-medium text-sm leading-relaxed italic">
                  "{selectedReview.comment}"
                </p>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">{new Date(selectedReview.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default RestaurantModal;
