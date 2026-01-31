import React, { useState } from 'react';
import { getUserStats, getUserRankings, getNutrientAnalysis } from '../../services/storageService';

const StatsSection: React.FC = () => {
    const stats = getUserStats();
    const rankings = getUserRankings();
    const nutrients = getNutrientAnalysis();

    const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
    const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
    const [hoveredNutrient, setHoveredNutrient] = useState<string | null>(null);

    // Hexagon configuration
    const hexagonStats = [
        { key: 'healthLevel', label: 'Health Level', value: stats.healthLevel, angle: 0, description: 'Overall wellness score based on your nutrient intake and consistency.' },
        { key: 'exp', label: 'Exp Lvl', value: stats.exp, angle: 60, description: 'Your level based on app usage and community contributions.' },
        { key: 'coinsSpent', label: 'Coins', value: stats.coinsSpent, angle: 120, description: 'Total value of coins redeemed for discounts and offers.' },
        { key: 'satisfactory', label: 'Satisfactory', value: stats.satisfactory, angle: 180, description: 'Average satisfaction rating from your reviews.' },
        { key: 'balance', label: 'Balance', value: stats.balance, angle: 240, description: 'Variety score based on different cuisines tried.' },
        { key: 'intensity', label: 'Intensity', value: stats.intensity, angle: 300, description: 'Frequency of dining out vs. home cooking.' },
    ];

    // Calculate hexagon points
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 100;

    const getPoint = (angle: number, value: number) => {
        const radius = (value / 100) * maxRadius;
        const radian = (angle - 90) * (Math.PI / 180);
        return {
            x: centerX + radius * Math.cos(radian),
            y: centerY + radius * Math.sin(radian),
        };
    };

    const getLabelPoint = (angle: number) => {
        const labelRadius = maxRadius + 35;
        const radian = (angle - 90) * (Math.PI / 180);
        return {
            x: centerX + labelRadius * Math.cos(radian),
            y: centerY + labelRadius * Math.sin(radian),
        };
    };

    // Create hexagon path
    const hexagonPath = hexagonStats
        .map((stat, i) => {
            const point = getPoint(stat.angle, stat.value);
            return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
        })
        .join(' ') + ' Z';

    // Create background hexagon (max values)
    const backgroundHexagonPath = hexagonStats
        .map((stat, i) => {
            const point = getPoint(stat.angle, 100);
            return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
        })
        .join(' ') + ' Z';

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        if (trend === 'up') {
            return (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            );
        } else if (trend === 'down') {
            return (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            );
        }
        return (
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" />
            </svg>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* 1st Bracket - Hexagon Stats */}
            <div className="bg-white p-8 rounded-2xl border border-orange-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Stats Overview</h3>

                <div className="flex justify-center items-center">
                    <svg width="300" height="300" className="drop-shadow-lg overflow-visible">
                        {/* Background hexagon */}
                        <path
                            d={backgroundHexagonPath}
                            fill="url(#bgGradient)"
                            stroke="#FFE5D9"
                            strokeWidth="2"
                            opacity="0.3"
                        />

                        {/* Grid lines */}
                        {[20, 40, 60, 80, 100].map((percent) => {
                            const gridPath = hexagonStats
                                .map((stat, i) => {
                                    const point = getPoint(stat.angle, percent);
                                    return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
                                })
                                .join(' ') + ' Z';

                            return (
                                <path
                                    key={percent}
                                    d={gridPath}
                                    fill="none"
                                    stroke="#FFE5D9"
                                    strokeWidth="1"
                                    opacity="0.4"
                                />
                            );
                        })}

                        {/* Axis lines */}
                        {hexagonStats.map((stat) => {
                            const point = getPoint(stat.angle, 100);
                            return (
                                <line
                                    key={stat.key}
                                    x1={centerX}
                                    y1={centerY}
                                    x2={point.x}
                                    y2={point.y}
                                    stroke="#FFE5D9"
                                    strokeWidth="1"
                                    opacity="0.5"
                                />
                            );
                        })}

                        {/* Data hexagon */}
                        <path
                            d={hexagonPath}
                            fill="url(#dataGradient)"
                            stroke="#FF6B35"
                            strokeWidth="3"
                            className="transition-all duration-500"
                        />

                        {/* Data points */}
                        {hexagonStats.map((stat) => {
                            const point = getPoint(stat.angle, stat.value);
                            const isHovered = hoveredPoint === stat.key;

                            return (
                                <g key={stat.key}>
                                    <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r={isHovered ? 8 : 6}
                                        fill="#FF6B35"
                                        stroke="white"
                                        strokeWidth="2"
                                        className="transition-all duration-200 cursor-pointer"
                                        onMouseEnter={() => setHoveredPoint(stat.key)}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                    />

                                    {/* Hover tooltip */}
                                    {isHovered && (
                                        <g>
                                            <rect
                                                x={point.x - 25}
                                                y={point.y - 35}
                                                width="50"
                                                height="24"
                                                rx="6"
                                                fill="#1e293b"
                                                opacity="0.95"
                                            />
                                            <text
                                                x={point.x}
                                                y={point.y - 18}
                                                textAnchor="middle"
                                                fill="white"
                                                fontSize="12"
                                                fontWeight="bold"
                                            >
                                                {stat.value}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}

                        {/* Labels */}
                        {hexagonStats.map((stat) => {
                            const labelPos = getLabelPoint(stat.angle);
                            const isLabelHovered = hoveredLabel === stat.key;

                            // Determine tooltip position based on angle to avoid blocking the chart
                            let tooltipX = labelPos.x - 80; // Default centered x for top/bottom
                            let tooltipY = labelPos.y;

                            if (stat.angle === 0) { // Top (Health Level)
                                tooltipY = labelPos.y - 110;
                            } else if (stat.angle === 180) { // Bottom (Satisfactory)
                                tooltipY = labelPos.y + 25;
                            } else if (stat.angle === 60 || stat.angle === 120) { // Right (Exp, Coins)
                                tooltipX = labelPos.x + 10;
                                tooltipY = labelPos.y - 50; // Center vertically relative to tooltip height
                            } else { // Left (Balance, Intensity)
                                tooltipX = labelPos.x - 170;
                                tooltipY = labelPos.y - 50; // Center vertically
                            }

                            return (
                                <g key={`label-group-${stat.key}`}>
                                    <text
                                        key={`label-${stat.key}`}
                                        x={labelPos.x}
                                        y={labelPos.y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="#64748b"
                                        fontSize="11"
                                        fontWeight="700"
                                        className="cursor-pointer uppercase tracking-wider"
                                        onMouseEnter={() => setHoveredLabel(stat.key)}
                                        onMouseLeave={() => setHoveredLabel(null)}
                                    >
                                        {stat.label}
                                    </text>

                                    {/* Description Tooltip for Label */}
                                    {isLabelHovered && (
                                        <foreignObject
                                            x={tooltipX}
                                            y={tooltipY}
                                            width="160"
                                            height="100"
                                            className="pointer-events-none"
                                        >
                                            <div className="bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg text-center leading-tight animate-in fade-in zoom-in duration-200">
                                                {stat.description}
                                            </div>
                                        </foreignObject>
                                    )}
                                </g>
                            );
                        })}

                        {/* Gradients */}
                        <defs>
                            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FFF5F0" />
                                <stop offset="100%" stopColor="#FFE5D9" />
                            </linearGradient>
                            <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FF8C42" stopOpacity="0.6" />
                                <stop offset="50%" stopColor="#FF6B35" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#FFA74F" stopOpacity="0.3" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            {/* 2nd Bracket - Ranking Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Top Cuisine Type */}
                <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        {getTrendIcon(rankings.topCuisine.trend)}
                    </div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Top Cuisine Type</h4>
                    <p className="text-2xl font-black text-slate-900 mb-1">{rankings.topCuisine.name}</p>
                    <p className="text-sm text-slate-500 font-semibold">{rankings.topCuisine.count} visits</p>
                    {rankings.topCuisine.trend !== 'stable' && (
                        <p className="text-xs text-orange-600 font-bold mt-2">
                            {rankings.topCuisine.trend === 'up' ? '↑' : '↓'} {rankings.topCuisine.trendValue}% this month
                        </p>
                    )}
                </div>

                {/* Top Restaurant This Month */}
                <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        {getTrendIcon(rankings.topRestaurant.trend)}
                    </div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Top Restaurant</h4>
                    <p className="text-2xl font-black text-slate-900 mb-1 line-clamp-1">{rankings.topRestaurant.name}</p>
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className={`w-4 h-4 ${i < rankings.topRestaurant.rating ? 'text-yellow-400' : 'text-slate-200'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                </div>

                {/* Total Times Eating Out vs Coins Spent */}
                <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        {getTrendIcon(rankings.eatingOutStats.trend)}
                    </div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Eating Out Stats</h4>
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-black text-slate-900">{rankings.eatingOutStats.timesEaten}</p>
                            <p className="text-xs text-slate-500 font-semibold">times</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-lg font-black text-orange-600">${rankings.eatingOutStats.coinsSpent}</p>
                            <p className="text-xs text-slate-500 font-semibold">spent</p>
                        </div>
                        <p className="text-xs text-slate-600 font-bold mt-2">
                            ~${rankings.eatingOutStats.avgPerVisit.toFixed(1)} per visit
                        </p>
                    </div>
                    {rankings.eatingOutStats.trend !== 'stable' && (
                        <p className="text-xs text-orange-600 font-bold mt-2">
                            {rankings.eatingOutStats.trend === 'up' ? '↑' : '↓'} {rankings.eatingOutStats.trendValue}% vs last month
                        </p>
                    )}
                </div>
            </div>

            {/* 3rd Bracket - Nutrient Analysis */}
            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Nutrient Analysis</h3>

                <div className="space-y-5">
                    {/* Protein */}
                    <div
                        className="relative"
                        onMouseEnter={() => setHoveredNutrient('protein')}
                        onMouseLeave={() => setHoveredNutrient(null)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-black text-slate-700 uppercase tracking-wide">Protein</span>
                            {hoveredNutrient === 'protein' && (
                                <span className="text-xs font-bold text-orange-600 animate-in fade-in duration-200">
                                    {nutrients.protein.grams}g
                                </span>
                            )}
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500 shadow-inner"
                                style={{ width: `${nutrients.protein.percentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Fat */}
                    <div
                        className="relative"
                        onMouseEnter={() => setHoveredNutrient('fat')}
                        onMouseLeave={() => setHoveredNutrient(null)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-black text-slate-700 uppercase tracking-wide">Fat</span>
                            {hoveredNutrient === 'fat' && (
                                <span className="text-xs font-bold text-orange-600 animate-in fade-in duration-200">
                                    {nutrients.fat.grams}g
                                </span>
                            )}
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-orange-700 rounded-full transition-all duration-500 shadow-inner"
                                style={{ width: `${nutrients.fat.percentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Sugar */}
                    <div
                        className="relative"
                        onMouseEnter={() => setHoveredNutrient('sugar')}
                        onMouseLeave={() => setHoveredNutrient(null)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-black text-slate-700 uppercase tracking-wide">Sugar</span>
                            {hoveredNutrient === 'sugar' && (
                                <span className="text-xs font-bold text-orange-600 animate-in fade-in duration-200">
                                    {nutrients.sugar.grams}g
                                </span>
                            )}
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-600 to-orange-800 rounded-full transition-all duration-500 shadow-inner"
                                style={{ width: `${nutrients.sugar.percentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                <p className="text-xs text-slate-400 font-semibold mt-6 text-center">
                    Aggregate analysis based on all recorded meals
                </p>
            </div>
        </div>
    );
};

export default StatsSection;
