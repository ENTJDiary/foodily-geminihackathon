import React, { useState } from 'react';
import StarRating from '../shared/StarRating';

interface InsightFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { userName: string; rating: number; comment: string }) => void;
}

const InsightFormModal: React.FC<InsightFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [userName, setUserName] = useState('');
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment || !userName) return;

        onSubmit({ userName, rating, comment });

        // Reset form
        setUserName('');
        setRating(5);
        setComment('');
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-orange-100 p-10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-8">
                    <h3 className="font-black text-orange-600 uppercase tracking-widest text-sm">Leave an Insight</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                Your Alias
                            </label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="e.g. Foodie123"
                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 transition-all font-bold outline-none text-slate-700"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                                Score
                            </label>
                            <div className="flex items-center gap-2 bg-slate-50 p-3.5 rounded-xl border border-transparent">
                                <StarRating
                                    rating={rating}
                                    hoverRating={hoverRating}
                                    interactive
                                    size="lg"
                                    onRatingChange={setRating}
                                    onHover={setHoverRating}
                                />
                                <span className="ml-auto text-xs font-black text-slate-400">{rating} / 5</span>
                            </div>
                        </div>
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us about the atmosphere..."
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 transition-all font-medium outline-none h-32 resize-none text-slate-700 placeholder:text-slate-400"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-orange-600 text-white font-black py-5 rounded-xl hover:bg-orange-700 transition-all uppercase tracking-[0.2em] text-sm shadow-lg"
                    >
                        Post Insight
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InsightFormModal;
