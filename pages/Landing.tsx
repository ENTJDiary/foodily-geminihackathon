import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserPostCarousel from '../components/landing/UserPostCarousel';
import UserPostCard from '../components/landing/UserPostCard';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import EmailSignup from '../components/landing/EmailSignup';
import FAQSection from '../components/landing/FAQSection';
import Footer from '../components/layout/Footer';

// Import preview images
import foodHunterPreview from '../components/landing/image/food-hunter-recolored.png';
import foodGachaIcon from '../components/landing/image/food-gacha-icon.png';
import conciergeIcon from '../components/landing/image/concierge-icon-minimal.png';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  // Dummy user posts data (Expanded to 5 to match VivaChat layout)
  const userPosts = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a0b3b1e1c7e6?auto=format&fit=crop&w=800&q=80',
      dishName: 'Best Gilerrr',
      userName: 'Local Explorer',
      likes: 12
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      dishName: 'Kebab King',
      userName: 'Meat Lover',
      likes: 45
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
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1626082927389-d31c6d30a86c?auto=format&fit=crop&w=800&q=80',
      dishName: 'Choco Bliss',
      userName: 'Sweet Tooth',
      likes: 32
    }
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-white">

      {/* ================= L1: HERO SECTION ================= */}
      {/* ================= L1: HERO SECTION ================= */}
      <section className="relative w-full min-h-screen flex items-center bg-zinc-50 overflow-hidden">

        {/* Background blobs for premium feel */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-100/40 rounded-full blur-[120px]" />

        <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10 pt-20 lg:pt-0">

          {/* LEFT COLUMN: Text Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            {/* Logo / Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="text-sm font-semibold text-slate-600 tracking-wide">World's #1 AI Food Suggestor</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black text-slate-900 leading-[1.05] tracking-tight">
              The World's Best <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400"> AI Food Companion</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-slate-500 leading-relaxed max-w-xl font-medium">
              Your ultimate personal food suggestor. Discover hyper-personalized restaurant recommendations and dishes tailored exactly to your cravings using advanced AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
              >
                Try Out
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                Learn More
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>

            {/* Stats/Social Proof (optional enhancement to match VivaChat vibe) */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`, backgroundSize: 'cover' }} />
                ))}
              </div>
              <div>
                <p className="font-bold text-slate-900">10k+ Foodies</p>
                <p className="text-sm text-slate-500">Joined this week</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Visuals (Grid Layout like VivaChat) */}
          <div className="relative h-[800px] w-full hidden lg:block overflow-hidden mask-image-gradient">

            {/* Grid Container */}
            <div className="grid grid-cols-2 gap-6 h-full absolute inset-0 transform scale-90 origin-top">

              {/* Column 1 (Left-ish): 2 Cards (Middle & Bottom aligned relative to Col 2) */}
              <div className="flex flex-col gap-6 justify-center pt-20">
                <UserPostCard {...userPosts[0]} className="animate-[float_6s_ease-in-out_infinite]" />
                <UserPostCard {...userPosts[1]} className="animate-[float_7s_ease-in-out_infinite_1s]" />
              </div>

              {/* Column 2 (Right-ish): 3 Cards (Top, Center-Main, Bottom) */}
              <div className="flex flex-col gap-6 -mt-20">
                {/* Top Partial Card */}
                <div className="opacity-60 scale-90 blur-[1px]">
                  <UserPostCard {...userPosts[2]} />
                </div>

                {/* Main Highlighted Card (The "Circled" one) */}
                <div className="relative z-10 scale-110 -ml-8 shadow-2xl animate-[float_5s_ease-in-out_infinite_0.5s]">
                  <UserPostCard {...userPosts[3]} className="border-4 border-white" />
                  {/* Floating 'Ask' button simulation from ref */}
                  <div className="absolute bottom-6 right-6 bg-slate-900 text-white p-3 rounded-full shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                {/* Bottom Partial Card */}
                <div className="opacity-60 scale-90 blur-[1px]">
                  <UserPostCard {...userPosts[4]} />
                </div>
              </div>

            </div>

            {/* Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-3xl -z-10" />
          </div>

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
        screenshotUrl={foodHunterPreview}
        route="/signup"
        reverse={false}
        ctaText="Explore More"
      />

      {/* ================= F2: FOOD GACHA ================= */}
      <FeatureShowcase
        title="Food Gacha"
        description="Feeling adventurous? Spin the Gourmet Slot and let fate decide your next meal. Discover new cuisines and hidden gems with every spin."
        screenshotUrl={foodGachaIcon}
        route="/signup"
        reverse={true}
        scale={0.85}
        ctaText="Spin it Now"
      />

      {/* ================= F3: CONCIERGE ================= */}
      <FeatureShowcase
        title="Concierge"
        description="Chat with our AI food concierge for personalized recommendations. Tell us your preferences, budget, and location—we'll find the perfect spot for you."
        screenshotUrl={conciergeIcon}
        route="/signup"
        reverse={false}
        scale={0.85}
        ctaText="Learn More"
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
