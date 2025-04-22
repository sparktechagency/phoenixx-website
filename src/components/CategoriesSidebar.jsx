"use client";
import React, { useState, useEffect, useContext } from 'react';
import {
  AppstoreOutlined,
  ToolOutlined,
  SkinOutlined,
  ShopOutlined,
  TeamOutlined,
  RightOutlined,
  DownOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { Manufacturing, Marketing, Selling, SvgImage } from '../../utils/svgImage';
import { useCategoriesQuery, useSubCategoryQuery } from '@/features/Category/CategoriesApi';
import { Spin } from 'antd';
import { ThemeContext } from '@/app/layout';

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
    onSelectCategory(categoryId, "");
    if (expandedKeys.includes(categoryId)) {
      toggleExpand(categoryId);
    } else {
      setExpandedKeys([...expandedKeys, categoryId]);
    }
  };

  const handleSubcategoryClick = (categoryId, subcategoryId) => {
    onSelectCategory(categoryId, subcategoryId);
  };
  
  const handleShowAllPosts = () => {
    onSelectCategory("", "");
  };

  const getCategoryIcon = (categoryName) => {
    switch(categoryName) {
      case 'Technology':
        return <ToolOutlined />;
      case 'Physics':
        return <AppstoreOutlined />;
      case 'JavaScript':
        return <AppstoreOutlined />;
      default:
        return <AppstoreOutlined />;
    }
  };

  const getSubcategoryIcon = (subcategoryName) => {
    switch(subcategoryName) {
      case 'Web Development':
        return <Marketing />;
      case 'Physics Motion':
        return <Selling />;
      case 'React.js':
        return <Marketing />;
      case 'Next.js':
        return <Selling />;
      default:
        return <Manufacturing />;
    }
  };

  

  return (
    <div className={`w-full ${isDarkMode ? 'dark-mode' : 'light-mode'} rounded-xl ${getPadding()} sm:sticky sm:top-20`}>
      <h5 className={`${getTitleSize()} font-semibold px-2 mb-4`}>Categories</h5>
      
      {/* All Posts Button */}
      {categoryLoading ? <div className='flex justify-center'><Spin size='small' /></div> : <><div 
        className={`${isMobile ? 'py-2' : 'py-3'} px-2 cursor-pointer hover:bg-gray-50 rounded-md transition-all duration-200 ease-in-out mb-3 ${
          !selectedCategory && !selectedSubCategory ? 'bg-blue-50 border-l-4 border-blue-500' : ''
        }`}
        onClick={handleShowAllPosts}
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-lg border-[1px] rounded shadow-md border-gray-300 px-1.5">
            <UnorderedListOutlined />
          </span>
          <span className={`text-gray-800 font-medium ${getItemTextSize()}`}>
            All Posts
          </span>
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
                className={`${isMobile ? 'py-2' : 'py-3'} px-2 cursor-pointer hover:bg-gray-50 rounded-md transition-all duration-200 ease-in-out ${
                  isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => handleCategoryClick(category._id)}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-lg border-[1px] rounded shadow-md border-gray-300 px-1.5">
                      {getCategoryIcon(category.name)}
                    </span>
                    <div className='flex flex-col gap-1'>
                      <span className={`text-gray-800 font-medium ${getItemTextSize()}`}>
                        {category.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {category.postCount || 0} Posts
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasSubcategories && (
                      <span className="transition-transform duration-300 ease-in-out">
                        {isExpanded 
                          ? <DownOutlined className="text-xs text-gray-400" /> 
                          : <RightOutlined className="text-xs text-gray-400" />
                        }
                      </span>
                    )}
                  </div>
                </div>
              </li>

              {hasSubcategories && (
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  style={{ 
                    transitionProperty: 'max-height, opacity',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' 
                  }}
                >
                  <ul className="pl-8 list-none">
                    {subcategories.map((subcategory, index) => {
                      const isSubSelected = selectedSubCategory === subcategory._id;
                      return (
                        <li
                          key={subcategory._id}
                          className={`py-1.5 px-2 text-sm hover:bg-gray-50 rounded-md transition-all duration-200 ease-in-out ${
                            isSubSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                          onClick={() => handleSubcategoryClick(category._id, subcategory._id)}
                          style={{ 
                            transitionDelay: `${index * 50}ms`, 
                            opacity: isExpanded ? 1 : 0,
                            transform: isExpanded ? 'translateX(0)' : 'translateX(-10px)',
                            transition: 'opacity 300ms ease, transform 300ms ease' 
                          }}
                        >
                          <div className="flex justify-between">
                            <div className="flex items-center gap-3 cursor-pointer">
                              <span className="text-gray-600 text-lg border-[1px] rounded shadow-md border-gray-300 p-1.5">
                                {getSubcategoryIcon(subcategory.name)}
                              </span>
                              <div className='flex flex-col gap-1'>
                                <span className={`text-gray-800 font-medium ${getItemTextSize()}`}>
                                  {subcategory.name}
                                </span>
                                <span className="text-xs text-gray-500">
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
      </ul></>}
    </div>
  );
};

export default CategoriesSidebar;