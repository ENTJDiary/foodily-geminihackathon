
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { expandSlotOptions } from '../../services/geminiService';

interface FoodCombination {
  id: string;
  cuisine: string;
  food: string;
  isCustom: boolean;
}

const DEFAULT_COMBINATIONS: FoodCombination[] = [
  { id: '1', cuisine: 'Korean', food: 'Bibimbap', isCustom: false },
  { id: '2', cuisine: 'Korean', food: 'Fried Chicken', isCustom: false },
  { id: '3', cuisine: 'Korean', food: 'Bulgogi', isCustom: false },
  { id: '4', cuisine: 'Japanese', food: 'Sushi', isCustom: false },
  { id: '5', cuisine: 'Japanese', food: 'Ramen', isCustom: false },
  { id: '6', cuisine: 'Japanese', food: 'Takoyaki', isCustom: false },
  { id: '7', cuisine: 'Malaysian', food: 'Nasi Lemak', isCustom: false },
  { id: '8', cuisine: 'Italian', food: 'Pizza', isCustom: false },
  { id: '9', cuisine: 'Italian', food: 'Pasta', isCustom: false },
  { id: '10', cuisine: 'Mexican', food: 'Tacos', isCustom: false },
  { id: '11', cuisine: 'Mexican', food: 'Burritos', isCustom: false },
  { id: '12', cuisine: 'Chinese', food: 'Dim Sum', isCustom: false },
  { id: '13', cuisine: 'Thai', food: 'Pad Thai', isCustom: false },
  { id: '14', cuisine: 'Indian', food: 'Biryani', isCustom: false },
  { id: '15', cuisine: 'Vietnamese', food: 'Pho', isCustom: false },
  { id: '16', cuisine: 'American', food: 'Burgers', isCustom: false },
  { id: '17', cuisine: 'French', food: 'Crepes', isCustom: false },
  { id: '18', cuisine: 'Middle Eastern', food: 'Shawarma', isCustom: false },
  { id: '19', cuisine: 'Greek', food: 'Gyro', isCustom: false },
  { id: '20', cuisine: 'Spanish', food: 'Paella', isCustom: false },
  { id: '21', cuisine: 'Indonesian', food: 'Nasi Goreng', isCustom: false },
];

interface FoodRandomizerProps {
  onSelection: (cuisine: string, foodType: string, lockedCuisine: boolean, lockedFood: boolean) => void;
}

const FoodRandomizer: React.FC<FoodRandomizerProps> = ({ onSelection }) => {
  const [combinations, setCombinations] = useState<FoodCombination[]>(DEFAULT_COMBINATIONS);
  const [cuisine, setCuisine] = useState('');
  const [foodType, setFoodType] = useState('');

  const [dynamicCuisines, setDynamicCuisines] = useState<string[]>([]);
  const [dynamicFoods, setDynamicFoods] = useState<string[]>([]);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isLoadingEnhanced, setIsLoadingEnhanced] = useState(false);

  const [isRollingCuisine, setIsRollingCuisine] = useState(false);
  const [isRollingFood, setIsRollingFood] = useState(false);
  const [lockedCuisine, setLockedCuisine] = useState(false);
  const [lockedFood, setLockedFood] = useState(false);

  // Debounce timer refs
  const cuisineDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const foodDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCuisine, setNewCuisine] = useState('');
  const [newFood, setNewFood] = useState('');

  const uniqueCuisines = useMemo(() => Array.from(new Set(combinations.map(c => c.cuisine))).sort(), [combinations]);
  const uniqueFoods = useMemo(() => Array.from(new Set(combinations.map(c => c.food))).sort(), [combinations]);
  const userAddedItems = useMemo(() => combinations.filter(c => c.isCustom), [combinations]);

  // Optimistic UI + Background Enhancement when one is locked
  useEffect(() => {
    const expand = async () => {
      if (lockedCuisine && !lockedFood) {
        // Optimistic: Show default related foods immediately
        const defaultRelated = combinations.filter(c => c.cuisine === cuisine).map(c => c.food);
        if (defaultRelated.length > 0) {
          setDynamicFoods(defaultRelated);
        }

        // Background: Fetch enhanced AI options
        setIsLoadingEnhanced(true);
        const options = await expandSlotOptions('food', cuisine, 'cuisine');
        if (options.length > 0) {
          setDynamicFoods(options);
        }
        setIsLoadingEnhanced(false);
      } else if (!lockedCuisine && lockedFood) {
        // Optimistic: Show default related cuisines immediately
        const defaultRelated = combinations.filter(c => c.food === foodType).map(c => c.cuisine);
        if (defaultRelated.length > 0) {
          setDynamicCuisines(defaultRelated);
        }

        // Background: Fetch enhanced AI options
        setIsLoadingEnhanced(true);
        const options = await expandSlotOptions('cuisine', foodType, 'food');
        if (options.length > 0) {
          setDynamicCuisines(options);
        }
        setIsLoadingEnhanced(false);
      } else if (!lockedCuisine && !lockedFood) {
        setDynamicCuisines([]);
        setDynamicFoods([]);
      }
    };
    expand();
  }, [lockedCuisine, lockedFood, cuisine, foodType, combinations]); // Dependencies include values needed for optimistic UI

  // Set initial values
  useEffect(() => {
    if (!cuisine && uniqueCuisines.length > 0) setCuisine(uniqueCuisines[0]);
    if (!foodType && uniqueFoods.length > 0) setFoodType(uniqueFoods[0]);
  }, [uniqueCuisines, uniqueFoods]);

  const availableCuisines = useMemo(() => {
    if (dynamicCuisines.length > 0) return dynamicCuisines;
    if (lockedFood) {
      const related = combinations.filter(c => c.food === foodType).map(c => c.cuisine);
      return related.length > 0 ? related : uniqueCuisines;
    }
    return uniqueCuisines;
  }, [lockedFood, foodType, combinations, uniqueCuisines, dynamicCuisines]);

  const availableFoods = useMemo(() => {
    if (dynamicFoods.length > 0) return dynamicFoods;
    if (lockedCuisine) {
      const related = combinations.filter(c => c.cuisine === cuisine).map(c => c.food);
      return related.length > 0 ? related : uniqueFoods;
    }
    return uniqueFoods;
  }, [lockedCuisine, cuisine, combinations, uniqueFoods, dynamicFoods]);

  useEffect(() => {
    let timer: any;
    if (isRollingCuisine) {
      timer = setInterval(() => {
        if (availableCuisines.length > 0) {
          setCuisine(availableCuisines[Math.floor(Math.random() * availableCuisines.length)]);
        }
      }, 80);
    }
    return () => clearInterval(timer);
  }, [isRollingCuisine, availableCuisines]);

  useEffect(() => {
    let timer: any;
    if (isRollingFood) {
      timer = setInterval(() => {
        if (availableFoods.length > 0) {
          setFoodType(availableFoods[Math.floor(Math.random() * availableFoods.length)]);
        }
      }, 80);
    }
    return () => clearInterval(timer);
  }, [isRollingFood, availableFoods]);

  // Debounced lock toggle handlers (300ms debounce)
  const handleToggleCuisine = useCallback(() => {
    if (cuisineDebounceTimer.current) {
      clearTimeout(cuisineDebounceTimer.current);
    }

    cuisineDebounceTimer.current = setTimeout(() => {
      setLockedCuisine(prev => !prev);
    }, 300);
  }, []);

  const handleToggleFood = useCallback(() => {
    if (foodDebounceTimer.current) {
      clearTimeout(foodDebounceTimer.current);
    }

    foodDebounceTimer.current = setTimeout(() => {
      setLockedFood(prev => !prev);
    }, 300);
  }, []);

  const handleRoll = () => {
    if (!lockedCuisine) setIsRollingCuisine(true);
    if (!lockedFood) setIsRollingFood(true);

    setTimeout(() => {
      if (!lockedCuisine) setIsRollingCuisine(false);
      if (!lockedFood) setIsRollingFood(false);
    }, 1200);
  };

  const handleFinalize = () => {
    onSelection(cuisine, foodType, lockedCuisine, lockedFood);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCuisine || !newFood) return;
    const newItem: FoodCombination = {
      id: Math.random().toString(36).substr(2, 9),
      cuisine: newCuisine,
      food: newFood,
      isCustom: true
    };
    setCombinations(prev => [...prev, newItem]);
    setNewCuisine('');
    setNewFood('');
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-orange-50 space-y-10 relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.3em] flex items-center gap-2">
            The Gourmet Slot
            {isLoadingEnhanced && (
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[8px] animate-pulse">Enhancing...</span>
            )}
            {!isLoadingEnhanced && (dynamicCuisines.length > 0 || dynamicFoods.length > 0) && (
              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[8px]">AI Enhanced</span>
            )}
          </h4>
          <p className="text-slate-400 font-medium text-sm">Indecisive? Let the wheel choose your next meal.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Add
        </button>
      </div>

      {/* CUSTOM ADD MODAL - Content truncated for brevity, assuming same as before */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-orange-50 flex flex-col">
            <div className="p-8 border-b border-orange-50 flex justify-between items-center bg-white">
              <h5 className="font-black text-slate-900 uppercase tracking-widest text-sm">Custom Preferences</h5>
              <button onClick={() => setShowAddModal(false)} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-colors">Close</button>
            </div>
            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
              <form onSubmit={handleAddCustom} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cuisine</label>
                    <input type="text" value={newCuisine} onChange={(e) => setNewCuisine(e.target.value)} placeholder="e.g. Brazilian" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 font-bold text-sm outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Food Item</label>
                    <input type="text" value={newFood} onChange={(e) => setNewFood(e.target.value)} placeholder="e.g. Moqueca" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 font-bold text-sm outline-none" required />
                  </div>
                </div>
                <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-md hover:bg-orange-700 active:scale-[0.98] transition-all">Add to Pool</button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Cuisine Bracket */}
        <div className="space-y-4">
          <div className={`relative h-32 bg-slate-50 rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all duration-300 ${lockedCuisine ? 'border-orange-500 bg-white shadow-md scale-[1.02]' : 'border-transparent'}`}>
            {isRollingCuisine ? (
              <span className="text-xl font-black transition-all text-center px-4 uppercase tracking-tight blur-sm opacity-50 text-slate-900">
                {cuisine}
              </span>
            ) : (
              <span className="text-xl font-black transition-all text-center px-4 uppercase tracking-tight text-slate-900">
                {cuisine}
              </span>
            )}
            {lockedCuisine && <div className="absolute top-3 right-3"><div className="w-2 h-2 bg-orange-500 rounded-full"></div></div>}
          </div>
          <button
            onClick={handleToggleCuisine}
            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${lockedCuisine ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-600'}`}
          >
            {lockedCuisine ? 'Unlock' : 'Lock'}
          </button>
        </div>

        {/* Food Type Bracket */}
        <div className="space-y-4">
          <div className={`relative h-32 bg-slate-50 rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all duration-300 ${lockedFood ? 'border-orange-500 bg-white shadow-md scale-[1.02]' : 'border-transparent'}`}>
            {isRollingFood ? (
              <span className="text-xl font-black transition-all text-center px-4 uppercase tracking-tight blur-sm opacity-50 text-slate-900">
                {foodType}
              </span>
            ) : (
              <span className="text-xl font-black transition-all text-center px-4 uppercase tracking-tight text-slate-900">
                {foodType}
              </span>
            )}
            {lockedFood && <div className="absolute top-3 right-3"><div className="w-2 h-2 bg-orange-500 rounded-full"></div></div>}
          </div>
          <button
            onClick={handleToggleFood}
            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${lockedFood ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-600'}`}
          >
            {lockedFood ? 'Unlock' : 'Lock'}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleRoll}
          disabled={isRollingCuisine || isRollingFood || (lockedCuisine && lockedFood)}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl transition-all shadow-md disabled:opacity-20 flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Spin Wheel
        </button>

        {(lockedCuisine || lockedFood) && (
          <button
            onClick={handleFinalize}
            disabled={isRollingCuisine || isRollingFood}
            className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 font-black py-5 rounded-2xl transition-all border border-orange-100 uppercase text-xs tracking-widest animate-in fade-in slide-in-from-right-4 disabled:opacity-50"
          >
            Show Recommendations
          </button>
        )}
      </div>
    </div>
  );
};

export default FoodRandomizer;
