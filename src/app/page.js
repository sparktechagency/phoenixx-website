"use client";

import Banner from '@/components/Banner';
import CategoriesSidebar from '@/components/CategoriesSidebar';
import FeedNavigation from '@/components/FeedNavigation';
import PostCard from '@/components/PostCard';
import React, { useState, useEffect, useContext } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { useGetPostQuery, useLikePostMutation } from '@/features/post/postApi';
import moment from 'moment';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Pagination, Button, Card, Empty, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeContext } from './layout';

const HomePage = () => {
  // State management
  const [gridNumber, setGridNumber] = useState(1);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState({ id: null });
  const postsPerPage = 10;

  const { isDarkMode } = useContext(ThemeContext);

  // Routing and params
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchValue = searchParams.get("search");
  const pageParam = searchParams.get("page");
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");

  // Initialize state from URL params and user
  useEffect(() => {
    if (pageParam) setCurrentPage(parseInt(pageParam));
    if (categoryParam) setSelectedCategory(categoryParam);
    if (subcategoryParam) setSelectedSubCategory(subcategoryParam);
    
    if (typeof window !== 'undefined') {
      setCurrentUser({
        id: localStorage.getItem("login_user_id")
      });
    }
  }, [pageParam, categoryParam, subcategoryParam]);

  // API query params
  const queryParams = {
    ...(searchValue && { searchTerm: searchValue }),
    ...(selectedCategory && { category: selectedCategory }),
    ...(selectedSubCategory && { subCategory: selectedSubCategory }),
    sort: sortOrder,
    page: currentPage,
    limit: postsPerPage
  };

  // API calls
  const { data, isLoading, error } = useGetPostQuery(queryParams);
  const [likePost] = useLikePostMutation();

  // Window resize handler
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleLike = async (postId) => {
    try {
      await likePost(postId).unwrap();
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleCategorySelect = (categoryId, subCategoryId = null) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(subCategoryId);
    setCurrentPage(1);
    updateUrlParams({ 
      category: categoryId || undefined,
      subcategory: subCategoryId || undefined,
      page: 1 
    });
  };

  const handleSortChange = (sortOption) => {
    setSortOrder(sortOption);
    setCurrentPage(1);
    updateUrlParams({ sort: sortOption, page: 1 });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateUrlParams({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateUrlParams = (params) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setCurrentPage(1);
    router.push(pathname);
  };

  // Helper functions
  const isDesktop = windowWidth >= 1024;
  const isGrid2 = gridNumber === 2 && isDesktop;

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const bangladeshTime = moment.utc(timestamp).utcOffset(6);
    return bangladeshTime.fromNow();
  };

  const formatPostData = (post) => ({
    id: post._id,
    author: {
      username: post?.author?.userName || "Anonymous",
      avatar: post?.author?.profile,
      name: post?.author?.name || "User"
    },
    timePosted: formatTime(post.createdAt),
    title: post.title,
    content: post.content,
    image: post.image,
    tags: [post.category?.name || "General"],
    stats: {
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0,
      reads: post.views || 0,
      likedBy: post.likes || []
    },
    isLiked: post.likes?.includes(currentUser.id) || false
  });

  // Data processing
  const posts = data?.data?.data || [];
  const totalPosts = data?.data?.meta?.total || 0;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const getCategoryName = () => {
    if (selectedSubCategory) {
      const post = posts.find(p => p.subcategory?._id === selectedSubCategory);
      return post?.subcategory?.name || "Selected Subcategory";
    } else if (selectedCategory) {
      const post = posts.find(p => p.category?._id === selectedCategory);
      return post?.category?.name || "Selected Category";
    }
    return "All Posts";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessage = error.data?.message || error.message || "Unknown error occurred";
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="text-center">
          <Empty
            description={
              <span className="text-red-500">
                Error: {errorMessage}
              </span>
            }
          />
        </Card>
      </div>
    );
  }

  // Main render
  return (
    <div className={`${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Banner />
      <ThemeToggle />
      <main className="container mx-auto px-4 py-6">
        <LayoutGroup>
          {isDesktop ? (
            <motion.div layout className="flex gap-5">
              {/* Sidebar */}
              <motion.div layout className={`${isGrid2 ? 'w-3/12' : 'w-3/12 pr-6 sticky top-20 self-start'}`}>
                <CategoriesSidebar 
                  onSelectCategory={handleCategorySelect}
                  selectedCategory={selectedCategory}
                  selectedSubCategory={selectedSubCategory}
                />
              </motion.div>

              {/* Main content */}
              <motion.section layout className={`${isGrid2 ? 'w-9/12' : 'w-6/12'}`}>
                <FeedNavigation 
                  handlefeedGrid={setGridNumber} 
                  onSortChange={handleSortChange}
                  currentSort={sortOrder}
                />
                
                {/* Filters indicator */}
                {(selectedCategory || selectedSubCategory || searchValue) && (
                  <Card className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-gray-700 mr-2">Viewing:</span>
                        <span className="font-medium text-blue-600">
                          {searchValue ? `Search results for "${searchValue}"` : getCategoryName()}
                        </span>
                      </div>
                      <Button type="link" onClick={clearAllFilters}>
                        Clear All Filters
                      </Button>
                    </div>
                  </Card>
                )}
                
                {/* Posts list */}
                {posts.length === 0 ? (
                  <Card className="text-center">
                    <Empty
                      description={
                        <>
                          <h3 className="text-lg font-medium text-gray-700">No posts found</h3>
                          <p className="text-gray-500 mt-2">
                            {searchValue 
                              ? "Try a different search term" 
                              : "Try selecting a different category or subcategory"}
                          </p>
                        </>
                      }
                    />
                  </Card>
                ) : (
                  <>
                    <motion.div
                      layout
                      className={`grid ${isGrid2 ? 'grid-cols-2 gap-4' : 'grid-cols-1 gap-1'} mb-6`}
                    >
                      {posts.map((post) => (
                        <div key={post._id}>
                          <PostCard
                            postData={formatPostData(post)}
                            currentUser={currentUser}
                            onLike={handleLike}
                          />
                        </div>
                      ))}
                    </motion.div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <Pagination
                          current={currentPage}
                          total={totalPosts}
                          pageSize={postsPerPage}
                          onChange={handlePageChange}
                          showSizeChanger={false}
                          itemRender={(current, type, originalElement) => {
                            if (type === 'prev') {
                              return <Button icon={<LeftOutlined />} />;
                            }
                            if (type === 'next') {
                              return <Button icon={<RightOutlined />} />;
                            }
                            return originalElement;
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </motion.section>
            </motion.div>
          ) : (
            /* Mobile layout */
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
              
              {(selectedCategory || selectedSubCategory || searchValue) && (
                <Card className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-gray-700 mr-2">Viewing:</span>
                      <span className="font-medium text-blue-600">
                        {searchValue ? `Search results for "${searchValue}"` : getCategoryName()}
                      </span>
                    </div>
                    <Button type="link" onClick={clearAllFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </Card>
              )}
              
              {posts.length === 0 ? (
                <Card className="text-center">
                  <Empty
                    description={
                      <>
                        <h3 className="text-lg font-medium text-gray-700">No posts found</h3>
                        <p className="text-gray-500 mt-2">
                          {searchValue 
                            ? "Try a different search term" 
                            : "Try selecting a different category or subcategory"}
                        </p>
                      </>
                    }
                  />
                </Card>
              ) : (
                <>
                  <div className={`grid gap-5 ${gridNumber === 2 && windowWidth >= 640 ? 'grid-cols-2' : 'grid-cols-1'} mb-6`}>
                    {posts.map((post) => (
                      <div key={post._id}>
                        <PostCard
                          postData={formatPostData(post)}
                          currentUser={currentUser}
                          onLike={handleLike}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <Pagination
                        current={currentPage}
                        total={totalPosts}
                        pageSize={postsPerPage}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                        itemRender={(current, type, originalElement) => {
                          if (type === 'prev') {
                            return <Button icon={<LeftOutlined />} />;
                          }
                          if (type === 'next') {
                            return <Button icon={<RightOutlined />} />;
                          }
                          return originalElement;
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </LayoutGroup>
      </main>
    </div>
  );
};

export default HomePage;