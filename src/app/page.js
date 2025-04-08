"use client";

import Banner from '@/components/Banner';
import CategoriesSidebar from '@/components/CategoriesSidebar';
import FeedNavigation from '@/components/FeedNavigation';
import PostCard from '@/components/PostCard';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

const Page = () => {
  const [posts, setPosts] = useState([
    {
      id: '1',
      author: { name: "John Doe", username: "@johndoe", avatar: "/images/profile.jpg" },
      timePosted: "2 hours ago",
      title: "My First Post",
      content: "This is a sample post content that will be truncated if it's too long...".repeat(5),
      image: "/images/post.png",
      tags: ["Technology", "Programming"],
      stats: { likes: 24, comments: [{ id: 'c1', author: { name: "Jane Smith", username: "@janesmith" }, text: "Great post!", createdAt: new Date() }], reads: 150 },
      isLiked: false
    },
    {
      id: '2',
      author: { name: "John Doe", username: "@johndoe", avatar: "/images/profile.jpg" },
      timePosted: "2 hours ago",
      title: "My Second Post",
      content: "Another sample post content...".repeat(3),
      image: "/images/post.png",
      tags: ["Design", "UI/UX"],
      stats: { likes: 12, comments: [], reads: 75 },
      isLiked: false
    },
  ]);

  const [gridNumber, setGridNumber] = useState(1);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentUser = { name: "Current User", username: "@currentuser", avatar: "/path/to/currentuser.jpg" };

  const handleLike = (postId) => {
    setPosts(posts.map(post => post.id === postId ? {
      ...post,
      isLiked: !post.isLiked,
      stats: { ...post.stats, likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1 }
    } : post));
  };

  const handleCommentSubmit = (postId, commentText) => {
    setPosts(posts.map(post => post.id === postId ? {
      ...post,
      stats: { ...post.stats, comments: [...post.stats.comments, {
        id: `c${post.stats.comments.length + 1}`,
        author: currentUser,
        text: commentText,
        createdAt: new Date()
      }]}
    } : post));
  };

  const TrendingTopics = () => (
    <div className="bg-white rounded-lg p-4 sticky top-20">
      <h3 className="text-lg font-semibold mb-4">Trending Topics</h3>
      {["WebDevelopment", "UXDesign", "JavaScript", "ResponsiveDesign"].map(topic => (
        <div key={topic} className="text-sm text-gray-600 hover:text-primary cursor-pointer py-1">
          {topic}
        </div>
      ))}
    </div>
  );

  const isDesktop = windowWidth >= 1024;
  const isGrid2 = gridNumber === 2 && isDesktop;

  return (
    <div className='bg-[#F2F4F7]'>
      <Banner />
      <main className="container mx-auto px-4 py-6">
        <LayoutGroup>
          {isDesktop ? (
            <motion.div layout className="flex gap-5">
              {/* Left Column */}
              <motion.div layout className={`${isGrid2 ? 'w-3/12' : 'w-3/12 pr-6 sticky top-20 self-start'}`}>
                <CategoriesSidebar />
                <AnimatePresence>
                  {isGrid2 && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 4 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full my-4"
                    />
                  )}
                </AnimatePresence>
                {isGrid2 && <TrendingTopics />}
              </motion.div>

              {/* Main Feed */}
              <motion.section 
                layout
                className={`${isGrid2 ? 'w-9/12' : 'w-6/12'}`}
              >
                <FeedNavigation handlefeedGrid={setGridNumber} />
                <motion.div
                  layout
                  className={`grid gap-5 ${isGrid2 ? 'grid-cols-2' : 'grid-cols-1'}`}
                >
                  {posts.map(post => (
                    <div key={post.id}>
                      <PostCard
                        postData={post}
                        currentUser={currentUser}
                        onLike={handleLike}
                        onCommentSubmit={handleCommentSubmit}
                      />
                    </div>
                  ))}
                </motion.div>
              </motion.section>

              {/* Right Column */}
              {!isGrid2 && (
                <motion.div layout className="w-3/12 pl-6 sticky top-20 self-start">
                  <TrendingTopics />
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col">
              <CategoriesSidebar />
              <FeedNavigation handlefeedGrid={setGridNumber} />
              <div className={`grid gap-5 ${gridNumber === 2 && windowWidth >= 640 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {posts.map(post => (
                  <div key={post.id}>
                    <PostCard
                      postData={post}
                      currentUser={currentUser}
                      onLike={handleLike}
                      onCommentSubmit={handleCommentSubmit}
                    />
                  </div>
                ))}
              </div>
              <TrendingTopics />
            </div>
          )}
        </LayoutGroup>
      </main>
    </div>
  );
};

export default Page;