"use client";

import Banner from '@/components/Banner';
import CategoriesSidebar from '@/components/CategoriesSidebar';
import FeedNavigation from '@/components/FeedNavigation';
import PostCard from '@/components/PostCard';
import React, { useState, useEffect } from 'react';
import { motion,LayoutGroup } from 'framer-motion';
import { useGetPostQuery, useLikePostMutation } from '@/features/post/postApi';
import moment from 'moment';

const Page = () => {
  const [gridNumber, setGridNumber] = useState(1);
  const [windowWidth, setWindowWidth] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const { data, isLoading, error } = useGetPostQuery();
  const [likePost] = useLikePostMutation();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentUser = { name: "Current User", username: "@currentuser", avatar: "/path/to/currentuser.jpg" };

  const handleLike = async (postId) => {
    try {
      const response = await likePost(postId).unwrap();
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCommentSubmit = (postId, commentText) => {
    console.log("Comment on post:", postId, "Text:", commentText);
  };

  const handleCategorySelect = (categoryId, subCategoryId = "") => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(subCategoryId);
  };

  const handleSortChange = (sortOption) => {
    setSortOrder(sortOption);
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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    
    // Set Bangladesh time (UTC+6)
    const bangladeshTime = moment.utc(timestamp).utcOffset(6);
    
    return bangladeshTime.fromNow();
  };

  const formatPostData = (post) => ({
    id: post._id,
    author: {
      name: post.author.userName,
      username: `@${post.author.userName}`,
      avatar: `${post?.author?.profile}`
    },
    timePosted: formatTime(post.createdAt),
    title: post.title,
    content: post.content,
    image: post.image,
    tags: [post.category?.name || "General"],
    stats: {
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0,
      reads: post.views || 0
    },
    isLiked: false
  });

  // Filter posts based on selected category and subcategory
  const filteredPosts = (data?.data?.data || []).filter(post => {
    if (!selectedCategory) return true;
    
    if (selectedSubCategory) {
      return post.category?._id === selectedCategory && 
             post.subcategory?._id === selectedSubCategory;
    }
    
    return post.category?._id === selectedCategory;
  });

  // Sort posts based on the selected option
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortOrder === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else {
      // Popular - sort by likes + comments + views
      const aPopularity = (a.likes?.length || 0) + (a.comments?.length || 0) + (a.views || 0);
      const bPopularity = (b.likes?.length || 0) + (b.comments?.length || 0) + (b.views || 0);
      return bPopularity - aPopularity;
    }
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
                <CategoriesSidebar 
                  onSelectCategory={handleCategorySelect}
                  selectedCategory={selectedCategory}
                  selectedSubCategory={selectedSubCategory}
                />
              </motion.div>

              {/* Main Feed */}
              <motion.section
                layout
                className={`${isGrid2 ? 'w-9/12' : 'w-6/12'}`}
              >
                <FeedNavigation 
                  handlefeedGrid={setGridNumber} 
                  onSortChange={handleSortChange}
                  currentSort={sortOrder}
                />
                
                {/* Display current filter info */}
                {(selectedCategory || selectedSubCategory) && (
                  <div className="bg-white rounded-lg p-3 mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-gray-700 mr-2">Viewing:</span>
                      <span className="font-medium text-blue-600">
                        {selectedCategory ? (
                          selectedSubCategory ? 
                            `${data?.data?.data.find(post => post.subcategory?._id === selectedSubCategory)?.subcategory?.name || "Selected Subcategory"}` : 
                            `${data?.data?.data.find(post => post.category?._id === selectedCategory)?.category?.name || "Selected Category"}`
                        ) : "All Posts"}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleCategorySelect("", "")}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
                
                {sortedPosts.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-700">No posts found</h3>
                    <p className="text-gray-500 mt-2">Try selecting a different category or subcategory</p>
                  </div>
                ) : (
                  <motion.div
                    layout
                    className={`grid ${isGrid2 ? 'grid-cols-2 gap-4' : 'grid-cols-1 gap-1'}`}
                  >
                    {sortedPosts.map((post) => (
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
                )}
              </motion.section>
            </motion.div>
          ) : (
            <div className="flex flex-col">
              <CategoriesSidebar 
                onSelectCategory={handleCategorySelect}
                selectedCategory={selectedCategory}
                selectedSubCategory={selectedSubCategory}
              />
              <FeedNavigation 
                handlefeedGrid={setGridNumber} 
                onSortChange={handleSortChange}
                currentSort={sortOrder}
              />
              
              {/* Display current filter info */}
              {(selectedCategory || selectedSubCategory) && (
                <div className="bg-white rounded-lg p-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-700 mr-2">Viewing:</span>
                    <span className="font-medium text-blue-600">
                      {selectedCategory ? (
                        selectedSubCategory ? 
                          `${data?.data?.data.find(post => post.subcategory?._id === selectedSubCategory)?.subcategory?.name || "Selected Subcategory"}` : 
                          `${data?.data?.data.find(post => post.category?._id === selectedCategory)?.category?.name || "Selected Category"}`
                      ) : "All Posts"}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleCategorySelect("", "")}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
              
              {sortedPosts.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-700">No posts found</h3>
                  <p className="text-gray-500 mt-2">Try selecting a different category or subcategory</p>
                </div>
              ) : (
                <div className={`grid gap-5 ${gridNumber === 2 && windowWidth >= 640 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {sortedPosts.map((post) => (
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
              )}
            </div>
          )}
        </LayoutGroup>
      </main>
    </div>
  );
};

export default Page;