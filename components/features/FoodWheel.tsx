import React, { useState, useEffect, useRef } from 'react';
import { WheelOption } from '../../types';
import { getWheelOptions, removeFromWheel } from '../../services/storageService';

const COLORS = [
    // Foodily Brand Palette (Alternating for visual interest but keeping it minimal)
    ['#FFFFFF', '#FFFFFF'],   // White
    ['#FFF7ED', '#FFF7ED'],   // Orange-50
    ['#F8FAFC', '#F8FAFC'],   // Slate-50
    ['#FFEDD5', '#FFEDD5'],   // Orange-100
];

interface FoodWheelProps {
    onSelectFood?: (foodName: string) => void;
}

const FoodWheel: React.FC<FoodWheelProps> = ({ onSelectFood }) => {
    const [options, setOptions] = useState<WheelOption[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [selectedOption, setSelectedOption] = useState<WheelOption | null>(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newOptionName, setNewOptionName] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Load options from localStorage on mount and listen for external updates
    useEffect(() => {
        // Clear any persisted options on mount (fresh start each page load)
        localStorage.removeItem('foodily_wheel_options');

        const loadOptions = () => {
            setOptions(getWheelOptions());
        };

        // Listen for updates from FoodRandomizer during this session
        window.addEventListener('wheelOptionsUpdated', loadOptions);

        return () => {
            window.removeEventListener('wheelOptionsUpdated', loadOptions);
        };
    }, []);

    // Draw wheel on canvas
    useEffect(() => {
        if (!canvasRef.current || options.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Improve resolution for retina displays
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        const anglePerSegment = (2 * Math.PI) / options.length;

        // Clear canvas
        ctx.clearRect(0, 0, rect.width, rect.height);

        // Draw segments
        options.forEach((option, index) => {
            const startAngle = index * anglePerSegment;
            const endAngle = startAngle + anglePerSegment;

            // Get background color
            const colorPair = COLORS[index % COLORS.length];

            // Flat Fill (Minimalist)
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colorPair[0];
            ctx.fill();

            // Brand Border Lines (Orange)
            ctx.strokeStyle = 'rgba(249, 115, 22, 0.2)'; // Orange-500 low opacity
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + anglePerSegment / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';

            // Text branding: Slate-900 or Orange-600 for contrast
            ctx.fillStyle = '#ea580c'; // Orange-600 text for brand pop

            // Font styling: Match Foodily's "font-black" aesthetic but legible
            ctx.font = '800 11px system-ui, -apple-system, sans-serif';

            // No growth/shrink animation here, just static render
            let text = option.name;
            if (text.length > 20) text = text.substring(0, 18) + '...';

            // Uppercase and tracking for brand feel
            ctx.fillText(text.toUpperCase(), radius - 30, 0);
            ctx.restore();
        });

        // Center Knob
        ctx.beginPath();
        ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(234, 88, 12, 0.1)'; // Orange shadow
        ctx.shadowBlur = 10;
        ctx.fill();

        // Inner Ring (Orange Brand)
        ctx.beginPath();
        ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
        ctx.strokeStyle = '#fed7aa'; // Orange-200
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dot
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#ea580c'; // Orange-600
        ctx.fill();

    }, [options, rotation]);

    const addOption = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOptionName.trim()) return;

        const newOption: WheelOption = {
            id: Math.random().toString(36).substr(2, 9),
            name: newOptionName.trim(),
            color: '#000',
            timestamp: Date.now(),
        };

        const updatedOptions = [...options, newOption];
        setOptions(updatedOptions);

        if (updatedOptions.length > 0) {
            localStorage.setItem('foodily_wheel_options', JSON.stringify(updatedOptions));
        }

        setNewOptionName('');
        setShowAddModal(false);
    };

    const handleRemoveOption = (optionId: string) => {
        removeFromWheel(optionId);
        // Options will be updated via the event listener
    };

    const spinWheel = () => {
        if (isSpinning || options.length === 0) return;

        setIsSpinning(true);

        const startRotation = rotation;
        const spins = 5 + Math.random() * 3;
        const randomAngle = Math.random() * 360;

        const spinRotation = spins * 360 + randomAngle;
        const finalRotation = startRotation + spinRotation;

        setRotation(finalRotation);

        setTimeout(() => {
            const normalizedRotation = finalRotation % 360;
            const anglePerSegment = 360 / options.length;
            const pointerAngle = (360 - normalizedRotation) % 360;

            const selectedIndex = Math.floor(
                pointerAngle / anglePerSegment
            );

            const index = Math.min(options.length - 1, Math.max(0, selectedIndex));

            setSelectedOption(options[index]);
            setShowResultModal(true);
            setIsSpinning(false);
        }, 4000);
    };

    // Slow elegant idle spin
    useEffect(() => {
        if (isSpinning || options.length === 0) return;

        let frameId: number;
        const animate = () => {
            setRotation(prev => prev + 0.02); // Very slow, luxurious rotation
            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [isSpinning, options.length]);

    const handleConfirm = () => {
        setShowResultModal(false);
        if (selectedOption && onSelectFood) {
            onSelectFood(selectedOption.name);
        }
        setSelectedOption(null);
    };

    const handleReject = () => {
        if (selectedOption) {
            handleRemoveOption(selectedOption.id);
        }
        setShowResultModal(false);
        setSelectedOption(null);
    };

    // Empty State (Minimalist)
    if (options.length === 0) {
        return (
            <div className="bg-white p-12 rounded-[2.5rem] border border-orange-100 shadow-[0_8px_30px_rgb(234,88,12,0.05)] space-y-8 text-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
                        <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-2">
                            The Wheel
                        </h4>
                        <p className="text-slate-400 font-bold text-xs tracking-wide">
                            Add items to begin
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-8 py-4 rounded-2xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-700 shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]"
                    >
                        Add First Option
                    </button>
                </div>

                {/* Minimalist Add Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-white/90 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="w-full max-w-md bg-transparent space-y-8 text-center animate-in zoom-in-95 duration-300">
                            <h5 className="font-black text-orange-600 uppercase tracking-[0.3em] text-sm">New Entry</h5>
                            <form onSubmit={addOption} className="space-y-8">
                                <input
                                    type="text"
                                    value={newOptionName}
                                    onChange={(e) => setNewOptionName(e.target.value)}
                                    placeholder="Type here..."
                                    className="w-full bg-transparent border-b-2 border-orange-200 focus:border-orange-600 py-4 text-3xl font-bold text-slate-800 placeholder:text-orange-200 outline-none text-center transition-all"
                                    required
                                    autoFocus
                                />
                                <div className="flex justify-center gap-4">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                                    <button type="submit" className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 hover:text-orange-700 transition-colors">Confirm</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-orange-50 space-y-12 relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
                <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.3em] flex items-center gap-2">
                        The Wheel
                    </h4>
                    <p className="text-slate-400 font-medium text-sm">
                        {options.length} {options.length === 1 ? 'Option' : 'Options'}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Add
                </button>
            </div>

            {/* Wheel Display */}
            <div className="relative flex flex-col items-center gap-12">
                <div className="relative flex items-center justify-center">
                    <canvas
                        ref={canvasRef}
                        style={{
                            width: '350px',
                            height: '350px',
                            transition: isSpinning ? 'transform 4s cubic-bezier(0.2, 0, 0, 1)' : 'none',
                            transform: `rotate(${rotation}deg)`,
                        }}
                        className="relative z-10"
                    />

                    {/* Pointer - Orange Triangle */}
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 z-20">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-orange-600 drop-shadow-sm"></div>
                    </div>
                </div>

                {/* Brand Spin Button */}
                <button
                    onClick={spinWheel}
                    disabled={isSpinning}
                    className="group relative px-12 py-5 overflow-hidden rounded-2xl bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-orange-500/30 hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="relative z-10">
                        {isSpinning ? 'Spinning...' : 'Spin Wheel'}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </div>

            {/* Current Options - Brand Tags */}
            <div className="flex flex-wrap justify-center gap-3">
                {options.map((option, index) => (
                    <div
                        key={option.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-100 bg-orange-50/50 text-[10px] font-black text-orange-700 uppercase tracking-wide hover:border-orange-200 hover:bg-orange-100 transition-all group cursor-default"
                    >
                        <span>{option.name}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveOption(option.id); }}
                            className="text-orange-300 hover:text-red-500 transition-colors"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-white/90 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-transparent space-y-8 text-center animate-in zoom-in-95 duration-300">
                        <h5 className="font-black text-orange-600 uppercase tracking-[0.3em] text-sm">New Entry</h5>
                        <form onSubmit={addOption} className="space-y-8">
                            <input
                                type="text"
                                value={newOptionName}
                                onChange={(e) => setNewOptionName(e.target.value)}
                                placeholder="Type here..."
                                className="w-full bg-transparent border-b-2 border-orange-200 focus:border-orange-600 py-4 text-3xl font-bold text-slate-800 placeholder:text-orange-200 outline-none text-center transition-all"
                                required
                                autoFocus
                            />
                            <div className="flex justify-center gap-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                                <button type="submit" className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 hover:text-orange-700 transition-colors">Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Result Modal - Brand Style */}
            {showResultModal && selectedOption && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-white/95 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="text-center space-y-12 animate-in slide-in-from-bottom-8 duration-500">
                        <div className="inline-flex p-4 rounded-full bg-orange-50 text-orange-500 mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                                The Wheel chose
                            </h3>
                            <div className="text-5xl md:text-7xl font-black text-slate-800 tracking-tight leading-tight">
                                {selectedOption.name}
                            </div>
                        </div>

                        <div className="flex justify-center gap-6">
                            <button
                                onClick={handleReject}
                                className="px-8 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-600 hover:border-slate-300 transition-all"
                            >
                                Rewrite Fate
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-10 py-4 rounded-2xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/30"
                            >
                                Let's Eat!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodWheel;
