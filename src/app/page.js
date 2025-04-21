"use client";

import Banner from '@/components/Banner';
import CategoriesSidebar from '@/components/CategoriesSidebar';
import FeedNavigation from '@/components/FeedNavigation';
import PostCard from '@/components/PostCard';
import React, { useState, useEffect } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { useGetPostQuery, useLikePostMutation } from '@/features/post/postApi';
import moment from 'moment';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Pagination, Button, Card, Empty } from 'antd';
import { LeftOutlined, RightOutlined, DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';

const Page = () => {
  const [gridNumber, setGridNumber] = useState(1);
  const [windowWidth, setWindowWidth] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchValue = searchParams.get("search");
  
  const pageParam = searchParams.get("page");
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");

  useEffect(() => {
    if (pageParam) {
      setCurrentPage(parseInt(pageParam));
    }
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (subcategoryParam) {
      setSelectedSubCategory(subcategoryParam);
    }
  }, [pageParam, categoryParam, subcategoryParam]);

  // Build query object carefully, only including defined parameters
  // FIX: Separate category and subcategory params as required by the API
  const queryParams = {
    ...(searchValue && { searchTerm: searchValue }),
    ...(selectedCategory && { category: selectedCategory }),
    ...(selectedSubCategory && { subCategory: selectedSubCategory }), // Changed from subcategory to subCategory to match API expectation
    sort: sortOrder,
    page: currentPage,
    limit: postsPerPage
  };

  const { data, isLoading, error } = useGetPostQuery(queryParams);
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

  const handleCategorySelect = (categoryId, subCategoryId = null) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(subCategoryId);
    setCurrentPage(1);
    
    // FIX: Update URL params with correct parameter names
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

  const isDesktop = windowWidth >= 1024;
  const isGrid2 = gridNumber === 2 && isDesktop;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card loading={true} style={{ width: 300 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="text-center">
          <Empty
            description={
              <span className="text-red-500">
                Error loading posts. Please try again later.
              </span>
            }
          />
        </Card>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const bangladeshTime = moment.utc(timestamp).utcOffset(6);
    return bangladeshTime.fromNow();
  };

  const formatPostData = (post) => ({
    id: post._id,
    author: {
      username: `${post?.author?.userName}`,
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

  const posts = data?.data?.data || [];

  const totalPosts = data?.data?.meta?.total || 0; // Fixed: Using meta.total instead of pagination.total
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  // Helper function to find category/subcategory names
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
                
                {(selectedCategory || selectedSubCategory || searchValue) && (
                  <Card className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-gray-700 mr-2">Viewing:</span>
                        <span className="font-medium text-blue-600">
                          {searchValue ? (
                            `Search results for "${searchValue}"`
                          ) : (
                            getCategoryName()
                          )}
                        </span>
                      </div>
                      <Button 
                        type="link" 
                        onClick={clearAllFilters}
                      >
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
                            onCommentSubmit={handleCommentSubmit}
                          />
                        </div>
                      ))}
                    </motion.div>
                    
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
                            if (type === 'jump-prev') {
                              return <Button icon={<DoubleLeftOutlined />} />;
                            }
                            if (type === 'jump-next') {
                              return <Button icon={<DoubleRightOutlined />} />;
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
                        {searchValue ? (
                          `Search results for "${searchValue}"`
                        ) : (
                          getCategoryName()
                        )}
                      </span>
                    </div>
                    <Button 
                      type="link" 
                      onClick={clearAllFilters}
                    >
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
                          postData={post}
                          currentUser={currentUser}
                          onLike={handleLike}
                          onCommentSubmit={handleCommentSubmit}
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
                          if (type === 'jump-prev') {
                            return <Button icon={<DoubleLeftOutlined />} />;
                          }
                          if (type === 'jump-next') {
                            return <Button icon={<DoubleRightOutlined />} />;
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

export default Page;