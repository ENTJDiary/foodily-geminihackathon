import React, { useState, useEffect } from 'react';
import UserPostCard from './UserPostCard';

interface UserPost {
    imageUrl: string;
    dishName: string;
    userName: string;
    likes: number;
}

interface UserPostCarouselProps {
    posts: UserPost[];
}

const UserPostCarousel: React.FC<UserPostCarouselProps> = ({ posts }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play carousel
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % posts.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, posts.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
        setIsAutoPlaying(false);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % posts.length);
        setIsAutoPlaying(false);
    };

    return (
        <div className="relative w-full">

            {/* Desktop: Show all 3 cards */}
            <div className="hidden md:grid md:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                    <UserPostCard
                        key={index}
                        imageUrl={post.imageUrl}
                        dishName={post.dishName}
                        userName={post.userName}
                        likes={post.likes}
                    />
                ))}
            </div>

            {/* Mobile: Carousel */}
            <div className="md:hidden relative">
                {/* Carousel Container */}
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {posts.map((post, index) => (
                            <div key={index} className="min-w-full px-4">
                                <UserPostCard
                                    imageUrl={post.imageUrl}
                                    dishName={post.dishName}
                                    userName={post.userName}
                                    likes={post.likes}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={goToPrevious}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-900 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                    aria-label="Previous slide"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={goToNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-900 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                    aria-label="Next slide"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Dots Indicator */}
                <div className="flex justify-center gap-2 mt-6">
                    {posts.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`transition-all duration-300 rounded-full ${index === currentIndex
                                    ? 'bg-orange-500 w-8 h-3'
                                    : 'bg-slate-300 w-3 h-3 hover:bg-slate-400'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

        </div>
    );
};

export default UserPostCarousel;
