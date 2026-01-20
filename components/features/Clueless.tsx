
import React, { useState, useEffect } from 'react';

interface CluelesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (cravingText: string) => void;
}

interface Question {
    id: number;
    question: string;
    option1: { label: string; emoji: string };
    option2: { label: string; emoji: string };
}

interface DishOption {
    name: string;
    emoji: string;
}

const initialQuestions: Question[] = [
    {
        id: 1,
        question: "What's your flavor mood?",
        option1: { label: "Sweet", emoji: "🍰" },
        option2: { label: "Savoury", emoji: "🍕" }
    },
    {
        id: 2,
        question: "How hungry are you?",
        option1: { label: "Filling", emoji: "🍔" },
        option2: { label: "Quick Bites", emoji: "🥐" }
    },
    {
        id: 3,
        question: "What's your priority?",
        option1: { label: "Healthy", emoji: "🥗" },
        option2: { label: "Flavourful", emoji: "🌶️" }
    },
    {
        id: 4,
        question: "Which direction?",
        option1: { label: "Western", emoji: "🍝" },
        option2: { label: "Oriental", emoji: "🍜" }
    },
    {
        id: 5,
        question: "Feeling adventurous?",
        option1: { label: "My Habits", emoji: "⭐" },
        option2: { label: "Something New", emoji: "✨" }
    }
];

// Fallback questions for when AI generation fails
const fallbackQuestions: Question[] = [
    {
        id: 6,
        question: "What cuisine speaks to you?",
        option1: { label: "Asian Fusion", emoji: "🍱" },
        option2: { label: "Mediterranean", emoji: "🫒" }
    },
    {
        id: 7,
        question: "How do you want it served?",
        option1: { label: "In a Bowl", emoji: "🥣" },
        option2: { label: "On a Plate", emoji: "🍽️" }
    }
];

const Clueless: React.FC<CluelesModalProps> = ({ isOpen, onClose, onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [allQuestions, setAllQuestions] = useState<Question[]>(initialQuestions);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzeStage, setAnalyzeStage] = useState<'questions' | 'dishes' | null>(null);
    const [dishOptions, setDishOptions] = useState<DishOption[]>([]);
    const [showDishSelection, setShowDishSelection] = useState(false);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setCurrentQuestion(0);
            setAnswers([]);
            setAllQuestions(initialQuestions);
            setIsAnalyzing(false);
            setAnalyzeStage(null);
            setDishOptions([]);
            setShowDishSelection(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const totalQuestions = allQuestions.length;
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;

    const handleChoice = async (choice: string) => {
        const newAnswers = [...answers, choice];
        setAnswers(newAnswers);

        // After Q5, generate Q6 & Q7
        if (currentQuestion === 4) {
            setIsAnalyzing(true);
            setAnalyzeStage('questions');

            try {
                const dynamicQuestions = await generateDynamicQuestions(newAnswers);
                setAllQuestions([...initialQuestions, ...dynamicQuestions]);
                setCurrentQuestion(currentQuestion + 1);
            } catch (error) {
                console.error("Error generating questions:", error);
                // Fallback to predefined questions
                setAllQuestions([...initialQuestions, ...fallbackQuestions]);
                setCurrentQuestion(currentQuestion + 1);
            } finally {
                setIsAnalyzing(false);
                setAnalyzeStage(null);
            }
        }
        // After Q7, generate dish options
        else if (currentQuestion === 6) {
            setIsAnalyzing(true);
            setAnalyzeStage('dishes');

            try {
                const dishes = await generateDishOptions(newAnswers);
                setDishOptions(dishes);
                setShowDishSelection(true);
            } catch (error) {
                console.error("Error generating dishes:", error);
                // Fallback to generic options
                setDishOptions([
                    { name: "Chef's Special", emoji: "👨‍🍳" },
                    { name: "House Favorite", emoji: "⭐" },
                    { name: "Local Delight", emoji: "🏠" },
                    { name: "Trending Now", emoji: "🔥" }
                ]);
                setShowDishSelection(true);
            } finally {
                setIsAnalyzing(false);
                setAnalyzeStage(null);
            }
        }
        // Continue to next question
        else if (currentQuestion < totalQuestions - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handleDishChoice = (dishName: string) => {
        onComplete(dishName);
        // Reset will happen via useEffect when modal closes
    };

    const handleGoBack = async () => {
        // Go back to question 6 and regenerate dishes
        setShowDishSelection(false);
        setCurrentQuestion(5); // Question 6 (0-indexed)
        setIsAnalyzing(true);
        setAnalyzeStage('dishes');

        try {
            const dishes = await generateDishOptions(answers);
            setDishOptions(dishes);
            setShowDishSelection(true);
        } catch (error) {
            console.error("Error regenerating dishes:", error);
            // Fallback to generic options
            setDishOptions([
                { name: "Chef's Special", emoji: "👨‍🍳" },
                { name: "House Favorite", emoji: "⭐" },
                { name: "Local Delight", emoji: "🏠" },
                { name: "Trending Now", emoji: "🔥" }
            ]);
            setShowDishSelection(true);
        } finally {
            setIsAnalyzing(false);
            setAnalyzeStage(null);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setAnswers(answers.slice(0, -1));
        }
    };

    const handleClose = () => {
        setCurrentQuestion(0);
        setAnswers([]);
        setAllQuestions(initialQuestions);
        setIsAnalyzing(false);
        setAnalyzeStage(null);
        setDishOptions([]);
        setShowDishSelection(false);
        onClose();
    };

    const generateDynamicQuestions = async (choices: string[]): Promise<Question[]> => {
        const { GoogleGenAI, Type } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `Based on these user food preferences, generate 2 follow-up questions to narrow down their craving:
    
    1. Flavor: ${choices[0]}
    2. Portion: ${choices[1]}
    3. Priority: ${choices[2]}
    4. Cuisine: ${choices[3]}
    5. Adventure: ${choices[4]}
    
    Generate 2 questions about specific cuisine types, preparation methods, or ingredients that would help identify a specific dish.
    Each question should have exactly 2 options with appropriate emojis.
    
    Return ONLY a JSON array with this structure:
    [
      {
        "question": "Question text here?",
        "option1": { "label": "First choice", "emoji": "🍕" },
        "option2": { "label": "Second choice", "emoji": "🍜" }
      },
      {
        "question": "Second question text?",
        "option1": { "label": "First choice", "emoji": "🥘" },
        "option2": { "label": "Second choice", "emoji": "🍱" }
      }
    ]`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            option1: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    emoji: { type: Type.STRING }
                                },
                                required: ["label", "emoji"]
                            },
                            option2: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    emoji: { type: Type.STRING }
                                },
                                required: ["label", "emoji"]
                            }
                        },
                        required: ["question", "option1", "option2"]
                    }
                }
            }
        });

        const parsedQuestions = JSON.parse(response.text || "[]");
        return parsedQuestions.map((q: any, idx: number) => ({
            id: 6 + idx,
            question: q.question,
            option1: q.option1,
            option2: q.option2
        }));
    };

    const generateDishOptions = async (choices: string[]): Promise<DishOption[]> => {
        const { GoogleGenAI, Type } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `Based on ALL these user preferences, suggest 4 GENERAL dish names (like "Pizza", "Spaghetti", "Tacos", "Burger" - keep it simple and broad, NOT specific variations):
    
    User preferences:
    ${choices.map((c, i) => `${i + 1}. ${c}`).join('\n')}
    
    IMPORTANT: Use general dish categories, not specific recipes. For example:
    - Use "Pizza" instead of "Italian Margherita Pizza" or "Neapolitan Pizza"
    - Use "Spaghetti" instead of "Linguine al Dente" or "Spaghetti Carbonara"
    - Use "Tacos" instead of "Street Tacos al Pastor"
    - Use "Curry" instead of "Thai Green Curry"
    
    Return ONLY a JSON array with this structure:
    [
      { "name": "Dish Name 1", "emoji": "🍕" },
      { "name": "Dish Name 2", "emoji": "🍜" },
      { "name": "Dish Name 3", "emoji": "🥗" },
      { "name": "Dish Name 4", "emoji": "🥘" }
    ]`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            emoji: { type: Type.STRING }
                        },
                        required: ["name", "emoji"]
                    }
                }
            }
        });

        return JSON.parse(response.text || '[{"name": "Something delicious", "emoji": "🍽️"}]');
    };

    // Playful bouncing animation component
    const PlayfulLoader = ({ stage }: { stage: 'questions' | 'dishes' }) => (
        <div className="py-20 flex flex-col items-center justify-center gap-8">
            {/* Bouncing emoji */}
            <div className="animate-bounce">
                <span className="text-6xl">
                    {stage === 'questions' ? '🤔' : '🍽️'}
                </span>
            </div>

            {/* Spinning loader */}
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />

            <div className="text-center">
                <p className="text-lg font-bold text-slate-800">
                    {stage === 'questions' ? 'Analyzing your preferences...' : 'Finding your perfect dishes...'}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                    {stage === 'questions' ? 'Getting more specific! 🎯' : 'Almost there! 🌟'}
                </p>
            </div>
        </div>
    );

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative animate-in slide-in-from-bottom-8 duration-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {isAnalyzing
                            ? analyzeStage === 'questions' ? 'Analyzing...' : 'Finding dishes...'
                            : showDishSelection
                                ? 'Pick your craving!'
                                : "Let's figure out what you want!"}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Only show progress bar if not in dish selection */}
                {!showDishSelection && (
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                Question {currentQuestion + 1} of {totalQuestions}
                            </span>
                            <span className="text-xs font-black text-orange-600">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isAnalyzing && analyzeStage && (
                    <PlayfulLoader stage={analyzeStage} />
                )}

                {/* Dish Selection Screen */}
                {showDishSelection && !isAnalyzing && (
                    <div className="space-y-6">
                        <p className="text-center text-slate-600 font-semibold">
                            Based on your preferences, we think you'd love:
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            {dishOptions.map((dish, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleDishChoice(dish.name)}
                                    className="group relative p-8 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-500 hover:to-green-600 border-2 border-green-300 hover:border-green-600 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 animate-in spin-in-90 duration-500"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <div className="text-center space-y-3">
                                        <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                                            {dish.emoji}
                                        </div>
                                        <p className="text-lg font-bold text-green-900 group-hover:text-white transition-colors">
                                            {dish.name}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Go Back Button */}
                        <div className="mt-8 flex flex-col items-center gap-3">
                            <p className="text-sm font-semibold text-slate-600">
                                Not satisfied?
                            </p>
                            <button
                                onClick={handleGoBack}
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                Go Back
                            </button>
                        </div>
                    </div>
                )}

                {/* Question Flow */}
                {!isAnalyzing && !showDishSelection && (
                    <>
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                                {allQuestions[currentQuestion]?.question}
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <button
                                onClick={() => handleChoice(allQuestions[currentQuestion].option1.label)}
                                className="group relative p-8 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-500 hover:to-purple-600 border-2 border-purple-300 hover:border-purple-600 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 animate-in spin-in-90 duration-500"
                            >
                                <div className="text-center space-y-3">
                                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                                        {allQuestions[currentQuestion].option1.emoji}
                                    </div>
                                    <p className="text-xl font-bold text-purple-900 group-hover:text-white transition-colors">
                                        {allQuestions[currentQuestion].option1.label}
                                    </p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleChoice(allQuestions[currentQuestion].option2.label)}
                                className="group relative p-8 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-500 hover:to-purple-600 border-2 border-purple-300 hover:border-purple-600 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 animate-in spin-in-90 duration-500 delay-100"
                            >
                                <div className="text-center space-y-3">
                                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                                        {allQuestions[currentQuestion].option2.emoji}
                                    </div>
                                    <p className="text-xl font-bold text-purple-900 group-hover:text-white transition-colors">
                                        {allQuestions[currentQuestion].option2.label}
                                    </p>
                                </div>
                            </button>
                        </div>

                        {/* Navigation */}
                        {currentQuestion > 0 && (
                            <div className="flex justify-center">
                                <button
                                    onClick={handlePrevious}
                                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Clueless;
