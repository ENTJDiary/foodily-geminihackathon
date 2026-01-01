import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="mt-auto border-t border-slate-100 h-[15vh] bg-white flex items-center px-6">
            <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 font-black text-sm">F</div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Food.ily</span>
                </div>

                <div className="flex items-center gap-12">
                    <a href="#" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-orange-600 transition-colors">ToS</a>
                    <a href="#" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-orange-600 transition-colors">Privacy</a>
                    <a href="#" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-orange-600 transition-colors">Cookies</a>
                </div>

                <div className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">
                    &copy; {new Date().getFullYear()} Gourmet Insights Inc.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
