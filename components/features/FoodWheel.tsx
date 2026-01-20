import React, { useState, useEffect, useRef } from 'react';
import { WheelOption } from '../../types';
import { getWheelOptions, removeFromWheel } from '../../services/storageService';

const COLORS = ['#FF6B35', '#FF8C42', '#FFA74F', '#FFB85C', '#FF9A56', '#FFA060'];

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

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        const anglePerSegment = (2 * Math.PI) / options.length;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw segments
        options.forEach((option, index) => {
            const startAngle = index * anglePerSegment;
            const endAngle = startAngle + anglePerSegment;

            // Draw segment
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = option.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + anglePerSegment / 2);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px system-ui';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 4;
            ctx.fillText(option.name, radius * 0.65, 0);
            ctx.restore();
        });

        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#FF6B35';
        ctx.lineWidth = 4;
        ctx.stroke();
    }, [options, rotation]);

    const addOption = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOptionName.trim()) return;

        const newOption: WheelOption = {
            id: Math.random().toString(36).substr(2, 9),
            name: newOptionName.trim(),
            color: COLORS[options.length % COLORS.length],
            timestamp: Date.now(),
        };

        const updatedOptions = [...options, newOption];
        setOptions(updatedOptions);

        // Save to shared storage
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

        const startRotation = rotation; // ✅ capture current rotation

        const spins = 4 + Math.random() * 2;
        const randomAngle = Math.random() * 360;
        const spinRotation = spins * 360 + randomAngle;

        const finalRotation = startRotation + spinRotation;

        setRotation(finalRotation);

        setTimeout(() => {
            const normalizedRotation = finalRotation % 360;
            const anglePerSegment = 360 / options.length;

            // Pointer is on RIGHT (0°)
            const pointerAngle = (360 - normalizedRotation) % 360;

            const selectedIndex = Math.floor(
                pointerAngle / anglePerSegment
            );

            setSelectedOption(options[selectedIndex]);
            setShowResultModal(true);
            setIsSpinning(false);
        }, 3000);
    };

    // Idle spin animation
    useEffect(() => {
        if (isSpinning || options.length === 0) return;

        let frameId: number;
        const animate = () => {
            setRotation(prev => prev + 0.15);
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

    // Show placeholder if no options
    if (options.length === 0) {
        return (
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-orange-50 space-y-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.3em]">
                            Spin the Wheel
                        </h4>
                        <p className="text-slate-400 font-medium text-sm">
                            Can't decide? Add your options and let fate choose!
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
                        title="Add Option"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <p className="text-slate-400 font-bold text-sm">Add options to spin the wheel</p>
                </div>

                {/* Add Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-orange-50">
                            <div className="p-8 border-b border-orange-50 flex justify-between items-center">
                                <h5 className="font-black text-slate-900 uppercase tracking-widest text-sm">Add Option</h5>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                            <form onSubmit={addOption} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        Food or Restaurant Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newOptionName}
                                        onChange={(e) => setNewOptionName(e.target.value)}
                                        placeholder="e.g. Thai Curry, Burger King"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 font-bold text-sm outline-none"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-orange-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-md hover:bg-orange-700 active:scale-[0.98] transition-all"
                                >
                                    Add to Wheel
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-orange-50 space-y-8">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.3em]">
                        Spin the Wheel
                    </h4>
                    <p className="text-slate-400 font-medium text-sm">
                        {options.length} option{options.length !== 1 ? 's' : ''} • Click spin to choose!
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
                    title="Add Option"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* Wheel Display */}
            <div className="relative flex flex-col items-center gap-6">
                <div className="relative flex items-center justify-center">
                    {/* Canvas Wheel */}
                    <div className="relative">
                        <canvas
                            ref={canvasRef}
                            width={500}
                            height={500}
                            className="drop-shadow-xl"
                            style={{
                                transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                                transform: `rotate(${rotation}deg)`,
                            }}
                        />
                    </div>

                    {/* Pointer - Right Side, pointing inward using ml-1 (4px) */}
                    <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[30px] border-r-orange-600 drop-shadow-lg z-10 ml-1" />
                </div>

                {/* Spin Button */}
                <button
                    onClick={spinWheel}
                    disabled={isSpinning}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-black py-5 px-12 rounded-2xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 uppercase text-xs tracking-widest"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {isSpinning ? 'Spinning...' : 'Spin Wheel'}
                </button>
            </div>

            {/* Current Options List */}
            <div className="space-y-3">
                <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Options</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {options.map((option) => (
                        <div
                            key={option.id}
                            className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 group hover:border-orange-200 transition-all"
                        >
                            <div
                                className="w-4 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: option.color }}
                            />
                            <span className="text-sm font-bold text-slate-700 truncate flex-1">{option.name}</span>
                            <button
                                onClick={() => handleRemoveOption(option.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-all"
                                title="Delete"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-orange-50">
                        <div className="p-8 border-b border-orange-50 flex justify-between items-center">
                            <h5 className="font-black text-slate-900 uppercase tracking-widest text-sm">Add Option</h5>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                        <form onSubmit={addOption} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Food or Restaurant Name
                                </label>
                                <input
                                    type="text"
                                    value={newOptionName}
                                    onChange={(e) => setNewOptionName(e.target.value)}
                                    placeholder="e.g. Thai Curry, Burger King"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 font-bold text-sm outline-none"
                                    required
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-orange-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-md hover:bg-orange-700 active:scale-[0.98] transition-all"
                            >
                                Add to Wheel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Result Modal */}
            {showResultModal && selectedOption && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-4 border-orange-500">
                        <div className="p-12 text-center space-y-8">
                            <div className="space-y-4">
                                <div className="inline-block p-6 rounded-full bg-orange-50">
                                    <svg className="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.3em]">
                                    The Wheel Has Spoken!
                                </h3>
                                <div
                                    className="inline-block px-8 py-4 rounded-2xl text-3xl font-black text-white shadow-lg"
                                    style={{ backgroundColor: selectedOption.color }}
                                >
                                    {selectedOption.name}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleReject}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-5 rounded-2xl transition-all uppercase text-xs tracking-widest border-2 border-slate-200"
                                >
                                    Nahh
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl transition-all shadow-md uppercase text-xs tracking-widest"
                                >
                                    Let's Go!
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Click "Nahh" to remove this option and spin again
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodWheel;
