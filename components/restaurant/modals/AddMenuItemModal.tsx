import React, { useState } from 'react';
import ImageUploader from '../shared/ImageUploader';
import StarRating from '../shared/StarRating';

interface DishItem {
    name: string;
    price: string;
    desc: string;
    rating: number;
}

interface AddMenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        images: string[];
        dishes: DishItem[];
        rating: number;
        experience: string;
    }) => void;
}

const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [newDishTitle, setNewDishTitle] = useState('');
    const [newDishImages, setNewDishImages] = useState<string[]>([]);
    const [newPostRating, setNewPostRating] = useState(5);
    const [hoverPostRating, setHoverPostRating] = useState(0);
    const [newPostExperience, setNewPostExperience] = useState('');
    const [dishItems, setDishItems] = useState<DishItem[]>([
        { name: '', price: '', desc: '', rating: 0 }
    ]);

    if (!isOpen) return null;

    const handleDishChange = (index: number, field: keyof DishItem, value: string | number) => {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newDishTitle) {
            alert("Please add a Post Title!");
            return;
        }
        if (dishItems.some(d => !d.name)) {
            alert("Please ensure all dishes have a name!");
            return;
        }

        onSubmit({
            title: newDishTitle,
            images: newDishImages,
            dishes: dishItems,
            rating: newPostRating,
            experience: newPostExperience,
        });

        // Reset form
        setNewDishTitle('');
        setNewDishImages([]);
        setDishItems([{ name: '', price: '', desc: '', rating: 0 }]);
        setNewPostRating(5);
        setNewPostExperience('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-orange-50 flex flex-col md:flex-row max-h-[90vh]">

                {/* Left Column: Image Upload */}
                <div className="w-full md:w-5/12 bg-slate-50 border-r border-orange-50 p-6 overflow-y-auto">
                    <ImageUploader images={newDishImages} onImagesChange={setNewDishImages} maxImages={12} gridCols={2} />
                </div>

                {/* Right Column: Form */}
                <div className="w-full md:w-7/12 p-8 flex flex-col overflow-y-auto bg-white">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-lg">Create Post</h3>
                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-xs font-bold text-slate-400">Share your foodie adventure</p>
                                <StarRating
                                    rating={newPostRating}
                                    hoverRating={hoverPostRating}
                                    interactive
                                    size="md"
                                    onRatingChange={setNewPostRating}
                                    onHover={setHoverPostRating}
                                />
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 p-2 rounded-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
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
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDishItem(idx)}
                                            className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                    <span className="absolute -top-3 left-4 bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-white">
                                        Dish {idx + 1}
                                    </span>

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
                                                    <StarRating
                                                        rating={dish.rating}
                                                        interactive
                                                        showHalfStars
                                                        onRatingChange={(rating) => handleDishChange(idx, 'rating', rating)}
                                                    />
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

                        <button
                            type="button"
                            onClick={handleAddDishItem}
                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Another Dish
                        </button>

                        <div className="mt-auto pt-6">
                            <button
                                type="submit"
                                className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl hover:bg-orange-700 transition-all uppercase tracking-widest text-sm shadow-xl shadow-orange-200/50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                POST
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddMenuItemModal;
