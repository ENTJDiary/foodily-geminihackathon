import React, { useState, useEffect } from 'react';
import { HistoryEntry, HistoryLogItem } from '../../types';

interface DailyLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: HistoryEntry;
    onSave: (updates: Partial<HistoryEntry>) => void;
}

const DailyLogModal: React.FC<DailyLogModalProps> = ({ isOpen, onClose, entry, onSave }) => {
    const [restaurantName, setRestaurantName] = useState(entry.restaurantName || '');
    const [logs, setLogs] = useState<HistoryLogItem[]>(entry.logs || []);

    useEffect(() => {
        if (isOpen) {
            setRestaurantName(entry.restaurantName || '');
            setLogs(entry.logs || [{ id: Date.now().toString(), foodName: entry.foodType, rating: 0 }]);
        }
    }, [isOpen, entry]);

    const handleAddLog = () => {
        setLogs([...logs, { id: Date.now().toString(), foodName: '', rating: 0 }]);
    };

    const handleUpdateLog = (id: string, field: keyof HistoryLogItem, value: any) => {
        setLogs(logs.map(log => log.id === id ? { ...log, [field]: value } : log));
    };

    const handleRemoveLog = (id: string) => {
        setLogs(logs.filter(log => log.id !== id));
    };

    const handleSave = () => {
        // Sync foodType with the logs for backward compatibility
        const foodType = logs.map(l => l.foodName).filter(Boolean).join(', ');
        onSave({
            restaurantName,
            logs,
            foodType: foodType || entry.foodType // Fallback if empty
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-4 border-orange-50 flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-orange-50 bg-white flex justify-between items-center sticky top-0 z-10">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <span className="text-orange-600 text-2xl">✎</span> Daily Food Log
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto">
                    {/* Restaurant Name */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Restaurant</label>
                        <input
                            type="text"
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                            placeholder="Where did you eat?"
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all font-bold text-slate-700 outline-none placeholder:text-slate-300 placeholder:font-medium"
                        />
                    </div>

                    <div className="w-full h-px bg-slate-100"></div>

                    {/* Food Items */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Food & Ratings</label>
                        </div>

                        <div className="space-y-3">
                            {logs.map((log, index) => (
                                <div key={log.id} className="flex gap-3 items-center group animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={log.foodName}
                                            onChange={(e) => handleUpdateLog(log.id, 'foodName', e.target.value)}
                                            placeholder="What did you have?"
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:border-orange-500 focus:bg-white transition-all font-semibold text-sm outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => handleUpdateLog(log.id, 'rating', star)}
                                                className={`w-6 h-6 transition-transform active:scale-90 ${log.rating >= star ? 'text-orange-500' : 'text-slate-200'}`}
                                            >
                                                <svg className="w-full h-full fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                    {logs.length > 1 && (
                                        <button onClick={() => handleRemoveLog(log.id)} className="text-slate-300 hover:text-red-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddLog}
                            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Add Item
                        </button>
                    </div>
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={handleSave}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                        Save Food Log
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyLogModal;
