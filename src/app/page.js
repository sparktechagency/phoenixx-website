"use client";

import Banner from '@/components/Banner';
import CategoriesSidebar from '@/components/CategoriesSidebar';
import FeedNavigation from '@/components/FeedNavigation';
import PostCard from '@/components/PostCard';
import React, { useState, useEffect } from 'react';

const Page = () => {
  const [posts, setPosts] = useState([
    {
      id: '1',
      author: {
        name: "John Doe",
        username: "@johndoe",
        avatar: "/images/profile.jpg"
      },
      timePosted: "2 hours ago",
      title: "My First Post",
      content: "This is a sample post content that will be truncated if it's too long...".repeat(5),
      image: "/images/post.png",
      tags: ["Technology", "Programming"],
      stats: {
        likes: 24,
        comments: [
          {
            id: 'c1',
            author: {
              name: "Jane Smith",
              username: "@janesmith"
            },
            text: "Great post!",
            createdAt: new Date()
          }
        ],
        reads: 150
      },
      isLiked: false
    },


    {
      id: '2',
      author: {
        name: "John Doe",
        username: "@johndoe",
        avatar: "/images/profile.jpg"
      },
      timePosted: "2 hours ago",
      title: "My First Post",
      content: "This is a sample post content that will be truncated if it's too long...".repeat(5),
      image: "/images/post.png",
      tags: ["Technology", "Programming"],
      stats: {
        likes: 24,
        comments: [
          {
            id: 'c1',
            author: {
              name: "Jane Smith",
              username: "@janesmith"
            },
            text: "Great post!",
            createdAt: new Date()
          }
        ],
        reads: 150
      },
      isLiked: false
    },

  ]);

  const [gridNumber, setGridNumber] = useState(1);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  // Responsive layout detection
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
      
      // Auto-adjust grid layout based on screen size
      if (window.innerWidth < 640) {
        setGridNumber(1);
      } else if (window.innerWidth < 1024) {
        setGridNumber(1);
      } else {
        setGridNumber(1); // Default to single column for larger screens
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial size
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  const isDesktop = windowSize.width >= 1024;

  const currentUser = {
    name: "Current User",
    username: "@currentuser",
    avatar: "/path/to/currentuser.jpg"
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          stats: {
            ...post.stats,
            likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1
          }
        };
      }
      return post;
    }));
  };

  const handleCommentSubmit = (postId, commentText) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newComment = {
          id: `c${post.stats.comments.length + 1}`,
          author: currentUser,
          text: commentText,
          createdAt: new Date()
        };
        return {
          ...post,
          stats: {
            ...post.stats,
            comments: [...post.stats.comments, newComment]
          }
        };
      }
      return post;
    }));
  };

  const handleShare = (postId) => {
    console.log(`Sharing post ${postId}`);
    // Implement share functionality
  };

  const handleOptionSelect = (postId, option) => {
    console.log(`Option ${option} selected for post ${postId}`);
    // Implement option functionality
  };

  const handlefeedGrid = (num) => {
    setGridNumber(num);
  };

  // Responsive layout classes
  const getMainLayoutClasses = () => {
    if (isMobile) return 'flex-col';
    if (isTablet) return 'flex-col lg:flex-row';
    return 'flex-row';
  };

  const getCategorySectionClasses = () => {
    if (isMobile) return 'w-full mb-6';
    if (isTablet) return 'w-full lg:w-3/12 lg:pr-4 lg:sticky lg:top-20';
    return 'w-3/12 pr-6 sticky top-20';
  };

  const getFeedSectionClasses = () => {
    if (isMobile) return 'w-full';
    if (isTablet) return 'w-full lg:w-6/12';
    return 'w-6/12';
  };

  const getSidebarClasses = () => {
    if (isMobile) return 'hidden';
    if (isTablet) return 'hidden lg:block lg:w-3/12 lg:pl-4';
    return 'w-3/12 pl-6';
  };

  return (
    <div className="">
      <Banner />
      <main role="main" className={`container mx-auto px-4 py-6 flex ${getMainLayoutClasses()} gap-5`}>
        {/* Categories Section */}
        <section 
          aria-labelledby="category-heading" 
          className={getCategorySectionClasses()}
        >
          <CategoriesSidebar />
        </section>
        
        {/* Main Feed Section */}
        <section 
          aria-labelledby="feed-heading" 
          className={getFeedSectionClasses()}
        >
          <FeedNavigation handlefeedGrid={handlefeedGrid} />
          <div className={`grid ${gridNumber === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 gap-5'}  `}>
            {posts.map(post => (
              <PostCard
                key={post.id}
                postData={post}
                currentUser={currentUser}
                onLike={handleLike}
                onCommentSubmit={handleCommentSubmit}
                onShare={handleShare}
                onOptionSelect={handleOptionSelect}
              />
            ))}
          </div>
        </section>
        
        {/* Sidebar Section */}
        <section 
          aria-labelledby="additional-heading" 
          className={getSidebarClasses()}
        >
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
            <h3 className="text-lg font-semibold mb-4">Trending Topics</h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">#WebDevelopment</div>
              <div className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">#UXDesign</div>
              <div className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">#JavaScript</div>
              <div className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">#ResponsiveDesign</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Page;