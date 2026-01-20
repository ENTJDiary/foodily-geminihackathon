import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserPostCarousel from '../components/landing/UserPostCarousel';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import EmailSignup from '../components/landing/EmailSignup';
import FAQSection from '../components/landing/FAQSection';
import Footer from '../components/layout/Footer';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  // Dummy user posts data
  const userPosts = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a0b3b1e1c7e6?auto=format&fit=crop&w=800&q=80',
      dishName: 'Best Gilerrr',
      userName: 'Local Explorer',
      likes: 12
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
      dishName: 'Margherita Heaven',
      userName: 'Pizza Lover',
      likes: 24
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      dishName: 'Truffle Paradise',
      userName: 'Foodie Explorer',
      likes: 18
    }
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-white">

      {/* ================= L1: HERO SECTION ================= */}
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

      {/* ================= USER POSTS SECTION (3 Squares) ================= */}
      <section className="w-full py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">
              Community Favorites
            </h2>
            <p className="text-xl text-slate-600 font-medium">
              Discover what food lovers are sharing
            </p>
          </div>

          {/* User Posts Carousel */}
          <UserPostCarousel posts={userPosts} />
        </div>
      </section>

      {/* ================= F1: FOOD HUNTER ================= */}
      <FeatureShowcase
        title="Food Hunter"
        description="Search for what you're craving, not just keywords. Our AI understands your taste preferences, mood, and specific cravings to find the perfect dish for you."
        screenshotUrl="C:/Users/giano/.gemini/antigravity/brain/7eb46fb2-3751-4ba8-ac1a-1b602478355d/food_hunter_preview_1768867342815.png"
        route="/FoodHunter"
        reverse={false}
      />

      {/* ================= F2: FOOD GACHA ================= */}
      <FeatureShowcase
        title="Food Gacha"
        description="Feeling adventurous? Spin the Gourmet Slot and let fate decide your next meal. Discover new cuisines and hidden gems with every spin."
        screenshotUrl="C:/Users/giano/.gemini/antigravity/brain/7eb46fb2-3751-4ba8-ac1a-1b602478355d/food_gacha_preview_1768867364961.png"
        route="/FoodGatcha"
        reverse={true}
      />

      {/* ================= F3: CONCIERGE ================= */}
      <FeatureShowcase
        title="Concierge"
        description="Chat with our AI food concierge for personalized recommendations. Tell us your preferences, budget, and location—we'll find the perfect spot for you."
        screenshotUrl="C:/Users/giano/.gemini/antigravity/brain/7eb46fb2-3751-4ba8-ac1a-1b602478355d/concierge_preview_1768867386219.png"
        route="/Concierge"
        reverse={false}
      />

      {/* ================= JOIN NOW (Email Signup) ================= */}
      <EmailSignup />

      {/* ================= FAQ SECTION ================= */}
      <FAQSection />

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
};

export default Landing;
