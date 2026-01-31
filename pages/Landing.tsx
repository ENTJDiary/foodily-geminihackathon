import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import EmailSignup from '../components/landing/EmailSignup';
import FAQSection from '../components/landing/FAQSection';
import Footer from '../components/layout/Footer';
import LandingNavbar from '../components/landing/LandingNavbar';
import CommunityInsights from '../components/landing/CommunityInsights';

// Import preview images
import foodHunterPreview from '../components/landing/image/food-hunter-recolored.png';
import foodGachaIcon from '../components/landing/image/food-gacha-expanded.png';
import conciergeIcon from '../components/landing/image/concierge-icon-minimal.png';
import mapImage from '../components/landing/image/Map.png';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisionVisible, setIsVisionVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);

  // Sections definition for navigation
  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'why-foodily', label: 'Why Food.ily' },
    { id: 'features', label: 'Functions' },
    { id: 'community', label: 'Community' },
    { id: 'join', label: 'Join' }
  ];

  // Handle scroll on the container
  const handleScroll = () => {
    if (containerRef.current) {
      setIsScrolled(containerRef.current.scrollTop > 20);
    }
  };



  // Intersection Observer to track active section
  useEffect(() => {
    const options = {
      root: containerRef.current,
      threshold: 0.5, // Trigger when 50% of the section is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sections.findIndex(section => section.id === entry.target.id);
          if (index !== -1) {
            setActiveSection(index);
          }
        }
      });
    }, {
      root: containerRef.current,
      threshold: 0.3, // Lower threshold because sections are taller now
    });

    const sectionElements = document.querySelectorAll('section');
    sectionElements.forEach((el) => observer.observe(el));

    // Separate observer for Vision section animation
    const visionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisionVisible(true);
        }
      });
    }, { threshold: 0.45 }); // Trigger when section is ~90% visible (user has landed)

    if (visionRef.current) {
      visionObserver.observe(visionRef.current);
    }

    return () => {
      sectionElements.forEach((el) => observer.unobserve(el));
      if (visionRef.current) visionObserver.unobserve(visionRef.current);
    };
  }, []);

  const scrollToSection = (index: number) => {
    const sectionId = sections[index].id;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white font-inter">
      <LandingNavbar isScrolled={isScrolled} />



      {/* Main Snap Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
      >

        {/* ================= S1: HERO SECTION ================= */}
        <section id="hero" className="w-full h-[200vh] snap-start relative bg-zinc-50 shrink-0">
          <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">

            {/* Background blobs for premium feel */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-200/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-100/40 rounded-full blur-[120px]" />

            <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 gap-12 lg:gap-20 items-center relative z-10">

              {/* CENTER COLUMN: Text Content */}
              <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
                {/* Logo / Badge */}
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  <span className="text-sm font-semibold text-slate-600 tracking-wide font-inter">World's #1 AI Food Suggestor</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black text-slate-900 leading-[1.05] tracking-tight font-cormorant text-center">
                  The World's Best <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400"> AI Food Companion</span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl text-slate-500 leading-relaxed max-w-xl font-medium font-inter">
                  Your ultimate personal food suggestor. Discover hyper-personalized restaurant recommendations and dishes tailored exactly to your cravings using advanced AI.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-slate-200 font-inter font-medium"
                  >
                    Try Out
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>

                  <button
                    onClick={() => navigate('/login')}
                    className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-inter font-medium"
                  >
                    Learn More
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>

                {/* Stats/Social Proof */}
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

            </div>
          </div>
        </section>

        {/* ================= S1.5: WHY FOOD.ILY SECTION ================= */}
        <section id="why-foodily" className="w-full h-[200vh] snap-start relative bg-white shrink-0">
          <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-50 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-slate-50 rounded-full blur-[60px]" />

            <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10">

              {/* Left Column: Text Content */}
              <div className="flex flex-col items-start space-y-8 order-2 lg:order-1">
                <h2 className="text-5xl lg:text-7xl font-cormorant font-black text-slate-900 leading-[1.1]">
                  Reduce <br /> <span className="text-orange-500">Decision Fatigue</span>
                </h2>

                <div className="space-y-4">
                  <p className="text-xl text-slate-600 font-medium font-inter">
                    Understand your taste.
                  </p>
                  <p className="text-xl text-slate-600 font-medium font-inter">
                    Helps you decide.
                  </p>
                  <p className="text-xl text-slate-600 font-medium font-inter">
                    Makes Discovery Fun.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-3 rounded-full border border-slate-300 text-slate-700 font-bold hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 transform hover:scale-105 active:scale-95 font-inter"
                >
                  Try Now
                </button>

                <p className="text-sm text-slate-400 italic">
                  - The more you use Food.ily, the more energy you preserve
                </p>
              </div>

              {/* Right Column: Map Image */}
              <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end group">
                <div className="relative w-full max-w-2xl transition-transform duration-700 transform group-hover:scale-120 group-hover:-rotate-1">
                  <img
                    src={mapImage}
                    alt="Foodily Map"
                    className="w-full h-auto drop-shadow-2xl"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>



        {/* ================= S2: FUNCTIONS (Combined) ================= */}
        <section id="features" className="w-full h-[200vh] snap-start shrink-0 bg-white">
          <div className="sticky top-0 h-screen w-full flex items-center justify-center py-20 lg:py-0 overflow-hidden">
            <div className="max-w-[1400px] w-full mx-auto px-6 h-full flex flex-col justify-center">

              {/* Section Header */}
              <div className="text-center mb-16">
                <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-4 font-cormorant">
                  Gamified Features
                </h2>
                <p className="text-xl text-slate-500 font-medium font-inter">
                  No more Endless scrolling. Conflicting reviews. “Anything is fine.”
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

                {/* Card 1: Food Hunter */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-slate-200 mb-6 shadow-sm">
                    <img src={foodHunterPreview} alt="Food Hunter" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 font-cormorant">Food Hunter</h3>
                  <p className="text-slate-600 mb-8 flex-grow leading-relaxed">
                    Search for what you're craving, not just keywords. Our AI understands your preferences to find the perfect dish.
                  </p>
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full bg-white text-orange-600 border border-orange-200 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 group"
                  >
                    Explore More
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>

                {/* Card 2: Food Gacha */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-slate-200 mb-6 shadow-sm flex items-center justify-center">
                    <img src={foodGachaIcon} alt="Food Gacha" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 font-cormorant">Food Gacha</h3>
                  <p className="text-slate-600 mb-8 flex-grow leading-relaxed">
                    Feeling adventurous? Spin the Gourmet Slot and let fate decide your next meal. Discover hidden gems.
                  </p>
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full bg-white text-orange-600 border border-orange-200 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 group"
                  >
                    Spin it Now
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>

                {/* Card 3: Concierge */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-slate-200 mb-6 shadow-sm flex items-center justify-center p-8">
                    <img src={conciergeIcon} alt="Concierge" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 font-cormorant">Concierge</h3>
                  <p className="text-slate-600 mb-8 flex-grow leading-relaxed">
                    Chat with our AI food concierge. Tell us your preferences, budget, and location for personalized picks.
                  </p>
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full bg-white text-orange-600 border border-orange-200 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 group"
                  >
                    Learn More
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ================= S5: COMMUNITY INSIGHTS SECTION ================= */}
        <section id="community" className="w-full h-screen snap-start relative bg-white shrink-0 overflow-hidden">
          <CommunityInsights />
        </section>

        {/* ================= S5.5: VISION SECTION ================= */}
        <section ref={visionRef} className="w-full h-[200vh] snap-start relative bg-zinc-50 shrink-0">
          <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
            <div className="max-w-5xl px-6 text-center relative z-10">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-cormorant font-medium text-slate-800 leading-tight">
                The more you use Foodily, <br className="hidden md:block" />
                <span className="relative inline-block mx-2">
                  <span
                    className={`absolute inset-0 bg-orange-200/60 -skew-y-1 rounded-lg transition-all duration-1000 ease-out origin-left ${isVisionVisible ? 'w-full' : 'w-0'}`}
                  ></span>
                  <span className="relative z-10">the better it understands you.</span>
                </span>
              </h2>
              <p className={`mt-8 text-lg md:text-xl text-slate-500 font-inter font-light transition-opacity duration-1000 delay-500 ${isVisionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Just like your taste evolves — so does your food companion.
              </p>
            </div>
          </div>
        </section>

        {/* ================= S6: JOIN NOW & FAQ ================= */}
        <section id="join" className="w-full h-screen snap-start flex flex-col shrink-0 bg-gradient-to-b from-orange-50 to-white overflow-y-auto">
          {/* Email Signup Area */}
          <div className="w-full min-h-[80vh] flex items-center justify-center p-6">
            <div className="w-full max-w-4xl">
              <EmailSignup />
            </div>
          </div>

          {/* FAQ Area */}
          <div className="w-full bg-white pb-20">
            <FAQSection />
          </div>

          <Footer />
        </section>

      </div>
    </div>
  );
};

export default Landing;
