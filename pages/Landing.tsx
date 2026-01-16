import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
      <div className="min-h-screen flex flex-col overflow-x-hidden bg-white">

        {/* ================= HERO ================= */}
        <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
          {/* Background image */}
          <img
              src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1950&q=80"
              alt="Food background"
              className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Gradient mask */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-orange-900/30 to-black/80" />

          {/* Radial vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_80%)]" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3">
              <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-300">
                F
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-orange-500">Food.ily</h1>
            </div>

            {/* Headline */}
            <h2 className="text-[clamp(3rem,5vw,6rem)] font-extrabold text-white leading-[1.05]">
              Eat what you <span className="text-orange-500">crave</span>, <br />
              not just what's near.
            </h2>

            {/* Subtitle */}
            <p className="text-[clamp(1.25rem,1.5vw,1.75rem)] text-orange-100 font-medium max-w-2xl mx-auto leading-relaxed">
              Discover the best dishes and restaurants personalized for you. Powered by AI for hyper-personal recommendations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6">
              <button
                  onClick={() => navigate('/signup')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 rounded-2xl font-black text-lg uppercase tracking-wide transition-transform duration-300 hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-2"
              >
                Start Exploring
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>

              <button
                  onClick={() => navigate('/login')}
                  className="bg-white hover:bg-slate-100 text-slate-900 px-10 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 border-2 border-orange-400"
              >
                Login
              </button>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce z-10">
            <svg className="w-6 h-6 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              title: 'AI Search',
              text: 'Search for cravings, not keywords. Our AI understands your taste, texture, mood, and flavor.',
              icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
            },
            {
              title: 'Food Assistant',
              text: 'Spin the Gourmet Slot or chat with our AI concierge to find your weekly favorites.',
              icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
            },
            {
              title: 'Local Ledger',
              text: 'Community-driven database with photos, ratings, and descriptions to help explorers find hidden gems.',
              icon: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 20c4.478 0 8.268-2.943 9.542-7',
            },
          ].map((feature) => (
              <div key={feature.title} className="space-y-4 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-100 mx-auto">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.text}</p>
              </div>
          ))}
        </section>

        {/* ================= FOOTER ================= */}
        <Footer />
      </div>
  );
};

export default Landing;
