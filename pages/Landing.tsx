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

  // Dummy user posts data (15 posts for Community Favourites section)
  const userPosts = [
    {
      imageUrl: "https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg",  // Fried chicken
      dishName: 'Crispy Fried Chicken',
      userName: 'Local Explorer',
      likes: 127
    },
    {
      imageUrl: "https://images.pexels.com/photos/209540/pexels-photo-209540.jpeg", // Gourmet burger
      dishName: 'Gourmet Burger',
      userName: 'Burger Boss',
      likes: 89
    },
    {
      imageUrl: "https://images.pexels.com/photos/2098087/pexels-photo-2098087.jpeg", // Sushi platter
      dishName: 'Sushi Platter',
      userName: 'Sushi Master',
      likes: 156
    },
    {
      imageUrl: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg", // Pasta carbonara
      dishName: 'Pasta Carbonara',
      userName: 'Pasta Lover',
      likes: 94
    },
    {
      imageUrl: "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg", // Margherita pizza
      dishName: 'Margherita Pizza',
      userName: 'Pizza Fanatic',
      likes: 203
    },
    {
      imageUrl: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg", // Lava cake
      dishName: 'Chocolate Lava Cake',
      userName: 'Sweet Tooth',
      likes: 178
    },
    {
      imageUrl: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg", // Grilled salmon
      dishName: 'Grilled Salmon',
      userName: 'Health Guru',
      likes: 112
    },
    {
      imageUrl: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg", // Beef tacos (reuse similar high-quality food photo)
      dishName: 'Beef Tacos',
      userName: 'Taco Tuesday',
      likes: 145
    },
    {
      imageUrl: "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg", // Ramen bowl
      dishName: 'Tonkotsu Ramen',
      userName: 'Ramen King',
      likes: 198
    },
    {
      imageUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg", // Caesar salad
      dishName: 'Caesar Salad',
      userName: 'Salad Queen',
      likes: 76
    },
    {
      imageUrl: "https://images.pexels.com/photos/143589/pexels-photo-143589.jpeg", // Pad thai
      dishName: 'Pad Thai',
      userName: 'Thai Food Fan',
      likes: 134
    },
    {
      imageUrl: "https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg", // BBQ ribs
      dishName: 'BBQ Ribs',
      userName: 'Grill Master',
      likes: 167
    },
    {
      imageUrl: "https://images.pexels.com/photos/302680/pexels-photo-302680.jpeg", // Tiramisu
      dishName: 'Tiramisu',
      userName: 'Dessert Lover',
      likes: 143
    },
    {
      imageUrl: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg", // Poke bowl (fallback to similar aesthetic)
      dishName: 'Poke Bowl',
      userName: 'Bowl Enthusiast',
      likes: 121
    },
    {
      imageUrl: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg", // Dim sum (reuse similar free image)
      dishName: 'Dim Sum Platter',
      userName: 'Dumpling Fan',
      likes: 189
    }
  ];


  return (
      <div className="min-h-screen flex flex-col overflow-x-hidden bg-white">

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
                  <div className="relative z-10 scale-110 shadow-2xl animate-[float_5s_ease-in-out_infinite_0.5s]">
                    <UserPostCard
                        {...userPosts[3]}
                        className="ring-4 ring-white scale-[1.15]"
                    />
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

        {/* ================= COMMUNITY FAVOURITES SECTION (Three-Layer Glassmorphism) ================= */}
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-slate-50 to-orange-100">

          {/* LOWER LAYER: Masked Image Collage */}
          <div className="absolute inset-0 overflow-hidden">
            <div
                className="grid grid-cols-5 gap-6 p-12 max-w-[1600px] mx-auto"
                style={{
                  maskImage:
                      'radial-gradient(circle at center, black 40%, transparent 75%)',
                  WebkitMaskImage:
                      'radial-gradient(circle at center, black 40%, transparent 75%)',
                }}
            >
              {userPosts.slice(0, 15).map((post, index) => (
                  <div
                      key={`mask-${index}`}
                      className="aspect-square rounded-2xl overflow-hidden shadow-lg transform"
                      style={{
                        transform: `rotate(${(index % 3 - 1) * 3}deg) translateY(${(index % 2) * 12}px)`
                      }}
                  >
                    <img
                        src={post.imageUrl}
                        alt={post.dishName}
                        className="w-full h-full object-cover opacity-60"
                    />
                  </div>
              ))}
            </div>
          </div>

          {/* MID LAYER: Glassmorphism Frame */}
          <div className="relative z-10 max-w-5xl w-full mx-auto px-6">
            <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20">

              {/* Section Header */}
              <div className="text-center mb-16">
                <h2 className="text-5xl lg:text-6xl font-black text-white mb-4 drop-shadow-lg">
                  Community Favourites
                </h2>
                <p className="text-xl text-white/90 font-medium drop-shadow">
                  Discover what food lovers are sharing
                </p>
              </div>

              {/* UPPER LAYER: 3 Featured Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {userPosts.slice(0, 3).map((post, index) => (
                    <div
                        key={`featured-${index}`}
                        className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white transform hover:scale-105 hover:rotate-1 transition-all duration-300 cursor-pointer"
                    >
                      {/* Food Image */}
                      <div className="aspect-square bg-gradient-to-br from-orange-100 to-slate-100 relative overflow-hidden">
                        <img
                            src={post.imageUrl}
                            alt={post.dishName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback gradient if image fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                        />
                      </div>

                      {/* Card Footer */}
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 text-lg mb-2 truncate">
                          {post.dishName}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                              {post.userName.charAt(0)}
                            </div>
                            <span className="text-sm text-slate-600 font-medium truncate">
                          {post.userName}
                        </span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <svg className="w-5 h-5 fill-orange-500" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span className="text-sm font-semibold">{post.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>

            </div>
          </div>

          {/* Decorative gradient blobs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
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
