import React, { useState } from 'react';
import { getSavedPosts, toggleSavePost } from '../../services/storageService';

const SavedSection: React.FC = () => {
    const [savedPosts, setSavedPosts] = useState(getSavedPosts());

    const handleUnsavePost = (postId: string) => {
        const updatedPosts = toggleSavePost(postId);
        setSavedPosts(updatedPosts);
    };

    if (savedPosts.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center">
                        <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Saved Posts</h3>
                    <p className="text-sm text-slate-400 font-medium">Start exploring and save your favorite posts!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Saved Posts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedPosts.map((post) => (
                        <div
                            key={post.id}
                            className="group relative bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-xl transition-all cursor-pointer"
                        >
                            {/* Image */}
                            <div className="aspect-square bg-slate-100 overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.dishName}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-2">
                                <h4 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                                    {post.restaurantName}
                                </h4>
                                <p className="text-xs text-slate-600 font-medium">{post.dishName}</p>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-3 h-3 ${i < post.rating ? 'text-orange-500' : 'text-slate-200'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>

                                    {/* Bookmark/Save Icon - Click to unsave */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnsavePost(post.id);
                                        }}
                                        className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors"
                                        title="Unsave post"
                                    >
                                        <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SavedSection;
