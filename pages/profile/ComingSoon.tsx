import React from 'react';

interface ComingSoonProps {
    title: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title }) => {
    return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">{title}</h3>
                <p className="text-sm text-slate-400 font-medium">Coming Soon</p>
            </div>
        </div>
    );
};

export default ComingSoon;
