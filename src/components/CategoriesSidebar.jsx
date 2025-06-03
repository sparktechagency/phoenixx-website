"use client";

import { useCategoriesQuery } from '@/features/Category/CategoriesApi';
import { DownOutlined, RightOutlined, UnorderedListOutlined } from '@ant-design/icons';
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

  // Get categories from API response
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

  // Auto-expand the category when a subcategory is selected
  useEffect(() => {
    if (selectedSubCategory && selectedCategory) {
      setExpandedKeys(prev => [...prev, selectedCategory]);
    }
  }, [selectedCategory, selectedSubCategory]);

  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  const isDesktop = windowSize.width >= 1024;

  const getPadding = () => {
    if (isMobile) return 'p-2';
    if (isTablet) return 'p-3';
    return 'p-4';
  };

  const getTitleSize = () => {
    if (isMobile) return 'text-md';
    if (isTablet) return 'text-lg';
    return 'text-xl';
  };

  const getItemTextSize = () => {
    if (isMobile) return 'text-sm';
    if (isTablet) return 'text-base';
    return 'text-medium';
  };

  const toggleExpand = (key) => {
    setExpandedKeys(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleCategoryClick = (categoryId) => {
    const category = categories.find(item => item.category._id === categoryId);
    const hasSubcategories = category?.subcategories?.length > 0;
    const isExpanded = expandedKeys.includes(categoryId);

    if (hasSubcategories) {
      toggleExpand(categoryId);

      // Only select the category if it's already expanded (meaning user clicked it again to select)
      if (isExpanded && (!selectedSubCategory || selectedCategory !== categoryId)) {
        onSelectCategory(categoryId, "");
      }
    } else {
      // For categories without subcategories, select immediately
      onSelectCategory(categoryId, "");
    }
  };

  const handleSubcategoryClick = (categoryId, subcategoryId, event) => {
    event.stopPropagation();
    // Select both category and subcategory
    onSelectCategory(categoryId, subcategoryId);
  };

  const handleShowAllPosts = () => {
    onSelectCategory("", "");
    setExpandedKeys([]);
  };

  const getTotalPosts = () => {
    let total = 0;
    categories.forEach(item => {
      total += item.category.postCount || 0;
    });
    return total;
  };

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
          <div
            className={`${isMobile ? 'py-2' : 'py-3'} px-2 cursor-pointer rounded-md mb-3 ${!selectedCategory && !selectedSubCategory
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
              <span className={`text-lg border-[1px] rounded shadow-md px-3 py-[6px] ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-600'}`}>
                <UnorderedListOutlined size={30} />
              </span>
              <div className='flex flex-col gap-1'>
                <span className={`font-medium ${getItemTextSize()} ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>
                  All Posts
                </span>
                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {getTotalPosts()} Posts
                </span>
              </div>
            </div>
          </div>

          <ul className="list-none p-0 m-0">
            {categories.map((item) => {
              const category = item.category;
              const subcategories = item.subcategories || [];
              const hasSubcategories = subcategories.length > 0;
              const key = category._id;
              const isSelected = selectedCategory === category._id && !selectedSubCategory;
              const isExpanded = expandedKeys.includes(key);

              return (
                <React.Fragment key={key}>
                  <li
                    className={`${isMobile ? 'py-2' : 'py-3'} px-2 cursor-pointer rounded-md ${isSelected
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
                      <div className="flex items-center gap-3">
                        <span className={`text-lg border-[1px] rounded shadow-md p-1.5 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                          {category?.image ? (
                            <Image
                              src={`${baseURL}${category?.image}`}
                              height={40}
                              width={35}
                              alt={category?.name || "Category image"}
                            />
                          ) : (
                            <div className="h-10 w-8 bg-gray-200 flex items-center justify-center">
                              <UnorderedListOutlined />
                            </div>
                          )}
                        </span>
                        <div className='flex flex-col gap-1'>
                          <span className={`font-medium ${getItemTextSize()} ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>
                            {category.name}
                          </span>
                          <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {category.postCount || 0} Posts
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasSubcategories && (
                          <span>
                            {isExpanded
                              ? <DownOutlined className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} />
                              : <RightOutlined className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} />
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </li>

                  {hasSubcategories && isExpanded && (
                    <ul className="pl-8 list-none cursor-pointer">
                      {subcategories.map((subcategory) => {
                        const isSubSelected = selectedSubCategory === subcategory._id;
                        return (
                          <li
                            key={subcategory._id}
                            className={`py-1.5 px-2 text-sm rounded-md ${isSubSelected
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
                                <span className={`text-lg border-[1px] rounded shadow-md p-1.5 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                  {subcategory?.image ? (
                                    <Image
                                      src={`${baseURL}${subcategory.image}`}
                                      height={28}
                                      width={28}
                                      alt={subcategory?.name || "Subcategory image"}
                                    />
                                  ) : (
                                    <div className="h-7 w-7 bg-gray-200 flex items-center justify-center text-xs">
                                      {subcategory.name?.charAt(0)}
                                    </div>
                                  )}
                                </span>
                                <div className='flex flex-col gap-1'>
                                  <span className={`font-medium ${getItemTextSize()} ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>
                                    {subcategory.name}
                                  </span>
                                  <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    {subcategory.postCount || 0} Posts
                                  </span>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
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