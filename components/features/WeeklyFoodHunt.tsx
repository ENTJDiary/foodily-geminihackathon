import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { analyzeWeeklyHabits } from '../../services/geminiService';
import { HistoryEntry } from '../../types';
import {
  subscribeFoodLogs,
  updateFoodLog,
  createFoodLog,
  foodLogToHistoryEntry
} from '../../services/foodLogsService';
import {
  saveHabitAnalysis,
  parseAnalysisText
} from '../../services/habitAnalysisService';
import DailyLogModal from './DailyLogModal';
import HabitReportSection from './HabitReportSection';

// Helper functions for local date handling
const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 for Sunday
  d.setDate(d.getDate() - day);
  return d;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDayName = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
};

const WeeklyFoodHunt: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentDay, setCurrentDay] = useState(new Date());
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HistoryEntry | null>(null);

  // Subscribe to weekly food logs from Firestore
  useEffect(() => {
    if (!currentUser) return;

    // Calculate current week's date range
    const today = new Date();
    const start = getStartOfWeek(today); // Sunday
    const weekDates = Array.from({ length: 7 }, (_, i) => addDays(start, i));

    // Format dates for query (YYYY-MM-DD)
    const startDateStr = toLocalDateString(start);
    const endDateStr = toLocalDateString(addDays(start, 6));

    // Correctly call subscribe with callback as 2nd arg, then dates
    const unsubscribe = subscribeFoodLogs(
      currentUser.uid,
      (logs) => {
        // Convert FoodLog[] to HistoryEntry[]
        const historyEntries = logs.map(foodLogToHistoryEntry);
        setHistory(historyEntries);
      },
      startDateStr,
      endDateStr
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleAnalyze = async () => {
    if (!currentUser) return;
    if (history.length === 0) {
      alert("Start searching for food to populate your weekly hunt!");
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeWeeklyHabits(history);
      setAnalysis(result);

      // Parse and save the analysis to Firestore
      const parsed = parseAnalysisText(result);

      const today = new Date();
      const start = getStartOfWeek(today); // Sunday
      const startDate = toLocalDateString(start);
      const endDate = toLocalDateString(addDays(start, 6));

      await saveHabitAnalysis(currentUser.uid, {
        analysisText: result,
        summaryPoints: parsed.summaryPoints,
        nextStep: parsed.nextStep,
        dateRangeStart: startDate,
        dateRangeEnd: endDate,
        totalLogsAnalyzed: history.length,
      });

      console.log('✅ Habit analysis saved to Firestore');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntry = (entry: HistoryEntry | null, dateStr?: string) => {
    if (entry) {
      setEditingEntry(entry);
    } else if (dateStr) {
      // Create a template for a new entry
      setEditingEntry({
        id: '', // Empty ID signifies a new entry
        date: dateStr,
        cuisine: '',
        foodType: '',
        restaurantName: '',
        logs: [],
        timestamp: Date.now()
      });
    }
  };

  const handleSaveEntry = async (updates: Partial<HistoryEntry>) => {
    if (!editingEntry || !currentUser) return;

    try {
      if (editingEntry.id) {
        // Update existing entry
        await updateFoodLog(currentUser.uid, editingEntry.id, {
          restaurantName: updates.restaurantName,
          logs: updates.logs,
          foodType: updates.foodType,
          mealType: updates.mealType,
        });
      } else {
        // Create new entry
        await createFoodLog(currentUser.uid, {
          date: editingEntry.date,
          cuisine: updates.cuisine || 'Manual',
          foodType: updates.foodType || '',
          mealType: updates.mealType || 'Breakfast',
          restaurantName: updates.restaurantName || '',
          logs: updates.logs || []
        });
      }
      setEditingEntry(null);
    } catch (error) {
      console.error('Error saving food log:', error);
      alert('Failed to save food log. Please try again.');
    }
  };

  const daysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startOfCurrentWeek = getStartOfWeek(new Date());

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(startOfCurrentWeek, i);
    const dateStr = toLocalDateString(d);

    const entriesForDay = history.filter(h => h.date === dateStr);

    // Sort entries: Breakfast > Lunch > Dinner > Snack > Others
    const mealOrder = { 'Breakfast': 1, 'Lunch': 2, 'Dinner': 3, 'Snack': 4 };
    const sortedEntries = [...entriesForDay].sort((a, b) => {
      const orderA = mealOrder[a.mealType as keyof typeof mealOrder] || 99;
      const orderB = mealOrder[b.mealType as keyof typeof mealOrder] || 99;
      return orderA - orderB;
    });

    return {
      name: daysLabels[i],
      date: dateStr,
      entries: sortedEntries
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
          disabled={loading || !currentUser}
          className="text-[10px] font-black text-orange-600 hover:bg-orange-50 uppercase tracking-[0.2em] px-5 py-2.5 bg-white border border-orange-200 rounded-full transition-all disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Habits'}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day, i) => (
          <div key={i} className="flex flex-col items-center group/day">
            <span className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">{day.name}</span>
            <div className={`relative w-full aspect-square rounded-2xl flex flex-col transition-all overflow-hidden border border-transparent hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100 ${day.entries.length > 0
              ? 'bg-transparent'
              : 'bg-slate-50 items-center justify-center text-slate-300'
              }`}>
              {day.entries.length > 0 ? (
                <div className="flex flex-col w-full h-full">
                  {day.entries.map((entry, idx) => (
                    <button
                      key={entry.id || idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEntry(entry);
                      }}
                      className="flex-1 w-full flex flex-col items-center justify-center bg-orange-600 text-white first:pt-4 last:pb-4 hover:bg-orange-500 transition-colors relative group/entry border-b border-orange-500/50 last:border-0 min-h-0"
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider opacity-90">{entry.mealType || 'Meal'}</span>
                      <span className="text-[8px] font-bold line-clamp-1 text-center w-full px-2 opacity-75 group-hover/entry:opacity-100 transition-opacity">{entry.foodType}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] font-black">{day.date.split('-')[2]}</span>
              )}

              {/* Hover Add Icon for empty days or quick access */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditEntry(null, day.date);
                }}
                className={`absolute bottom-1 right-1 w-[22px] h-[22px] bg-white text-orange-600 rounded-lg flex items-center justify-center transition-all shadow-sm hover:scale-110 active:scale-95 z-20 opacity-0 group-hover/day:opacity-100`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {analysis && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <HabitReportSection analysis={analysis} onDismiss={() => setAnalysis(null)} />
        </div>
      )}

      {editingEntry && (
        <DailyLogModal
          isOpen={true}
          entry={editingEntry}
          currentDateStr={editingEntry.date}
          onClose={() => setEditingEntry(null)}
          onSave={handleSaveEntry}
          dayEntries={history.filter(h => h.date === editingEntry.date).sort((a, b) => {
            const mealOrder = { 'Breakfast': 1, 'Lunch': 2, 'Dinner': 3, 'Snack': 4 };
            const orderA = mealOrder[a.mealType as keyof typeof mealOrder] || 99;
            const orderB = mealOrder[b.mealType as keyof typeof mealOrder] || 99;
            return orderA - orderB;
          })}
          onSelectEntry={(entry) => setEditingEntry(entry)}
          onAddNew={() => {
            const dateStr = editingEntry.date;
            setEditingEntry({
              id: '', // Empty ID signifies a new entry
              date: dateStr,
              cuisine: '',
              foodType: '',
              mealType: 'Breakfast',
              restaurantName: '',
              logs: [],
              timestamp: Date.now()
            });
          }}
        />
      )}
    </div>
  );
};

export default WeeklyFoodHunt;