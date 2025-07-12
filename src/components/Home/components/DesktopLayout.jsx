'use client'

import { useTransition } from 'react';
import CategoriesSidebar from '../../CategoriesSidebar';
import FeedNavigation from '../../FeedNavigation';
import FilterIndicator from './FilterIndicator';
import MainContent from './MainContent';

const DesktopLayout = ({
  gridNumber,
  setGridNumber,
  urlParams,
  posts,
  pagination,
  currentUser,
  onCategorySelect,
  onSortChange,
  onPageChange,
  onLike,
  likePostLoading,
  onClearFilters,
  isLoading,
}) => {
  const isGrid2 = gridNumber === 2;
  const [isPending, startTransition] = useTransition();

  // Wrap category selection in transition for smoother updates
  const handleCategorySelect = (category, subcategory) => {
    startTransition(() => {
      onCategorySelect(category, subcategory);
    });
  };

  const handleSortChange = (sortOption) => {
    startTransition(() => {
      onSortChange(sortOption);
    });
  };

  return (
    <div className="flex">
      <aside className={`${isGrid2 ? 'w-3/12 pr-6' : 'w-3/12 pr-6 sticky top-20 self-start'}`}>
        <CategoriesSidebar
          onSelectCategory={handleCategorySelect}
          selectedCategory={urlParams.category}
          selectedSubCategory={urlParams.subcategory}
        />
      </aside>

      <section className={`${isGrid2 ? 'w-9/12' : 'w-6/12'} flex flex-col gap-3`}>
        <FeedNavigation
          handlefeedGrid={setGridNumber}
          onSortChange={handleSortChange}
          currentSort={urlParams.sort}
        />

        <FilterIndicator
          urlParams={urlParams}
          posts={posts}
          onClearFilters={onClearFilters}
        />

        {/* Content container with stable height and smooth transitions */}
        <div
          className={`
            relative transition-opacity duration-300 ease-in-out
          `}
          style={{ minHeight: '600px' }} // Prevent height collapse
        >

          <MainContent
            posts={posts}
            pagination={pagination}
            currentUser={currentUser}
            gridNumber={gridNumber}
            onLike={onLike}
            onPageChange={onPageChange}
            isLoading={isLoading}
            likePostLoading={likePostLoading}
          />
        </div>
      </section>
    </div>
  );
};

export default DesktopLayout;