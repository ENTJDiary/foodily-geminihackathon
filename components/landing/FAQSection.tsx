import React from 'react';

const FAQSection: React.FC = () => {
    const faqs = [
        {
            question: "What is Food.ily?",
            answer: "Food.ily is an AI-powered food discovery platform that helps you find the perfect dishes and restaurants based on your cravings, preferences, and mood—not just what's nearby."
        },
        {
            question: "How does the AI recommendation work?",
            answer: "Our advanced AI analyzes your taste preferences, dietary restrictions, mood, and even specific cravings to provide hyper-personalized restaurant and dish recommendations tailored just for you."
        },
        {
            question: "Is Food.ily free to use?",
            answer: "Yes! Food.ily is completely free to join and use. You can explore all features including Food Hunter, Food Gacha, and our AI Concierge without any subscription fees."
        },
        {
            question: "What are the main features?",
            answer: "Food.ily offers three core features: Food Hunter for AI-powered search, Food Gacha for random discovery through our gourmet slot machine, and Concierge for personalized chat-based recommendations."
        },
        {
            question: "Can I contribute to the community?",
            answer: "Absolutely! You can share your food discoveries, upload photos, write reviews, and help build our Local Ledger—a community-driven database of hidden gems and favorite spots."
        }
    ];

    return (
        <div className="w-full py-20 px-6">
            <div className="max-w-4xl mx-auto">

                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 font-cormorant">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-slate-600 font-medium font-inter">
                        Everything you need to know about Food.ily
                    </p>
                </div>

                {/* FAQ List */}
                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100"
                        >
                            <h3 className="text-xl font-bold text-slate-900 mb-3 font-cormorant">
                                {faq.question}
                            </h3>
                            <p className="text-slate-600 leading-relaxed font-medium font-inter">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default FAQSection;
