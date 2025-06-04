"use client";

import { useCategoriesQuery } from '@/features/Category/CategoriesApi';
import { DownOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import Image from 'next/image';
import React, { useContext, useEffect, useState } from 'react';
import { baseURL } from '../../utils/BaseURL';
import { ThemeContext } from '../app/ClientLayout';

const CategoriesSidebar = ({ onSelectCategory, selectedCategory, selectedSubCategory }) => {
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  const { data: categoryData, isLoading: categoryLoading } = useCategoriesQuery();
  const categories = categoryData?.data?.result || [];
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-expand parent category when subcategory is selected
  useEffect(() => {
    if (selectedSubCategory && selectedCategory && !expandedKeys.includes(selectedCategory)) {
      setExpandedKeys(prev => [...prev, selectedCategory]);
    }
  }, [selectedCategory, selectedSubCategory, expandedKeys]);

  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  const isDesktop = windowSize.width >= 1024;

  const getPadding = () => isMobile ? 'p-2' : isTablet ? 'p-3' : 'p-4';
  const getTitleSize = () => isMobile ? 'text-md' : isTablet ? 'text-lg' : 'text-xl';
  const getItemTextSize = () => isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-medium';

  const toggleExpand = (key) => {
    setExpandedKeys(prev => prev.includes(key)
      ? prev.filter(k => k !== key)
      : [...prev, key]
    );
  };

  const handleCategoryClick = (categoryId) => {
    const category = categories.find(item => item.category._id === categoryId);
    const hasSubcategories = category?.subcategories?.length > 0;

    // Always select the category first to show its posts
    onSelectCategory(categoryId, "");

    // Toggle expand if has subcategories
    if (hasSubcategories) {
      toggleExpand(categoryId);
    }
  };

  const handleExpandClick = (categoryId, event) => {
    event.stopPropagation();
    toggleExpand(categoryId);
  };

  const handleSubcategoryClick = (categoryId, subcategoryId, event) => {
    event.stopPropagation();
    onSelectCategory(categoryId, subcategoryId);
  };

  const handleShowAllPosts = () => {
    onSelectCategory("", "");
  };

  const getTotalPosts = () => categories.reduce((total, item) => total + (item.category.postCount || 0), 0);

  return (
    <div className={`w-full shadow rounded-xl ${getPadding()} sm:sticky sm:top-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h5 className={`${getTitleSize()} font-semibold px-2 mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        Categories
      </h5>

      {categoryLoading ? (
        <div className='flex justify-center'>
          <Spin className={isDarkMode ? 'text-white' : ''} />
        </div>
      ) : (
        <>
          {/* All Posts Button */}
          <div
            className={`group ${isMobile ? 'py-2' : 'py-3'} px-2 cursor-pointer rounded-md mb-3 transition-all duration-200 ${!selectedCategory && !selectedSubCategory
              ? isDarkMode
                ? 'bg-gray-700 border-l-4 border-blue-400'
                : 'bg-blue-50 border-l-4 border-blue-500'
              : isDarkMode
                ? 'hover:bg-gray-700'
                : 'hover:bg-gray-50'
              }`}
            onClick={handleShowAllPosts}
          >
            <div className="flex items-center gap-3">
              <span className={`text-lg border-[1px] rounded shadow-md px-3 py-[6px] transition-colors duration-200 ${isDarkMode
                ? !selectedCategory && !selectedSubCategory
                  ? 'border-blue-400 text-blue-300'
                  : 'border-gray-600 text-gray-300 group-hover:border-gray-500'
                : !selectedCategory && !selectedSubCategory
                  ? 'border-blue-500 text-blue-600'
                  : 'border-gray-300 text-gray-600 group-hover:border-gray-400'
                }`}>
                <UnorderedListOutlined />
              </span>
              <div className='flex flex-col gap-1'>
                <span className={`font-medium ${getItemTextSize()} ${isDarkMode
                  ? !selectedCategory && !selectedSubCategory
                    ? 'text-blue-300'
                    : 'text-gray-300'
                  : !selectedCategory && !selectedSubCategory
                    ? 'text-blue-600'
                    : 'text-gray-800'
                  }`}>
                  All Posts
                </span>
                <span className={`text-xs ${isDarkMode
                  ? !selectedCategory && !selectedSubCategory
                    ? 'text-blue-300/80'
                    : 'text-gray-400'
                  : !selectedCategory && !selectedSubCategory
                    ? 'text-blue-600/80'
                    : 'text-gray-500'
                  }`}>
                  {getTotalPosts()} Posts
                </span>
              </div>
            </div>
          </div>

          {/* Categories List */}
          <ul className="list-none p-0 m-0 space-y-1">
            {categories.map((item) => {
              const category = item.category;
              const subcategories = item.subcategories || [];
              const hasSubcategories = subcategories.length > 0;
              const key = category._id;
              const isSelected = selectedCategory === category._id && !selectedSubCategory;
              const isExpanded = expandedKeys.includes(key);

              return (
                <React.Fragment key={key}>
                  {/* Category Item */}
                  <li
                    className={`group ${isMobile ? 'py-2' : 'py-3'} px-2 cursor-pointer rounded-md transition-all duration-200 ${isSelected
                      ? isDarkMode
                        ? 'bg-gray-700 border-l-4 border-blue-400'
                        : 'bg-blue-50 border-l-4 border-blue-500'
                      : isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-50'
                      }`}
                    onClick={() => handleCategoryClick(category._id)}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-3 flex-1">
                        <span className={`text-lg border-[1px] rounded shadow-md p-1.5 transition-colors duration-200 ${isDarkMode
                          ? isSelected
                            ? 'border-blue-400'
                            : 'border-gray-600 group-hover:border-gray-500'
                          : isSelected
                            ? 'border-blue-500'
                            : 'border-gray-300 group-hover:border-gray-400'
                          }`}>
                          {category?.image ? (
                            <Image
  src={`${baseURL}${category?.image}`}
  height={40}
  width={35}
  alt={category?.name || "Category image"}
  className={`object-contain ${isDarkMode ? 'filter brightness-90 invert-[0.1]' : ''}`}
/>
                          ) : (
                            <div className={`h-10 w-8 flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                              }`}>
                              <UnorderedListOutlined className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                            </div>
                          )}
                        </span>
                        <div className='flex flex-col gap-1 flex-1'>
                          <span className={`font-medium ${getItemTextSize()} ${isDarkMode
                            ? isSelected
                              ? 'text-blue-300'
                              : 'text-gray-300'
                            : isSelected
                              ? 'text-blue-600'
                              : 'text-gray-800'
                            }`}>
                            {category.name}
                          </span>
                          <span className={`text-xs ${isDarkMode
                            ? isSelected
                              ? 'text-blue-300/80'
                              : 'text-gray-400'
                            : isSelected
                              ? 'text-blue-600/80'
                              : 'text-gray-500'
                            }`}>
                            {category.postCount || 0} Posts

                          </span>
                        </div>
                      </div>
                      {hasSubcategories && (
                        <div
                          className={`p-2 -mr-2 rounded transition-all duration-200 ${isDarkMode
                            ? 'hover:bg-gray-600 hover:bg-opacity-40'
                            : 'hover:bg-gray-200 hover:bg-opacity-60'
                            }`}
                          onClick={(e) => handleExpandClick(category._id, e)}
                        >
                          <span className={`block transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'
                            }`}>
                            <DownOutlined className={`text-xs ${isDarkMode
                              ? isSelected
                                ? 'text-blue-300'
                                : 'text-gray-400'
                              : isSelected
                                ? 'text-blue-600'
                                : 'text-gray-400'
                              }`} />
                          </span>
                        </div>
                      )}
                    </div>
                  </li>

                  {/* Subcategories */}
                  {hasSubcategories && (
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <ul className="pl-8 list-none space-y-1 mt-1 mb-2">
                        {subcategories.map((subcategory) => {
                          const isSubSelected = selectedSubCategory === subcategory._id && selectedCategory === category._id;
                          return (
                            <li
                              key={subcategory._id}
                              className={`py-2 px-2 text-sm rounded-md transition-all duration-200 ${isSubSelected
                                ? isDarkMode
                                  ? 'bg-gray-700 border-l-4 border-blue-400'
                                  : 'bg-blue-50 border-l-4 border-blue-500'
                                : isDarkMode
                                  ? 'hover:bg-gray-700'
                                  : 'hover:bg-gray-50'
                                }`}
                              onClick={(e) => handleSubcategoryClick(category._id, subcategory._id, e)}
                            >
                              <div className="flex justify-between">
                                <div className="flex items-center gap-3 cursor-pointer">
                                  <span className={`text-lg border-[1px] rounded shadow-md p-1.5 transition-colors duration-200 ${isDarkMode
                                    ? isSubSelected
                                      ? 'border-blue-400'
                                      : 'border-gray-600'
                                    : isSubSelected
                                      ? 'border-blue-500'
                                      : 'border-gray-300'
                                    }`}>
                                    {subcategory?.image ? (
                                      <Image
                                        src={`${baseURL}${subcategory.image}`}
                                        height={28}
                                        width={28}
                                        alt={subcategory?.name || "Subcategory image"}
                                        className="object-contain"
                                      />
                                    ) : (
                                      <div className={`h-7 w-7 flex items-center justify-center text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                        }`}>
                                        {subcategory.name?.charAt(0)}
                                      </div>
                                    )}
                                  </span>
                                  <div className='flex flex-col gap-1'>
                                    <span className={`font-medium ${getItemTextSize()} ${isDarkMode
                                      ? isSubSelected
                                        ? 'text-blue-300'
                                        : 'text-gray-300'
                                      : isSubSelected
                                        ? 'text-blue-600'
                                        : 'text-gray-800'
                                      }`}>
                                      {subcategory.name}
                                    </span>
                                    <span className={`text-xs ${isDarkMode
                                      ? isSubSelected
                                        ? 'text-blue-300/80'
                                        : 'text-gray-400'
                                      : isSubSelected
                                        ? 'text-blue-600/80'
                                        : 'text-gray-500'
                                      }`}>
                                      {subcategory.postCount || 0} Posts
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default CategoriesSidebar;