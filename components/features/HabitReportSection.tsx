import React, { useMemo } from 'react';

interface HabitReportSectionProps {
    analysis: string;
    onDismiss: () => void;
}

interface ParsedHabitPoint {
    category: string;
    description: string;
}

interface ParsedReport {
    summaryPoints: ParsedHabitPoint[];
    nextStep: string;
}

const HabitReportSection: React.FC<HabitReportSectionProps> = ({ analysis, onDismiss }) => {
    // Clean text helper
    const cleanText = (text: string) => {
        return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\+\+(.*?)\+\+/g, '$1');
    };

    const parsedContent = useMemo((): ParsedReport => {
        if (!analysis) return { summaryPoints: [], nextStep: '' };

        const result: ParsedReport = {
            summaryPoints: [],
            nextStep: ''
        };

        // Split into main sections
        // Expected sections: "**Summary**" and "**Next Step**"
        const summaryPart = analysis.split('**Next Step**')[0];
        const nextStepPart = analysis.split('**Next Step**')[1] || '';

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
                        description: cleanText(description)
                    });
                } else {
                    // Fallback for simple bullets
                    result.summaryPoints.push({
                        category: 'General Observation',
                        description: cleanText(trimmed.replace(/^[\*\-]\s+/, ''))
                    });
                }
            }
        });

        // Parse Next Step
        // Use the rest of the text after "**Next Step**" header
        result.nextStep = cleanText(nextStepPart).trim();

        return result;
    }, [analysis]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm border border-orange-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-orange-600 uppercase tracking-[0.2em]">Mission Debrief</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analysis Protocol v1.0</p>
                    </div>
                </div>
                <button
                    onClick={onDismiss}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-600 uppercase tracking-widest transition-colors">Dismiss</span>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pattern Recognition (Summary) */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-orange-100 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                    </div>
                    <h5 className="relative z-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        Pattern Recognition
                    </h5>

                    <div className="relative z-10 space-y-3">
                        {parsedContent.summaryPoints.length > 0 ? (
                            parsedContent.summaryPoints.map((point, i) => (
                                <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex gap-3 text-sm">
                                    <div className="mt-0.5 flex-shrink-0">
                                        {/* Dynamic Icon based on simple keyword matching or just alternating */}
                                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-0.5">{point.category}</div>
                                        <p className="text-slate-600 leading-snug font-medium text-xs">{point.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 italic">No patterns detected yet.</div>
                        )}
                    </div>
                </div>

                {/* Next Mission (Next Step) */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2rem] shadow-lg relative overflow-hidden text-white flex flex-col">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                    </div>

                    <h5 className="relative z-10 text-[10px] font-black text-green-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        Actionable Intelligence
                    </h5>

                    <div className="relative z-10 flex-1 flex flex-col justify-center">
                        {parsedContent.nextStep ? (
                            <div className="space-y-4">
                                <div className="text-2xl font-black tracking-tight leading-tight text-slate-100">
                                    " {parsedContent.nextStep} "
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-1 rounded bg-green-500/20 border border-green-500/30 text-[10px] font-bold text-green-400 uppercase">
                                        Next Objective
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500 italic">No directives available.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HabitReportSection;
