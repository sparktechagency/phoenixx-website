"use client";

import Banner from '@/components/Banner';
import CategoriesSidebar from '@/components/CategoriesSidebar';
import FeedNavigation from '@/components/FeedNavigation';
import PostCard from '@/components/PostCard';
import { useGetPostQuery, useLikePostMutation } from '@/features/post/postApi';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Card, Pagination, Spin } from 'antd';
import { LayoutGroup, motion } from 'framer-motion';
import moment from 'moment';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from './ClientLayout';

const HomePage = () => {
  // Force rerender when navigating back to this page
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = pathname + searchParams.toString();

  // State management
  const [gridNumber, setGridNumber] = useState(1);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentUser, setCurrentUser] = useState({ id: null });
  const [isFeedLoading, setIsFeedLoading] = useState(false);

  const { isDarkMode } = useContext(ThemeContext);

  // Routing and params
  const router = useRouter();
  const searchValue = searchParams.get("search");
  const pageParam = searchParams.get("page") || "1";
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");
  const sortParam = searchParams.get("sort");
  const limitParam = searchParams.get("limit") || "10";

  // Initialize state from URL params and user
  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (subcategoryParam) setSelectedSubCategory(subcategoryParam);
    if (sortParam) setSortOrder(sortParam);

    if (typeof window !== 'undefined') {
      setCurrentUser({
        id: localStorage.getItem("login_user_id")
      });
    }
  }, [categoryParam, subcategoryParam, sortParam]);

  // API query params directly from URL
  const queryParams = {
    ...(searchValue && { searchTerm: searchValue }),
    ...(categoryParam && { category: categoryParam }),
    ...(subcategoryParam && { subCategory: subcategoryParam }),
    sort: sortParam || sortOrder,
    page: parseInt(pageParam),
    limit: parseInt(limitParam)
  };

  // API calls
  const { data, isLoading, error, refetch } = useGetPostQuery(queryParams);
  const [likePost] = useLikePostMutation();

  // Extract pagination metadata from API response
  const currentPage = data?.data?.meta?.page || parseInt(pageParam);
  const postsPerPage = data?.data?.meta?.limit || parseInt(limitParam);
  const totalPosts = data?.data?.meta?.total || 0;
  const totalPages = data?.data?.meta?.totalPage || Math.ceil(totalPosts / postsPerPage);

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

const handleCategorySelect = async (categoryId, subCategoryId = null) => {
  setIsFeedLoading(true);
  
  // Update state
  setSelectedCategory(categoryId);
  setSelectedSubCategory(subCategoryId);
  
  const newParams = new URLSearchParams();
  
  // Always include the category ID if we have one
  if (categoryId) newParams.set('category', categoryId);
  
  // Only include subcategory if one was specifically selected
  if (subCategoryId) {
    newParams.set('subcategory', subCategoryId);
  } else {
    // If no subcategory selected, ensure we remove any existing subcategory param
    newParams.delete('subcategory');
  }
  
  // Reset to first page when changing filters
  newParams.set('page', '1');
  
  // Update URL
  window.history.replaceState(null, '', `${pathname}?${newParams.toString()}`);
  
  // Refetch data with new params
  await refetch();
  setIsFeedLoading(false);
};




  const handleSortChange = (sortOption) => {
    setSortOrder(sortOption);
    updateUrlParams({ sort: sortOption, page: 1 });
  };

  const handlePageChange = (page) => {
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
    setSortOrder("newest");
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
      id: post.author._id,
      username: post?.author?.userName || "Anonymous",
      avatar: post?.author?.profile,
      name: post?.author?.name || "User"
    },
    timePosted: formatTime(post.createdAt),
    title: post.title,
    content: post.content,
    images: post.images,
    tags: [{ category: post.category?.name, subcategory: post.subCategory?.name }],
    stats: {
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0,
      reads: post.views || 0,
      likedBy: post.likes || []
    },
    isLiked: post.likes?.includes(currentUser.id) || false
  });

  // Data processing
  let posts = data?.data?.data || [];

  // Client-side sorting if needed
  if (posts.length > 0 && !data?.data?.meta?.sorted) {
    switch (sortOrder) {
      case "newest":
        posts = [...posts].sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "oldest":
        posts = [...posts].sort((a, b) =>
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "popular":
        posts = [...posts].sort((a, b) => {
          const aPopularity = (a.likes?.length || 0) + (a.views || 0);
          const bPopularity = (b.likes?.length || 0) + (b.views || 0);
          return bPopularity - aPopularity;
        });
        break;
    }
  }

const getCategoryName = () => {
  if (selectedSubCategory) {
    const post = posts.find(p => p.subCategory?._id === selectedSubCategory);
    return post?.subCategory?.name || "Selected Subcategory";
  } else if (selectedCategory) {
    const post = posts.find(p => p.category?._id === selectedCategory);
    return post?.category?.name || "Selected Category";
  }
  return "All Posts";
};

  // Loading state
  if (isLoading) {
    return (
      <div className={`${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        {/* Banner Skeleton */}
        <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>

        <main className="container mx-auto px-4 py-6">
          <div className="flex gap-5">
            {/* Sidebar Skeleton - Desktop */}
            <div className="hidden lg:block w-3/12 pr-6 sticky top-20 self-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="mb-3">
                    <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="w-full lg:w-6/12">
              {/* Feed Navigation Skeleton */}
              <div className="flex justify-between items-center mb-6">
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Post Cards Skeleton */}
              <div className="grid grid-cols-1 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full mr-3"></div>
                      <div>
                        <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="h-5 w-full bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
                      <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="flex gap-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar Skeleton - Desktop */}

          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessage = error.data?.message || error.message || "Unknown error occurred";
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="text-center">
          <div className="flex flex-col items-center justify-center py-5 px-6 text-center">
            {/* SVG Illustration */}
            <div className="mb-6">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-300"
              >
                {/* Background circle */}
                <circle cx="60" cy="60" r="50" fill="currentColor" opacity="0.1" />

                {/* Document stack */}
                <rect x="35" y="45" width="40" height="50" rx="4" fill="currentColor" opacity="0.2" />
                <rect x="40" y="40" width="40" height="50" rx="4" fill="currentColor" opacity="0.3" />
                <rect x="45" y="35" width="40" height="50" rx="4" fill="currentColor" opacity="0.4" />

                {/* Search magnifier */}
                <circle cx="75" cy="45" r="12" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.6" />
                <line x1="84" y1="54" x2="95" y2="65" stroke="currentColor" strokeWidth="3" opacity="0.6" />

                {/* Sad face on document */}
                <circle cx="60" cy="55" r="2" fill="currentColor" opacity="0.5" />
                <circle cx="70" cy="55" r="2" fill="currentColor" opacity="0.5" />
                <path d="M55 65 Q65 60 75 65" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
              </svg>
            </div>

            {/* Main Message */}
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No posts found
            </h3>

            {/* Subtitle */}
            <p className="text-gray-500 text-sm mb-6 max-w-sm">
              There are no posts to display at the moment. Check back later or try adjusting your search criteria.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Function to distribute posts into columns for masonry layout
  const distributePostsToColumns = (posts, columnCount) => {
    if (!posts || posts.length === 0) return Array(columnCount).fill([]);

    // Initialize columns
    const columns = Array(columnCount).fill().map(() => []);

    // Distribute posts to columns
    posts.forEach((post, index) => {
      // Find the column with the least content
      const targetColumnIndex = index % columnCount;
      columns[targetColumnIndex].push(post);
    });

    return columns;
  };

  // Calculate column counts based on screen width and grid setting
  const getColumnCount = () => {
    // Mobile: always 1 column
    if (windowWidth < 640) return 1;

    // Tablet: always 1 column if grid is 1, 2 columns if grid is 2
    if (windowWidth < 1024) return gridNumber === 2 ? 2 : 1;

    // Desktop: 1 column if grid is 1, 2 columns if grid is 2
    return gridNumber === 2 ? 2 : 1;
  };

  const columnCount = getColumnCount();
  const postColumns = distributePostsToColumns(posts, columnCount);

  // Main render
  return (
    <div key={routeKey} className={`${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Banner />
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
              <motion.section layout className={`${isGrid2 ? 'w-9/12' : 'w-6/12'} flex flex-col gap-3`}>
                <FeedNavigation
                  handlefeedGrid={setGridNumber}
                  onSortChange={handleSortChange}
                  currentSort={sortOrder}
                />

                {/* Filters indicator */}
                {(selectedCategory || selectedSubCategory || searchValue) && (
                  <Card className="mb-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-800'} mr-2`}>Viewing : </span>
                        <span className="font-medium text-blue-600">
                          {searchValue ? `Search results for "${searchValue}"` : getCategoryName()}
                        </span>
                        {sortOrder !== "newest" && (
                          <span className="ml-2 text-gray-500">
                            (Sorted by: {sortOrder === "oldest" ? "Oldest first" : "Most popular"})
                          </span>
                        )}
                      </div>
                      <Button type="link" onClick={clearAllFilters}>
                        Clear All Filters
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Posts list */}
                {isFeedLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Spin size="default" />
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="text-center bg-white dark:bg-gray-800">
                    <div className="flex flex-col items-center justify-center py-5 px-6 text-center">
                      {/* SVG Illustration */}
                      <div className="mb-6">
                        <svg
                          width="120"
                          height="120"
                          viewBox="0 0 120 120"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={isDarkMode ? "text-gray-400" : "text-gray-300"}
                        >
                          {/* Background circle */}
                          <circle cx="60" cy="60" r="50" fill="currentColor" opacity="0.1" />

                          {/* Document stack */}
                          <rect x="35" y="45" width="40" height="50" rx="4" fill="currentColor" opacity="0.2" />
                          <rect x="40" y="40" width="40" height="50" rx="4" fill="currentColor" opacity="0.3" />
                          <rect x="45" y="35" width="40" height="50" rx="4" fill="currentColor" opacity="0.4" />

                          {/* Search magnifier */}
                          <circle cx="75" cy="45" r="12" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.6" />
                          <line x1="84" y1="54" x2="95" y2="65" stroke="currentColor" strokeWidth="3" opacity="0.6" />

                          {/* Sad face on document */}
                          <circle cx="60" cy="55" r="2" fill="currentColor" opacity="0.5" />
                          <circle cx="70" cy="55" r="2" fill="currentColor" opacity="0.5" />
                          <path d="M55 65 Q65 60 75 65" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
                        </svg>
                      </div>

                      {/* Main Message */}
                      <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        No posts found
                      </h3>

                      {/* Subtitle */}
                      <p className={`text-sm mb-6 max-w-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        There are no posts to display at the moment. Check back later or try adjusting your search criteria.
                      </p>
                    </div>
                  </Card>
                ) : (
                  <>
                    {/* Masonry layout for posts */}
                    <motion.div layout className="flex gap-4 mb-6">
                      {postColumns.map((column, columnIndex) => (
                        <div key={columnIndex} className="flex-1 flex flex-col gap-4">
                          {column.map((post) => (
                            <div key={post._id}>
                              <PostCard
                                postData={formatPostData(post)}
                                currentUser={currentUser}
                                onLike={handleLike}
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </motion.div>
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
                      {sortOrder !== "newest" && (
                        <span className="ml-2 text-gray-500">
                          (Sorted by: {sortOrder === "oldest" ? "Oldest first" : "Most popular"})
                        </span>
                      )}
                    </div>
                    <Button type="link" onClick={clearAllFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </Card>
              )}

              {isFeedLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Spin size="default" />
                </div>
              ) : posts.length === 0 ? (
                <Card className="text-center bg-white dark:bg-gray-800">
                  <div className="flex flex-col items-center justify-center py-5 px-6 text-center">
                    {/* SVG Illustration */}
                    <div className="mb-6">
                      <svg
                        width="120"
                        height="120"
                        viewBox="0 0 120 120"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={isDarkMode ? "text-gray-400" : "text-gray-300"}
                      >
                        {/* Background circle */}
                        <circle cx="60" cy="60" r="50" fill="currentColor" opacity="0.1" />

                        {/* Document stack */}
                        <rect x="35" y="45" width="40" height="50" rx="4" fill="currentColor" opacity="0.2" />
                        <rect x="40" y="40" width="40" height="50" rx="4" fill="currentColor" opacity="0.3" />
                        <rect x="45" y="35" width="40" height="50" rx="4" fill="currentColor" opacity="0.4" />

                        {/* Search magnifier */}
                        <circle cx="75" cy="45" r="12" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.6" />
                        <line x1="84" y1="54" x2="95" y2="65" stroke="currentColor" strokeWidth="3" opacity="0.6" />

                        {/* Sad face on document */}
                        <circle cx="60" cy="55" r="2" fill="currentColor" opacity="0.5" />
                        <circle cx="70" cy="55" r="2" fill="currentColor" opacity="0.5" />
                        <path d="M55 65 Q65 60 75 65" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
                      </svg>
                    </div>

                    {/* Main Message */}
                    <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      No posts found
                    </h3>

                    {/* Subtitle */}
                    <p className={`text-sm mb-6 max-w-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      There are no posts to display at the moment. Check back later or try adjusting your search criteria.
                    </p>
                  </div>
                </Card>
              ) : (
                <>
                  {/* Mobile masonry layout */}
                  <div className="flex gap-4">
                    {postColumns.map((column, columnIndex) => (
                      <div key={columnIndex} className="flex-1 flex flex-col gap-4">
                        {column.map((post) => (
                          <div key={post._id}>
                            <PostCard
                              postData={formatPostData(post)}
                              currentUser={currentUser}
                              onLike={handleLike}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </LayoutGroup>

        {/* Single Pagination component at the bottom */}
        {totalPages > 1 && (
          <div className="flex justify-center my-1">
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
      </main>
    </div>
  );
};

export default HomePage;