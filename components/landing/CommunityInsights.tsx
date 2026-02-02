import React, { useEffect, useRef, useState } from 'react';

interface FoodCard {
    id: number;
    image: string;
    caption: string;
    username: string;
    likes: number;
}

const CommunityInsights: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isAnimated, setIsAnimated] = useState(false);

    const leftCards: FoodCard[] = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
            caption: 'This is the Best Nasi Lemak I had!!!',
            username: 'Food_Destroyer69',
            likes: 78
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
            caption: 'This is the Best Nasi Lemak I had!!!',
            username: 'Food_Destroyer69',
            likes: 92
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
            caption: 'This is the Best Nasi Lemak I had!!!',
            username: 'Food_Destroyer69',
            likes: 65
        }
    ];

    const rightCards: FoodCard[] = [
        {
            id: 4,
            image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
            caption: 'This is the Best Nasi Lemak I had!!!',
            username: 'Food_Destroyer69',
            likes: 103
        },
        {
            id: 5,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
            caption: 'This is the Best Nasi Lemak I had!!!',
            username: 'Food_Destroyer69',
            likes: 87
        },
        {
            id: 6,
            image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop',
            caption: 'This is the Best Nasi Lemak I had!!!',
            username: 'Food_Destroyer69',
            likes: 71
        }
    ];

    useEffect(() => {
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsAnimated(true);
                } else {
                    setIsAnimated(false);
                }
            });
        }, observerOptions);

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const renderCard = (card: FoodCard) => (
        <div
            key={card.id}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 transform border border-slate-100"
        >
            <div className="h-40 overflow-hidden relative">
                <img
                    src={card.image}
                    alt="Food"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
            </div>
            <div className="p-4">
                <div className="text-sm font-medium text-slate-800 mb-3 line-clamp-2 leading-relaxed">
                    {card.caption}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                            {/* Using a simple initial or abstract illustration if no user image */}
                            <span className="text-[10px] text-white font-bold">{card.username[0]}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium truncate max-w-[80px]">{card.username}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                        <svg className="w-3.5 h-3.5 text-red-500 fill-current" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        {card.likes}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div
            ref={sectionRef}
            className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-white`}
        >
            {/* Background Decorative Blurs */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-orange-100/50 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-slate-100/60 rounded-full blur-[80px] pointer-events-none" />

            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10 w-full h-full">

                {/* Left Section - Text Content */}
                <div className="flex flex-col space-y-8 max-w-lg lg:pl-12">
                    <h2 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] font-sans">
                        Built from<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">Real</span><br />
                        Food Lovers.
                    </h2>
                    <p className="text-xl text-slate-500 font-medium font-inter leading-relaxed">
                        Foodily learns from the community and personalizes it for you. See what trusted local foodies are enjoying right now.
                    </p>
                    <div>
                        <a
                            href="#"
                            className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200 font-inter"
                        >
                            Join the Community
                        </a>
                    </div>
                </div>

                {/* Right Section - Angled Cards Container */}
                <div className="relative h-[600px] flex gap-6 justify-center lg:justify-start -rotate-3 scale-[0.85] lg:scale-100 origin-center lg:origin-left">

                    {/* Left Column (Slides Down) */}
                    <div
                        className={`flex flex-col gap-6 w-72 transition-all duration-[1500ms] ease-out ${isAnimated
                            ? 'translate-y-0 opacity-100'
                            : '-translate-y-[150%] opacity-0'
                            }`}
                    >
                        {/* Add infinite scroll duplicate logic visually or just static list for now as per prompt */}
                        <div className="flex flex-col gap-6">
                            {leftCards.map(card => renderCard(card))}
                        </div>
                    </div>

                    {/* Right Column (Slides Up) */}
                    <div
                        className={`flex flex-col gap-6 w-72 mt-24 transition-all duration-[1500ms] ease-out ${isAnimated
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-[150%] opacity-0'
                            }`}
                    >
                        <div className="flex flex-col gap-6">
                            {rightCards.map(card => renderCard(card))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityInsights;
