"use client";

import Banner from '@/components/Banner';
import CategoriesSidebar from '@/components/CategoriesSidebar';
import FeedNavigation from '@/components/FeedNavigation';
import PostCard from '@/components/PostCard';
import { useGetPostQuery, useLikePostMutation } from '@/features/post/postApi';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Card, Pagination, Spin } from 'antd';
import moment from 'moment';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ThemeContext } from './ClientLayout';

const HomePage = () => {
  // Hooks and context
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDarkMode } = useContext(ThemeContext);
  const postsContainerRef = useRef(null);

  // Extract URL parameters with defaults
  const urlParams = useMemo(() => ({
    search: searchParams.get("search"),
    page: parseInt(searchParams.get("page") || "1"),
    category: searchParams.get("category"),
    subcategory: searchParams.get("subcategory"),
    sort: searchParams.get("sort") || "newest",
    limit: parseInt(searchParams.get("limit") || "10")
  }), [searchParams]);

  // State management
  const [gridNumber, setGridNumber] = useState(1);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [currentUser, setCurrentUser] = useState({ id: null });
  const [isScrolling, setIsScrolling] = useState(false);

  // Initialize user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUser({ id: localStorage.getItem("login_user_id") });
    }
  }, []);

  // Window resize handler with debounce
  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Scroll handler with cleanup
  useEffect(() => {
    const container = postsContainerRef.current;
    if (!container) return;

    let scrollTimeout;
    let animationFrame;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setIsScrolling(false), 100);

      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => { });
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  // API query params
  const queryParams = useMemo(() => ({
    ...(urlParams.search && { searchTerm: urlParams.search }),
    ...(urlParams.category && { category: urlParams.category }),
    ...(urlParams.subcategory && { subCategory: urlParams.subcategory }),
    sort: urlParams.sort,
    page: urlParams.page,
    limit: urlParams.limit
  }), [urlParams]);

  // API calls
  const { data, isLoading, error, refetch } = useGetPostQuery(queryParams);
  const [likePost] = useLikePostMutation();

  // Extract data from API response
  const { posts, pagination } = useMemo(() => {
    const postsData = data?.data?.data || [];
    const meta = data?.data?.meta || {};

    return {
      posts: postsData,
      pagination: {
        currentPage: meta.page || urlParams.page,
        postsPerPage: meta.limit || urlParams.limit,
        totalPosts: meta.total || 0,
        totalPages: meta.totalPage || Math.ceil((meta.total || 0) / (meta.limit || urlParams.limit))
      }
    };
  }, [data, urlParams]);

  // Layout calculations
  const { isDesktop, isGrid2, columnCount } = useMemo(() => {
    const desktop = windowWidth >= 1024;
    const grid2 = gridNumber === 2 && desktop;

    let columns = 1;
    if (windowWidth >= 1024) {
      columns = grid2 ? 2 : 1;
    } else if (windowWidth >= 640) {
      columns = gridNumber === 2 ? 2 : 1;
    }

    return {
      isDesktop: desktop,
      isGrid2: grid2,
      columnCount: columns
    };
  }, [windowWidth, gridNumber]);

  // Utility functions
  const formatTime = useCallback((timestamp) => (
    timestamp ? moment.utc(timestamp).utcOffset(6).fromNow() : "Just now"
  ), []);

  const formatPostData = useCallback((post) => ({
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
    tags: [{
      category: post.category?.name,
      subcategory: post.subCategory?.name
    }],
    stats: {
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0,
      reads: post.views || 0,
      likedBy: post.likes || []
    },
    isLiked: post.likes?.includes(currentUser.id) || false
  }), [formatTime, currentUser.id]);

  // Distribute posts into columns
  const postColumns = useMemo(() => {
    if (!posts.length) return Array(columnCount).fill([]);
    const columns = Array(columnCount).fill().map(() => []);
    posts.forEach((post, index) => columns[index % columnCount].push(post));
    return columns;
  }, [posts, columnCount]);

  const getCategoryName = useCallback(() => {
    if (urlParams.subcategory) {
      const post = posts.find(p => p.subCategory?._id === urlParams.subcategory);
      return post?.subCategory?.name || "Selected Subcategory";
    }
    if (urlParams.category) {
      const post = posts.find(p => p.category?._id === urlParams.category);
      return post?.category?.name || "Selected Category";
    }
    return "All Posts";
  }, [posts, urlParams.subcategory, urlParams.category]);

  // Event handlers
  const handleLike = useCallback(async (postId) => {
    try {
      await likePost(postId).unwrap();
    } catch (error) {
      console.error("Like error:", error);
    }
  }, [likePost]);

  // Fixed category selection handler
  const handleCategorySelect = useCallback((categoryId, subCategoryId = null) => {
    const newParams = new URLSearchParams(searchParams.toString());

    // Clear existing category/subcategory params
    newParams.delete('category');
    newParams.delete('subcategory');

    // Set new params
    if (categoryId) newParams.set('category', categoryId);
    if (subCategoryId) newParams.set('subcategory', subCategoryId);
    newParams.set('page', '1');

    // Use router.push instead of replaceState to maintain smooth navigation
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const updateUrlParams = useCallback((params) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      value ? newParams.set(key, value) : newParams.delete(key);
    });
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const handleSortChange = useCallback((sortOption) => {
    updateUrlParams({ sort: sortOption, page: 1 });
  }, [updateUrlParams]);

  const handlePageChange = useCallback((page) => {
    updateUrlParams({ page });
    // Smooth scroll to top only for pagination
    if (postsContainerRef.current) {
      postsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [updateUrlParams]);

  const clearAllFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  // Component definitions
  const LoadingSkeleton = () => (
    <div className={`${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="h-64 bg-gray-200 dark:bg-gray-700"></div>
      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-5">
          <div className="hidden lg:block w-3/12 pr-6 sticky top-20 self-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mb-3">
                  <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full lg:w-6/12">
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
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
        </div>
      </main>
    </div>
  );

  const EmptyState = () => (
    <Card className="text-center bg-white dark:bg-gray-800">
      <div className="flex flex-col items-center justify-center py-5 px-6 text-center">
        <div className="mb-6">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isDarkMode ? "text-gray-400" : "text-gray-300"}
          >
            <circle cx="60" cy="60" r="50" fill="currentColor" opacity="0.1" />
            <rect x="35" y="45" width="40" height="50" rx="4" fill="currentColor" opacity="0.2" />
            <rect x="40" y="40" width="40" height="50" rx="4" fill="currentColor" opacity="0.3" />
            <rect x="45" y="35" width="40" height="50" rx="4" fill="currentColor" opacity="0.4" />
            <circle cx="75" cy="45" r="12" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.6" />
            <line x1="84" y1="54" x2="95" y2="65" stroke="currentColor" strokeWidth="3" opacity="0.6" />
            <circle cx="60" cy="55" r="2" fill="currentColor" opacity="0.5" />
            <circle cx="70" cy="55" r="2" fill="currentColor" opacity="0.5" />
            <path d="M55 65 Q65 60 75 65" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
          </svg>
        </div>
        <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          No posts found
        </h3>
        <p className={`text-sm mb-6 max-w-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          There are no posts to display at the moment. Check back later or try adjusting your search criteria.
        </p>
      </div>
    </Card>
  );

  const PostsGrid = () => (
    <div
      ref={postsContainerRef}
      className={`flex gap-4 mb-6 transition-all duration-300 ${isScrolling ? 'scroll-smooth' : ''}`}
      style={{
        scrollBehavior: 'smooth',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {isLoading ? <div className='flex justify-center h-[300px]'><Spin size='default' /></div> : postColumns.map((column, columnIndex) => (
        <div key={columnIndex} className="flex-1 flex flex-col gap-4">
          {column.map((post) => (
            <PostCard
              key={post._id}
              postData={formatPostData(post)}
              currentUser={currentUser}
              onLike={handleLike}
              className="transition-transform duration-200 hover:scale-[1.01]"
            />
          ))}
        </div>
      ))}
    </div>
  );

  const FilterIndicator = () => {
    if (!urlParams.category && !urlParams.subcategory && !urlParams.search) return null;

    return (
      <Card className="mb-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`${isDarkMode ? 'text-white' : 'text-gray-800'} mr-2`}>Viewing: </span>
            <span className="font-medium text-blue-600">
              {urlParams.search ? `Search results for "${urlParams.search}"` : getCategoryName()}
            </span>
            {urlParams.sort !== "newest" && (
              <span className="ml-2 text-gray-500">
                (Sorted by: {urlParams.sort === "oldest" ? "Oldest first" : "Most popular"})
              </span>
            )}
          </div>
          <Button type="link" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </div>
      </Card>
    );
  };

  // Loading and error states
  if (isLoading) return <LoadingSkeleton />;
  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <Card className="text-center">
        <EmptyState />
      </Card>
    </div>
  );

  // Main render
  return (
    <div className={`${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Banner />
      <main className="container mx-auto px-4 py-6">
        {isDesktop ? (
          <div className="flex">
            <div className={`${isGrid2 ? 'w-3/12 pr-6' : 'w-3/12 pr-6 sticky top-20 self-start'}`}>
              <CategoriesSidebar
                onSelectCategory={handleCategorySelect}
                selectedCategory={urlParams.category}
                selectedSubCategory={urlParams.subcategory}
              />
            </div>

            <section className={`${isGrid2 ? 'w-9/12' : 'w-6/12'} flex flex-col gap-3`}>
              <FeedNavigation
                handlefeedGrid={setGridNumber}
                onSortChange={handleSortChange}
                currentSort={urlParams.sort}
              />

              <FilterIndicator />

              {/* Loading state for category changes */}
              {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <Spin size="default" />
                </div>
              ) : posts.length === 0 ? (
                <EmptyState />
              ) : (
                <PostsGrid />
              )}
            </section>
          </div>
        ) : (
          <div className="flex flex-col">
            <CategoriesSidebar
              onSelectCategory={handleCategorySelect}
              selectedCategory={urlParams.category}
              selectedSubCategory={urlParams.subcategory}
            />
            <FeedNavigation
              handlefeedGrid={setGridNumber}
              onSortChange={handleSortChange}
              currentSort={urlParams.sort}
            />

            <FilterIndicator />

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="default" />
              </div>
            ) : posts.length === 0 ? (
              <EmptyState />
            ) : (
              <PostsGrid />
            )}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center my-1">
            <Pagination
              current={pagination.currentPage}
              total={pagination.totalPosts}
              pageSize={pagination.postsPerPage}
              onChange={handlePageChange}
              showSizeChanger={false}
              itemRender={(current, type, originalElement) => {
                if (type === 'prev') return <Button icon={<LeftOutlined />} />;
                if (type === 'next') return <Button icon={<RightOutlined />} />;
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