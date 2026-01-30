import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    doc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../src/firebase/config';

const HABIT_ANALYSIS_COLLECTION = 'habitAnalysis';

/**
 * Interface for habit analysis data
 */
export interface HabitAnalysis {
    analysisId: string;             // Auto-generated document ID
    userId: string;                 // Reference to users/{uid}
    analysisText: string;           // Full AI-generated analysis text
    summaryPoints: {                // Parsed summary points
        category: string;
        description: string;
    }[];
    nextStep: string;               // Actionable next step recommendation
    dateRangeStart: string;         // Start date of analyzed period (YYYY-MM-DD)
    dateRangeEnd: string;           // End date of analyzed period (YYYY-MM-DD)
    totalLogsAnalyzed: number;      // Number of food logs included in analysis
    createdAt: Timestamp;           // When the analysis was generated
}

/**
 * Input type for saving habit analysis
 */
export interface SaveHabitAnalysisInput {
    analysisText: string;
    summaryPoints?: {
        category: string;
        description: string;
    }[];
    nextStep?: string;
    dateRangeStart: string;
    dateRangeEnd: string;
    totalLogsAnalyzed: number;
}

/**
 * Save a new habit analysis
 */
export const saveHabitAnalysis = async (
    userId: string,
    analysisData: SaveHabitAnalysisInput
): Promise<HabitAnalysis> => {
    try {
        const habitAnalysisRef = collection(db, HABIT_ANALYSIS_COLLECTION);

        const newAnalysis = {
            userId,
            analysisText: analysisData.analysisText,
            summaryPoints: analysisData.summaryPoints || [],
            nextStep: analysisData.nextStep || '',
            dateRangeStart: analysisData.dateRangeStart,
            dateRangeEnd: analysisData.dateRangeEnd,
            totalLogsAnalyzed: analysisData.totalLogsAnalyzed,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(habitAnalysisRef, newAnalysis);

        console.log('✅ Habit analysis saved successfully:', docRef.id);

        return {
            analysisId: docRef.id,
            ...newAnalysis,
            createdAt: Timestamp.now(),
        } as HabitAnalysis;
    } catch (error) {
        console.error('❌ Error saving habit analysis:', error);
        throw new Error('Failed to save habit analysis');
    }
};

/**
 * Get the most recent habit analysis for a user
 */
export const getLatestAnalysis = async (
    userId: string
): Promise<HabitAnalysis | null> => {
    try {
        const habitAnalysisRef = collection(db, HABIT_ANALYSIS_COLLECTION);
        const q = query(
            habitAnalysisRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            analysisId: doc.id,
            ...doc.data(),
        } as HabitAnalysis;
    } catch (error) {
        console.error('❌ Error fetching latest analysis:', error);
        return null;
    }
};

/**
 * Get analysis history for a user
 */
export const getAnalysisHistory = async (
    userId: string,
    limitCount: number = 10
): Promise<HabitAnalysis[]> => {
    try {
        const habitAnalysisRef = collection(db, HABIT_ANALYSIS_COLLECTION);
        const q = query(
            habitAnalysisRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const analyses: HabitAnalysis[] = [];

        querySnapshot.forEach((doc) => {
            analyses.push({
                analysisId: doc.id,
                ...doc.data(),
            } as HabitAnalysis);
        });

        return analyses;
    } catch (error) {
        console.error('❌ Error fetching analysis history:', error);
        return [];
    }
};

/**
 * Parse analysis text into structured format
 * This helper function extracts summary points and next steps from the raw AI text
 */
export const parseAnalysisText = (analysisText: string): {
    summaryPoints: { category: string; description: string }[];
    nextStep: string;
} => {
    const result = {
        summaryPoints: [] as { category: string; description: string }[],
        nextStep: '',
    };

    if (!analysisText) return result;

    // Split into main sections
    const summaryPart = analysisText.split('**Next Step**')[0];
    const nextStepPart = analysisText.split('**Next Step**')[1] || '';

    // Parse Summary Points
    const summaryLines = summaryPart.split('\n');
    summaryLines.forEach(line => {
        const trimmed = line.trim();
        // Look for bullet points
        if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
            // Format: "* **Category:** Description" or "* **Category**: Description"
            const match = trimmed.match(/^[\*\-]\s+(?:\*\*(.*?)\*\*|\+\+(.*?)\+\+)(.*)/);
            if (match) {
                const category = match[1] || match[2];
                let description = match[3] || '';
                description = description.replace(/^[:\-\s]+/, '').trim(); // Clean leading separators

                result.summaryPoints.push({
                    category: category.replace(':', '').trim(),
                    description: description.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\+\+(.*?)\+\+/g, '$1'),
                });
            } else {
                // Fallback for simple bullets
                result.summaryPoints.push({
                    category: 'General Observation',
                    description: trimmed.replace(/^[\*\-]\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\+\+(.*?)\+\+/g, '$1'),
                });
            }
        }
    });

    // Parse Next Step
    result.nextStep = nextStepPart.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\+\+(.*?)\+\+/g, '$1').trim();

    return result;
};
