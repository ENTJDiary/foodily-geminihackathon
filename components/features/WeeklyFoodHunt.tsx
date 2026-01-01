import React, { useState } from 'react';
import { analyzeWeeklyHabits } from '../../services/geminiService';
import { HistoryEntry } from '../../types';

interface WeeklyFoodHuntProps {
  history: HistoryEntry[];
}

const WeeklyFoodHunt: React.FC<WeeklyFoodHuntProps> = ({ history }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (history.length === 0) {
      alert("Start searching for food to populate your weekly hunt!");
      return;
    }
    setLoading(true);
    try {
      const result = await analyzeWeeklyHabits(history);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const daysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const sundayOfCurrentWeek = new Date(today);
  sundayOfCurrentWeek.setDate(today.getDate() - dayOfWeek);
  sundayOfCurrentWeek.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(sundayOfCurrentWeek);
    d.setDate(sundayOfCurrentWeek.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const entriesForDay = history.filter(h => h.date === dateStr);
    const entry = entriesForDay.length > 0 ? entriesForDay[entriesForDay.length - 1] : null;

    return {
      name: daysLabels[i],
      date: dateStr,
      entry
    };
  });

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
          <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
          Weekly Food Hunt
        </h3>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="text-[10px] font-black text-orange-600 hover:bg-orange-50 uppercase tracking-[0.2em] px-5 py-2.5 bg-white border border-orange-200 rounded-full transition-all disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Habits'}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">{day.name}</span>
            <div className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all ${day.entry
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-slate-50 text-slate-300'
              }`}>
              {day.entry ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              ) : (
                <span className="text-[10px] font-black">{day.date.split('-')[2]}</span>
              )}
            </div>
            {day.entry && (
              <p className="text-[9px] mt-2 font-black text-orange-700 text-center truncate w-full px-1 uppercase tracking-tight">
                {day.entry.foodType}
              </p>
            )}
          </div>
        ))}
      </div>

      {analysis && (
        <div className="p-8 bg-[#fffaf5] rounded-[2rem] animate-in fade-in slide-in-from-top-4 duration-500 border border-orange-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-widest">Habit Report</h4>
          </div>
          <div className="whitespace-pre-wrap text-sm text-orange-950 font-medium leading-relaxed space-y-1">
            {analysis}
          </div>
          <button
            onClick={() => setAnalysis(null)}
            className="mt-6 text-[10px] font-black text-orange-400 uppercase tracking-widest hover:text-orange-600 transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            Dismiss Report
          </button>
        </div>
      )}
    </div>
  );
};

export default WeeklyFoodHunt;