import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-inter">
      {/* Top Fold: Hero Section */}
      <section className="relative h-[85vh] flex flex-col items-center justify-center px-6 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-400 rounded-full blur-[120px]"></div>
        </div>

        <div className="z-10 text-center max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-100">
              F
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-orange-600">Food.ily</h1>
          </div>

          <h2 className="text-6xl md:text-8xl font-extrabold tracking-tight text-slate-900 leading-[0.95]">
            Eat what you <span className="text-orange-600">crave</span>, <br />
            not just what's near.
          </h2>

          <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            The premium discovery engine for your next favorite dish. Powered by Gemini AI for hyper-personal recommendations.
          </p>

          <div className="pt-8 space-y-4">
            <button
              onClick={() => navigate('/signup')}
              className="group relative bg-slate-900 hover:bg-orange-600 text-white px-12 py-6 rounded-2xl font-black text-lg uppercase tracking-widest transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-4 mx-auto"
            >
              Start Exploring
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-orange-500/50 hover:scale-105 active:scale-95"
              >
                Sign Up
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 border-2 border-slate-200"
              >
                Login
              </button>
            </div>
          </div>
        </div>

        {/* Floating Accents */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Content Section: Features */}
      <section className="py-32 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-16">
        <div className="space-y-6">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-100">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">AI Search</h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            Don't just search for "Pizza". Search for "the thinnest crust sourdough Neapolitan with spicy honey". Our AI understands your specific cravings.
          </p>
        </div>

        <div className="space-y-6">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-100">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Food Assistant</h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            Indecisive? Spin the Gourmet Slot or chat with our AI concierge to analyze your weekly habits and suggest your next culinary adventure.
          </p>
        </div>

        <div className="space-y-6">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-100">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 20c4.478 0 8.268-2.943 9.542-7" /></svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Local Ledger</h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            A community-driven database of the best dishes. Add photos, ratings, and descriptions to help fellow explorers find hidden gems.
          </p>
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};


export default Landing;
