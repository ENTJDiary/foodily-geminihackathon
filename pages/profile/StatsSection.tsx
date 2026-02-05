import React, { useState, useEffect } from 'react';
import { subscribeFoodLogs, FoodLog } from '../../services/foodLogsService';
import { getAuth } from 'firebase/auth';
import {
    getCurrentMonthRange,
    getLastMonthRange,
    calculateUserStats,
    calculateRankings,
    calculateNutrientAnalysis
} from '../../utils/statsUtils';

const StatsSection: React.FC = () => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    // Use empty arrays for initial state
    const [currentMonthLogs, setCurrentMonthLogs] = useState<FoodLog[]>([]);
    const [lastMonthLogs, setLastMonthLogs] = useState<FoodLog[]>([]);

    // View State
    const [viewMode, setViewMode] = useState<'current' | 'past'>('current');
    const [isComparing, setIsComparing] = useState(false);

    // Hover State
    const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
    const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
    const [hoveredNutrient, setHoveredNutrient] = useState<string | null>(null);

    // --- Data Fetching ---
    useEffect(() => {
        if (!userId) return;

        // Fetch Current Month (REAL DATA)
        const currentRange = getCurrentMonthRange();
        const unsubCurrent = subscribeFoodLogs(userId, (logs) => {
            setCurrentMonthLogs(logs);
        }, currentRange.start, currentRange.end);

        return () => {
            unsubCurrent();
        };
    }, [userId]);

    // Independent Effect for Last Month Dummy Data (Runs once valid user exists)
    useEffect(() => {
        if (!userId) return;

        // Generate Dates for Last Month
        const now = new Date();
        const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const lastMonthIdx = now.getMonth() === 0 ? 11 : now.getMonth() - 1;

        const getDate = (day: number) => {
            const d = new Date(lastMonthYear, lastMonthIdx, day);
            return d.toISOString().split('T')[0];
        };

        const dummyLastMonthLogs: any[] = [
            { logId: '1', userId, date: getDate(15), cuisine: 'Japanese', foodType: 'Ramen', restaurantName: 'Saiko Ramen', rating: 5 },
            { logId: '2', userId, date: getDate(16), cuisine: 'Italian', foodType: 'Pizza', restaurantName: 'Luigi\'s', rating: 4 },
            { logId: '3', userId, date: getDate(18), cuisine: 'Mexican', foodType: 'Tacos', restaurantName: 'Taco Bell', rating: 3 },
            { logId: '4', userId, date: getDate(20), cuisine: 'Japanese', foodType: 'Sushi', restaurantName: 'Sushi Zen', rating: 5 },
            { logId: '5', userId, date: getDate(22), cuisine: 'American', foodType: 'Burger', restaurantName: 'Burger King', rating: 2 },
            { logId: '6', userId, date: getDate(25), cuisine: 'Thai', foodType: 'Pad Thai', restaurantName: 'Thai Spice', rating: 5 },
            { logId: '7', userId, date: getDate(28), cuisine: 'Japanese', foodType: 'Ramen', restaurantName: 'Saiko Ramen', rating: 5 },
            { logId: '8', userId, date: getDate(29), cuisine: 'Vietnamese', foodType: 'Pho', restaurantName: 'Pho 99', rating: 4 },
            { logId: '9', userId, date: getDate(30), cuisine: 'Korean', foodType: 'BBQ', restaurantName: 'K-BBQ', rating: 5 },
            { logId: '10', userId, date: getDate(10), cuisine: 'Salad', foodType: 'Caesar', restaurantName: 'Green House', rating: 4 },
            { logId: '11', userId, date: getDate(5), cuisine: 'Fast Food', foodType: 'Fries', restaurantName: 'McD', rating: 3 },
            { logId: '12', userId, date: getDate(12), cuisine: 'Seafood', foodType: 'Fish', restaurantName: 'Ocean Blue', rating: 5 },
            // Add robust extra data to ensure charts look populated
            { logId: '13', userId, date: getDate(2), cuisine: 'Indian', foodType: 'Curry', restaurantName: 'Spice House', rating: 4 },
            { logId: '14', userId, date: getDate(3), cuisine: 'Chinese', foodType: 'Dim Sum', restaurantName: 'Dragon Palace', rating: 5 },
        ];

        console.log('Setting Dummy Last Month Logs:', dummyLastMonthLogs);
        setLastMonthLogs(dummyLastMonthLogs as unknown as FoodLog[]);

    }, [userId]);

    // --- Derived Stats ---
    const currentStats = calculateUserStats(currentMonthLogs);
    const lastStats = calculateUserStats(lastMonthLogs);

    // Determine which stats to show based on view mode (primary view)
    const displayedStats = viewMode === 'current' ? currentStats : lastStats;
    // Comparisons always compare "against" the other. 
    // If viewMode is current, we compare with last.
    // Use the *Past* stats as the overlay/comparison usage if we are in 'current' mode, usually.
    // The requirement says: "VS button... to compare the stats, the comparison should be a different colour overlaying on top of the current month stat"
    // So if VS is ON, we overlay `lastStats` on top of `currentStats` (or vice versa depending on what's selected).
    // Let's assume User is viewing Current, sees Current. Hits VS -> Sees Current + Last (in Teal).
    const comparisonStats = viewMode === 'current' ? lastStats : currentStats;

    // Rankings & Nutrients always follow the PRIMARY view mode
    const displayedRankings = calculateRankings(
        viewMode === 'current' ? currentMonthLogs : lastMonthLogs,
        viewMode === 'current' ? lastMonthLogs : [] // Pass prev logs for trend calc only if comparing current vs last
    );
    const displayedNutrients = calculateNutrientAnalysis(viewMode === 'current' ? currentMonthLogs : lastMonthLogs);


    // --- Hexagon Configuration ---
    const getHexagonConfig = (stats: any) => [
        { key: 'healthLevel', label: 'Health Level', value: stats.healthLevel, angle: 0, description: 'Overall wellness score based on your nutrient intake and consistency.' },
        { key: 'exp', label: 'Exp Lvl', value: stats.exp, angle: 60, description: 'Your level based on app usage and community contributions.' },
        { key: 'coinsSpent', label: 'Coins', value: stats.coinsSpent, angle: 120, description: 'Total value of coins redeemed for discounts and offers.' },
        { key: 'satisfactory', label: 'Satisfactory', value: stats.satisfactory, angle: 180, description: 'Average satisfaction rating from your reviews.' },
        { key: 'balance', label: 'Balance', value: stats.balance, angle: 240, description: 'Variety score based on different cuisines tried.' },
        { key: 'intensity', label: 'Intensity', value: stats.intensity, angle: 300, description: 'Average intensity of flavors consumed this month.' },
    ];

    const primaryHexData = getHexagonConfig(displayedStats);
    const comparisonHexData = getHexagonConfig(comparisonStats); // For the overlay

    // --- Drawing Helpers ---
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

    const createPath = (data: any[]) => data
        .map((stat, i) => {
            const point = getPoint(stat.angle, stat.value);
            return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
        })
        .join(' ') + ' Z';

    const backgroundHexagonPath = primaryHexData
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
            <div className="bg-white p-8 rounded-2xl border border-orange-100 shadow-sm relative">
                {/* Header Container */}
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stats Overview</h3>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {/* Toggle Month */}
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('past')}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${viewMode === 'past' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                Past
                            </button>
                            <button
                                onClick={() => setViewMode('current')}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${viewMode === 'current' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                Current
                            </button>
                        </div>

                        {/* VS Button */}
                        <button
                            onClick={() => setIsComparing(!isComparing)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-black text-[10px] transition-all ${isComparing
                                ? 'bg-teal-500 border-teal-500 text-white shadow-md scale-105'
                                : 'border-slate-200 text-slate-300 hover:border-teal-400 hover:text-teal-400'
                                }`}
                            title="Compare with other month"
                        >
                            VS
                        </button>
                    </div>
                </div>

                {/* Legend (Only when comparing) */}
                {isComparing && (
                    <div className="absolute top-20 right-8 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span className="text-[10px] font-bold text-slate-500">{viewMode === 'current' ? 'Current' : 'Past'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                            <span className="text-[10px] font-bold text-slate-500">{viewMode === 'current' ? 'Past' : 'Current'}</span>
                        </div>
                    </div>
                )}


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
                            const gridPath = primaryHexData
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
                        {primaryHexData.map((stat) => {
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

                        {/* COMPARISON DATA (Rendered First to be behind primary, or second to overlay? Requirement say overlay. BUT typically overlay implies transparent on top) */}
                        {isComparing && (
                            <path
                                d={createPath(comparisonHexData)}
                                fill="rgba(45, 212, 191, 0.2)" // Teal transparent
                                stroke="#2DD4BF" // Teal solid
                                strokeWidth="2"
                                strokeDasharray="4 2" // Dashed line for comparison
                                className="transition-all duration-500"
                            />
                        )}

                        {/* DATA HEXAGON (Primary) */}
                        <path
                            d={createPath(primaryHexData)}
                            fill="url(#dataGradient)"
                            stroke="#FF6B35"
                            strokeWidth="3"
                            className="transition-all duration-500"
                        />

                        {/* Data points */}
                        {primaryHexData.map((stat) => {
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
                        {primaryHexData.map((stat) => {
                            const labelPos = getLabelPoint(stat.angle);
                            const isLabelHovered = hoveredLabel === stat.key;

                            // Determine tooltip position based on angle to avoid blocking the chart
                            let tooltipX = labelPos.x - 80; // Default centered x for top/bottom
                            let tooltipY = labelPos.y;

                            if (stat.angle === 0) { // Top (Health Level)
                                tooltipY = labelPos.y - 80;
                            } else if (stat.angle === 180) { // Bottom (Satisfactory)
                                tooltipY = labelPos.y + 25;
                            } else if (stat.angle === 60 || stat.angle === 120) { // Right (Exp, Coins)
                                tooltipX = labelPos.x + 30;
                                tooltipY = labelPos.y - 25; // Center vertically relative to tooltip height
                            } else { // Left (Balance, Intensity)
                                tooltipX = labelPos.x - 200;
                                tooltipY = labelPos.y - 25; // Center vertically
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
                        {getTrendIcon(displayedRankings.topCuisine.trend)}
                    </div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{viewMode === 'current' ? 'Top Cuisine (This Month)' : 'Top Cuisine (Last Month)'}</h4>
                    <p className="text-2xl font-black text-slate-900 mb-1">{displayedRankings.topCuisine.name}</p>
                    <p className="text-sm text-slate-500 font-semibold">{displayedRankings.topCuisine.count} visits</p>
                    {displayedRankings.topCuisine.trend !== 'stable' && (
                        <p className="text-xs text-orange-600 font-bold mt-2">
                            {displayedRankings.topCuisine.trend === 'up' ? '↑' : '↓'} {displayedRankings.topCuisine.trendValue}% {viewMode === 'current' ? 'vs last month' : 'vs prev month'}
                        </p>
                    )}
                </div>

                {/* Top Restaurant */}
                <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        {getTrendIcon(displayedRankings.topRestaurant.trend)}
                    </div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{viewMode === 'current' ? 'Top Restaurant (This Month)' : 'Top Restaurant (Last Month)'}</h4>
                    <p className="text-2xl font-black text-slate-900 mb-1 line-clamp-1">{displayedRankings.topRestaurant.name}</p>
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className={`w-4 h-4 ${i < displayedRankings.topRestaurant.rating ? 'text-yellow-400' : 'text-slate-200'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                </div>

                {/* Eating Out Stats */}
                <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        {getTrendIcon(displayedRankings.eatingOutStats.trend)}
                    </div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{viewMode === 'current' ? 'Eating Out (This Month)' : 'Eating Out (Last Month)'}</h4>
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-black text-slate-900">{displayedRankings.eatingOutStats.timesEaten}</p>
                            <p className="text-xs text-slate-500 font-semibold">times</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-lg font-black text-orange-600">${displayedRankings.eatingOutStats.coinsSpent}</p>
                            <p className="text-xs text-slate-500 font-semibold">est. value</p>
                        </div>
                        <p className="text-xs text-slate-600 font-bold mt-2">
                            ~${displayedRankings.eatingOutStats.avgPerVisit.toFixed(1)} per visit
                        </p>
                    </div>
                    {displayedRankings.eatingOutStats.trend !== 'stable' && (
                        <p className="text-xs text-orange-600 font-bold mt-2">
                            {displayedRankings.eatingOutStats.trend === 'up' ? '↑' : '↓'} {displayedRankings.eatingOutStats.trendValue}% {viewMode === 'current' ? 'vs last month' : 'vs prev month'}
                        </p>
                    )}
                </div>
            </div>

            {/* 3rd Bracket - Nutrient Analysis */}
            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Nutrient Analysis (Est.)</h3>

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
                                    {displayedNutrients.protein.grams}g
                                </span>
                            )}
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500 shadow-inner"
                                style={{ width: `${displayedNutrients.protein.percentage}%` }}
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
                                    {displayedNutrients.fat.grams}g
                                </span>
                            )}
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-orange-700 rounded-full transition-all duration-500 shadow-inner"
                                style={{ width: `${displayedNutrients.fat.percentage}%` }}
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
                                    {displayedNutrients.sugar.grams}g
                                </span>
                            )}
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-600 to-orange-800 rounded-full transition-all duration-500 shadow-inner"
                                style={{ width: `${displayedNutrients.sugar.percentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                <p className="text-xs text-slate-400 font-semibold mt-6 text-center">
                    Aggregate analysis based on {viewMode === 'current' ? 'this month\'s' : 'last month\'s'} logs
                </p>
            </div>
        </div>
    );
};

export default StatsSection;
