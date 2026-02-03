

import React, { useState, useRef, useEffect } from 'react';
import { searchRestaurantsByMaps } from '../services/geminiService';

import FoodRandomizer from '../components/features/FoodRandomizer';
import FoodWheel from '../components/features/FoodWheel';
import { Location, SearchResult, HistoryEntry } from '../types';
import RestaurantModal from '../components/common/RestaurantModal';
import { getAverageRating, saveSearchToHistory, getWeeklyHistory, getUserProfile } from '../services/storageService';
import { getCurrentLocation } from '../services/locationService';
import ExpertPicksSection from '../components/common/ExpertPicksSection';
import LoadingRecommendations from '../components/common/LoadingRecommendations';
import { trackRestaurantClick } from '../services/restaurantClicksService';
import { useAuth } from '../src/contexts/AuthContext';
import { autoLogFoodSearch } from '../services/foodLogsService';
import { getTasteProfile } from '../services/tasteProfileService';
import { TasteProfile } from '../src/types/auth.types';
import { generateRestaurantId } from '../utils/restaurantIdUtils';



const FoodGatcha: React.FC = () => {
  const { currentUser } = useAuth();
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ id: string; name: string; searchedDish?: string } | null>(null);
  const [currentCoords, setCurrentCoords] = useState<Location | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(getWeeklyHistory());
  const [applyFilters, setApplyFilters] = useState(false);
  const [pickedRestaurants, setPickedRestaurants] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const profile = getUserProfile();
  const hasRestrictions = profile.dietaryRestrictions.length > 0;

  useEffect(() => {
    if ((results || loadingResults) && resultsRef.current) {
      // Small timeout to ensure DOM is fully updated and layout is stable
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [results, loadingResults]);

  useEffect(() => {
    // Get location using the centralized service
    getCurrentLocation().then(location => {
      if (location) {
        setCurrentCoords(location);
      }
    });

    // Fetch taste profile
    if (currentUser) {
      getTasteProfile(currentUser.uid).then(profile => {
        setTasteProfile(profile);
        console.log('🧠 [FoodGatcha] Taste profile loaded:', profile?.dataPoints || 0, 'data points');
      }).catch(error => {
        console.error('❌ [FoodGatcha] Failed to load taste profile:', error);
      });
    }
  }, [currentUser]);

  const handleRandomSelection = async (cuisine: string, foodType: string, lockedCuisine: boolean, lockedFood: boolean) => {
    // Smart search based on lock state
    let searchTerms: string[] = [];

    if (lockedCuisine && !lockedFood) {
      // Only cuisine is locked → search by cuisine only
      searchTerms = [cuisine];
    } else if (!lockedCuisine && lockedFood) {
      // Only food is locked → search by food only
      searchTerms = [foodType];
    } else {
      // Both unlocked OR both locked → search by both
      searchTerms = [cuisine, foodType];
    }

    const query = searchTerms.filter(Boolean).join(' ');
    setLoadingResults(true);
    setResults(null);
    try {
      const prompt = `Suggest top-tier restaurants for ${query} near me.`;
      setCurrentPrompt(prompt);
      const restrictions = applyFilters ? profile.dietaryRestrictions : [];
      const response = await searchRestaurantsByMaps(prompt, currentCoords || undefined, restrictions, [], tasteProfile);
      setResults(response);

      if (currentUser) {
        autoLogFoodSearch(currentUser.uid, cuisine, foodType);
      }

      saveSearchToHistory(cuisine, foodType);
      setHistory(getWeeklyHistory());
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleWheelSelection = async (foodName: string) => {
    setLoadingResults(true);
    setResults(null);
    try {
      const prompt = `Suggest top-tier restaurants for ${foodName} near me.`;
      setCurrentPrompt(prompt);
      const restrictions = applyFilters ? profile.dietaryRestrictions : [];
      const response = await searchRestaurantsByMaps(prompt, currentCoords || undefined, restrictions, [], tasteProfile);
      setResults(response);

      if (currentUser) {
        autoLogFoodSearch(currentUser.uid, 'Wheel', foodName);
      }

      // Save to history with foodName as both cuisine and foodType
      saveSearchToHistory('Wheel', foodName);
      setHistory(getWeeklyHistory());
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleLoadMore = async () => {
    if (!results || !currentPrompt) return;

    setLoadingMore(true);
    try {
      const restrictions = applyFilters ? profile.dietaryRestrictions : [];
      const response = await searchRestaurantsByMaps(currentPrompt, currentCoords || undefined, restrictions, pickedRestaurants, tasteProfile);

      setResults(prev => prev ? {
        text: prev.text + '\n' + response.text,
        groundingChunks: [...prev.groundingChunks, ...response.groundingChunks]
      } : response);
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-12 max-w-4xl mx-auto">
      <div className="text-center space-y-4 pt-4">
        <h2 className="text-4xl md:text-5xl font-bold text-brand-black tracking-tight">
          Feeling <span className="text-brand-orange">Lucky?</span>
        </h2>
        <p className="text-brand-slate/70 font-medium text-lg max-w-xl mx-auto">
          Spin the wheel or let fate decide your next meal.
        </p>
      </div>

      <div className="space-y-12">
        <FoodRandomizer
          applyFilters={applyFilters}
          onToggleFilters={() => setApplyFilters(!applyFilters)}
          onSelection={handleRandomSelection}
        />
        <FoodWheel onSelectFood={handleWheelSelection} />
      </div>


      {loadingResults && (
        <div ref={resultsRef}>
          <LoadingRecommendations />
        </div>
      )}

      {results && (
        <div ref={resultsRef} className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
          <ExpertPicksSection
            text={results.text}
            maxInitialPicks={5}
            onRestaurantClick={(name) => {
              setSelectedRestaurant({
                id: name,
                name: name,
                searchedDish: history[history.length - 1]?.foodType
              });
              // Track restaurant click
              if (currentUser) {
                trackRestaurantClick(currentUser.uid, {
                  restaurantId: generateRestaurantId(name),
                  restaurantName: name,
                  source: 'food_gacha'
                }).catch(err => console.error('Failed to track click:', err));
              }

            }}
            onPicksExtracted={setPickedRestaurants}
            onLoadMore={handleLoadMore}
            isLoadingMore={loadingMore}
          />
        </div>
      )}

      {selectedRestaurant && (
        <RestaurantModal
          restaurantId={selectedRestaurant.id}
          restaurantName={selectedRestaurant.name}
          searchedDish={selectedRestaurant.searchedDish}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}
    </div>
  );
};

export default FoodGatcha;
