import React from 'react';
import { Review } from '../../../types';

interface InsightDetailModalProps {
    review: Review | null;
    onClose: () => void;
    onToggleLike: (reviewId: string) => void;
}

const InsightDetailModal: React.FC<InsightDetailModalProps> = ({ review, onClose, onToggleLike }) => {
    if (!review) return null;

    return (
        <div
            className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200 border border-blue-100 relative group"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col gap-4 mt-6">
                    <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">{review.userName}</h4>
                        <div className="flex text-orange-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-4 h-4 ${review.rating > i ? 'fill-current' : 'text-slate-200'}`}
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                    </div>
                    <div className="w-full h-px bg-slate-100"></div>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed italic mb-2">
                        "{review.comment}"
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">
                            {new Date(review.timestamp).toLocaleDateString()}
                        </p>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleLike(review.id);
                            }}
                            className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-[10px] font-black transition-all active:scale-95 group/btn ${review.isLiked
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100 hover:shadow-sm'
                                }`}
                        >
                            <span className="text-lg leading-none font-black italic tracking-tighter" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>+1</span>

                            {(review.likes || 0) > 0 && (
                                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold shadow-sm ${review.isLiked
                                        ? 'bg-white text-orange-600'
                                        : 'bg-white text-orange-400'
                                    }`}>
                                    {review.likes}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightDetailModal;
