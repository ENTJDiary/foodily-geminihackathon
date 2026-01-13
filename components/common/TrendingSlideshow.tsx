import React, { useEffect, useState } from 'react';

interface Slide {
    id: number;
    image: string;
    title: string;
    subtitle?: string;
}

const slides: Slide[] = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092',
        title: '🔥 Trending This Week',
        subtitle: 'Top ramen spots people can’t stop talking about',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
        title: '🍔 Burger Lovers Pick',
        subtitle: 'Juicy burgers near you',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
        title: '🥗 Healthy & Fresh',
        subtitle: 'Weekly clean-eating favorites',
    },
];

const TrendingSlideshow: React.FC = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 4500);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative overflow-hidden rounded-3xl shadow-sm border border-orange-50 h-[260px]">

        {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === current ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-[260px] object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end">
                        <div className="p-8 text-white">
                            <h3 className="text-2xl font-extrabold tracking-tight">
                                {slide.title}
                            </h3>
                            {slide.subtitle && (
                                <p className="text-sm text-white/80 mt-1">
                                    {slide.subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Dots */}
            <div className="absolute bottom-4 right-6 flex gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-2.5 h-2.5 rounded-full transition ${
                            i === current ? 'bg-white' : 'bg-white/40'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default TrendingSlideshow;
