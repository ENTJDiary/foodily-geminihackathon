import React from 'react';
import { useNavigate } from 'react-router-dom';

interface FeatureShowcaseProps {
    title: string;
    description: string;
    screenshotUrl: string;
    route: string;
    reverse?: boolean;
}

const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({
    title,
    description,
    screenshotUrl,
    route,
    reverse = false
}) => {
    const navigate = useNavigate();

    return (
        <div className={`w-full py-20 px-6 ${reverse ? 'bg-slate-50' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${reverse ? 'lg:grid-flow-dense' : ''}`}>

                    {/* Text Content */}
                    <div className={`space-y-6 ${reverse ? 'lg:col-start-2' : ''}`}>
                        <h2 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                            {title}
                        </h2>

                        <p className="text-xl text-slate-600 leading-relaxed font-medium">
                            {description}
                        </p>

                        <button
                            onClick={() => navigate(route)}
                            className="group bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-3"
                        >
                            Try it now
                            <svg
                                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="3"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>

                    {/* Screenshot/Preview */}
                    <div className={`relative ${reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                        <div className="relative group">
                            {/* Decorative background blob */}
                            <div className="absolute -inset-4 bg-gradient-to-br from-orange-200 to-orange-400 rounded-[3rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500" />

                            {/* Screenshot container */}
                            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 transition-transform duration-500 group-hover:scale-[1.02]">
                                <img
                                    src={screenshotUrl}
                                    alt={`${title} preview`}
                                    className="w-full h-auto"
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
