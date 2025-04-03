"use client"

import PostCard from '@/components/PostCard';
import ProfileBanner from '@/components/profile/ProfileBanner';
import React, { useState, useEffect } from 'react';
import { Card, Space, Typography } from 'antd';
import { FiFile, FiBookmark, FiMessageSquare } from 'react-icons/fi';

const ProfilePage = () => {
    // These would ideally come from props or API calls
    const stats = {
        totalPosts: 15,
        savedPosts: 5,
        comments: 0
    };
    
    // Initialize state with value from localStorage if available, otherwise default to 'totalPosts'
    const [activeTab, setActiveTab] = useState(() => {
        // Only run on client-side
        if (typeof window !== 'undefined') {
            const savedTab = localStorage.getItem('profileActiveTab');
            return savedTab || 'totalPosts';
        }
        return 'totalPosts';
    });
    
    // Save activeTab to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('profileActiveTab', activeTab);
    }, [activeTab]);
    
    // Mock data for different post types
    const mockPosts = {
        totalPosts: Array.from({ length: stats.totalPosts }).map((_, i) => ({ 
            id: `total-${i}`, 
            type: 'total',
            title: `Post ${i + 1}`
        })),
        savedPosts: Array.from({ length: stats.savedPosts }).map((_, i) => ({ 
            id: `saved-${i}`, 
            type: 'saved',
            title: `Saved Post ${i + 1}`
        })),
        comments: Array.from({ length: stats.comments }).map((_, i) => ({ 
            id: `comment-${i}`, 
            type: 'comment',
            title: `Comment Post ${i + 1}`
        }))
    };
    
    // Determine which posts to display based on active tab
    const postsToDisplay = mockPosts[activeTab] || [];
    
    return (
        <div className="bg-gray-50 min-h-screen">
            <ProfileBanner />
            
            <main className="py-6 container mx-auto px-4">
                <div className="flex flex-col justify-center lg:flex-row gap-6">
                    <aside className="w-full lg:w-1/3 xl:w-1/4">
                        <Card 
                            title="Your Activity" 
                            className="shadow-sm"
                            aria-label="User statistics"
                        >
                            <Space direction="vertical" size="middle" className="w-full">
                                <button 
                                    onClick={() => setActiveTab('totalPosts')} 
                                    className={`flex items-center text-gray-700 w-full p-2 rounded-md ${activeTab === 'totalPosts' ? 'bg-indigo-50' : ''}`}
                                >
                                    <FiFile className={`h-5 w-5 mr-3 ${activeTab === 'totalPosts' ? 'text-indigo-600' : 'text-gray-500'}`} />
                                    <span>Total Posts: <strong>{stats.totalPosts}</strong></span>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('savedPosts')} 
                                    className={`flex items-center text-gray-700 w-full p-2 rounded-md ${activeTab === 'savedPosts' ? 'bg-indigo-50' : ''}`}
                                >
                                    <FiBookmark className={`h-5 w-5 mr-3 ${activeTab === 'savedPosts' ? 'text-indigo-600' : 'text-gray-500'}`} />
                                    <span>Saved Posts: <strong>{stats.savedPosts}</strong></span>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('comments')} 
                                    className={`flex items-center text-gray-700 w-full p-2 rounded-md ${activeTab === 'comments' ? 'bg-indigo-50' : ''}`}
                                >
                                    <FiMessageSquare className={`h-5 w-5 mr-3 ${activeTab === 'comments' ? 'text-indigo-600' : 'text-gray-500'}`} />
                                    <span>Comments: <strong>{stats.comments}</strong></span>
                                </button>
                            </Space>
                        </Card>
                    </aside>
                    
                    {/* Posts Feed */}
                    <section className="w-full lg:w-2/3 xl:w-2/4" aria-label={`Your ${activeTab}`}>
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold">
                                {activeTab === 'totalPosts' && 'Your Posts'}
                                {activeTab === 'savedPosts' && 'Saved Posts'}
                                {activeTab === 'comments' && 'Your Comments'}
                            </h2>
                        </div>
                        <div className="flex flex-col gap-4">
                            {postsToDisplay.length > 0 ? (
                                postsToDisplay.map((post) => (
                                    <PostCard key={post.id} postData={post} />
                                ))
                            ) : (
                                <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                                    <p className="text-gray-500">No posts to display</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;