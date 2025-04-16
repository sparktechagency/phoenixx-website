"use client";

import Banner from '@/components/Banner';
import CategoriesSidebar from '@/components/CategoriesSidebar';
import FeedNavigation from '@/components/FeedNavigation';
import PostCard from '@/components/PostCard';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useGetPostQuery, useLikePostMutation } from '@/features/post/postApi';
import { baseURL } from '../../utils/BaseURL';

const Page = () => {
  const [gridNumber, setGridNumber] = useState(1);
  const [windowWidth, setWindowWidth] = useState(0);

  const { data, isLoading } = useGetPostQuery();
  const [likePost ] = useLikePostMutation()
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentUser = { name: "Current User", username: "@currentuser", avatar: "/path/to/currentuser.jpg" };

  const handleLike =async (postId) => {
    // You'll need to implement actual like functionality with your API
    // console.log("Liked post:", postId);

    try {
      const response = await likePost(postId).unwrap();
      console.log(response)
    } catch (error) {
      console.log(error)
    }


  
  };

  const handleCommentSubmit = (postId, commentText) => {
    // You'll need to implement actual comment functionality with your API
    console.log("Comment on post:", postId, "Text:", commentText);
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

  if (isLoading) {
    return "Loading...";
  }

  // Format the API data to match your PostCard component's expected structure
  const formatPostData = (post) => ({
    id: post._id,
    author: {
      name: post.author.userName,
      username: `@${post.author.userName}`,
      avatar: `${post?.author?.profile}`
    },
    timePosted: new Date(post.createdAt).toLocaleString(),
    title: post.title,
    content: post.content,
    image: post.image,
    tags: [post.category?.name || "General"],
    stats: {
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0,
      reads: post.views || 0
    },
    isLiked: false // You might want to check if current user liked this post
  });

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
                  className={`grid ${isGrid2 ? 'grid-cols-2 gap-4' : 'grid-cols-1 gap-1'}`}
                >
                  {data?.data?.data?.map((post) => (
                    <div key={post._id}>
                      <PostCard
                        postData={formatPostData(post)}
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
                {data?.data?.data?.map((post) => (
                  <div key={post._id}>
                    <PostCard
                      postData={formatPostData(post)}
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