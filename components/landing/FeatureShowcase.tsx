import React from 'react';
import { useNavigate } from 'react-router-dom';

interface FeatureShowcaseProps {
    title: string;
    description: string;
    screenshotUrl: string;
    route: string;
    reverse?: boolean;
    scale?: number; // Optional scale factor (e.g. 0.85 for 15% smaller)
    ctaText?: string; // Optional custom button text
}

const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({
    title,
    description,
    screenshotUrl,
    route,
    reverse = false,
    scale = 1,
    ctaText = "Try it now"
}) => {
    const navigate = useNavigate();

    return (
        <div className={`w-full py-20 px-6 ${reverse ? 'bg-slate-50' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${reverse ? 'lg:grid-flow-dense' : ''}`}>

                    {/* Text Content */}
                    <div className={`space-y-10 ${reverse ? 'lg:col-start-2' : ''}`}>
                        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                            {title}
                        </h2>

                        <p className="text-lg text-slate-600 leading-relaxed font-medium">
                            {description}
                        </p>

                        <button
                            onClick={() => navigate(route)}
                            className="group bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2 w-fit"
                        >
                            {ctaText}
                            <svg
                                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2.5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>

                    {/* Screenshot/Preview */}
                    <div className={`relative flex justify-center ${reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                        <div
                            className="relative group perspective-1000 transition-all duration-500"
                            style={{
                                width: `${scale * 100}%`,
                                maxWidth: '100%'
                            }}
                        >
                            {/* Floating Card Effect */}
                            <div className="relative bg-white rounded-3xl overflow-hidden border-2 border-slate-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl shadow-xl">
                                <img
                                    src={screenshotUrl}
                                    alt={`${title} preview`}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FeatureShowcase;
