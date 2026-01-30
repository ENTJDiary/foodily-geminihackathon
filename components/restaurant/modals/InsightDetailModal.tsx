import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Review } from '../../../types';
import { toggleReviewLike, isReviewLiked } from '../../../services/reviewLikesService';

interface InsightDetailModalProps {
    review: Review | null;
    onClose: () => void;
    restaurantId?: string;
}

const InsightDetailModal: React.FC<InsightDetailModalProps> = ({ review, onClose, restaurantId }) => {
    const { currentUser: user } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isLiking, setIsLiking] = useState(false);

    // Helper to get review ID consistently
    const getReviewId = (r: Review) => r.reviewId || r.id || '';

    // Helper to get date object
    const getReviewDate = (r: Review) => {
        if (r.createdAt && typeof r.createdAt.toDate === 'function') {
            return r.createdAt.toDate();
        } else if (r.timestamp) {
            return new Date(r.timestamp);
        }
        return new Date();
    };

    useEffect(() => {
        if (review) {
            setLikeCount(review.likes || 0);

            // Check if user has liked this review
            const rId = getReviewId(review);
            if (user && rId) {
                isReviewLiked(user.uid, rId).then(setIsLiked);
            }
        }
    }, [review, user]);

    const handleToggleLike = async () => {
        if (!user || !review || !restaurantId || isLiking) return;

        setIsLiking(true);
        try {
            const rId = getReviewId(review);
            const nowLiked = await toggleReviewLike(user.uid, rId, restaurantId);
            setIsLiked(nowLiked);
            setLikeCount(prev => nowLiked ? prev + 1 : prev - 1);
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setIsLiking(false);
        }
    };

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
                            {getReviewDate(review).toLocaleDateString()}
                        </p>

                        <button
                            onClick={handleToggleLike}
                            disabled={!user || isLiking}
                            className="relative group active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {/* Main upvote button */}
                            <div
                                className={`w-[53px] h-10 rounded-2xl flex items-center justify-center font-black text-base tracking-tight shadow-sm transition-all
      ${isLiked
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                    }`}
                                style={{ fontFamily: 'ui-serif, Georgia, serif' }}
                            >
                                +1
                            </div>

                            {/* Soft pill badge (bottom-right) */}
                            <div
                                className={`absolute -bottom-1 -right-1 min-w-[18px] h-[18px] rounded-xl flex items-center justify-center text-[9px] font-bold border shadow-sm transition-all
      ${isLiked
                                        ? 'bg-white text-orange-600 border-orange-300'
                                        : 'bg-white text-orange-400 border-orange-200'
                                    }
      ${likeCount > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
    `}
                            >
                                {likeCount}
                            </div>
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightDetailModal;
