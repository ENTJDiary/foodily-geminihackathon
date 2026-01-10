import React, { useState, useEffect } from 'react';
import { Review } from '../../../types';
import InsightFormModal from '../modals/InsightFormModal';
import InsightDetailModal from '../modals/InsightDetailModal';

interface CommunityInsightsPageProps {
    reviews: Review[];
    selectedReview: Review | null;
    showInsightForm: boolean;
    onAddInsightClick: () => void;
    onReviewClick: (review: Review) => void;
    onCloseReviewDetail: () => void;
    onCloseInsightForm: () => void;
    onSubmitInsight: (data: { userName: string; rating: number; comment: string }) => void;
}

const CommunityInsightsPage: React.FC<CommunityInsightsPageProps> = ({
    reviews,
    selectedReview,
    showInsightForm,
    onAddInsightClick,
    onReviewClick,
    onCloseReviewDetail,
    onCloseInsightForm,
    onSubmitInsight,
}) => {
    const [visibleReviews, setVisibleReviews] = useState<Review[]>([]);

    // Initialize and sync visible reviews with all reviews
    useEffect(() => {
        setVisibleReviews(reviews);
    }, [reviews]);

    // Auto-shuffle reviews every 4 seconds
    useEffect(() => {
        if (reviews.length <= 1) return; // Don't shuffle if 0 or 1 review

        const intervalId = setInterval(() => {
            const shuffled = [...reviews].sort(() => Math.random() - 0.5);
            setVisibleReviews(shuffled);
        }, 4000); // 4 seconds

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [reviews]);

    return (
        <>
            <section className="space-y-4 px-2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">COMMUNITY INSIGHT</h3>
                    <button
                        onClick={onAddInsightClick}
                        className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
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
                                    onClick={() => onReviewClick(rev)}
                                    className="relative inline-flex flex-col items-center justify-center gap-1 px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-full shadow-sm text-slate-700 font-medium text-xs italic hover:scale-105 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer max-w-[220px] active:scale-95 group text-center"
                                >
                                    {/* Stars centered in bubble */}
                                    <div className="flex items-center gap-0.5 mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                className={`w-3 h-3 ${rev.rating >= star ? 'text-orange-400 fill-current' : 'text-slate-200 fill-current'}`}
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="truncate whitespace-nowrap group-hover:text-blue-600 transition-colors max-w-full">
                                        "{rev.comment}"
                                    </span>
                                    <div className="absolute -bottom-1 left-6 w-2 h-2 bg-blue-200 rotate-45 transform translate-y-1/2 rounded-sm group-hover:bg-blue-400 transition-colors"></div>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Modals */}
            <InsightFormModal
                isOpen={showInsightForm}
                onClose={onCloseInsightForm}
                onSubmit={onSubmitInsight}
            />
            <InsightDetailModal
                review={selectedReview}
                onClose={onCloseReviewDetail}
            />
        </>
    );
};

export default CommunityInsightsPage;
