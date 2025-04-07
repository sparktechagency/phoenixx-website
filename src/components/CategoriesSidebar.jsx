"use client";
import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import {
  AppstoreOutlined,
  ToolOutlined,
  SkinOutlined,
  ShopOutlined,
  TeamOutlined,
  RightOutlined,
  DownOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategoriesQuery, useSubCategoryQuery } from '@/features/Category/CategoriesApi';

const CategoriesSidebar = () => {
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  const { data: cat, isLoading: categoryLoading, isError: categoryError } = useCategoriesQuery({ searchTerm: "" });
 
  console.log(cat?.data?.result)

  /* 
  category
: 
createdAt
: 
"2025-03-30T03:12:04.992Z"
description
: 
"gffsd"
id
: 
"67e8b68433e34068bb355466"
image
: "/images/chatgpt-image-mar-29,-2025,-12_15_35-pm-1743304348648.png"
name: "General"
postCount: 1
status: "active"
updatedAt: "2025-03-30T03:12:28.656Z"
_id: "67e8b68433e34068bb355466"
subcategories: Array(2)
{_id: '67e8c35e5365d889da3368d5', categoryId: '67e8b68433e34068bb355466', name: 'Technology', description: 'abc', image: '/images/chatgpt-image-mar-29,-2025,-12_15_35-pm-1743307614102.png', …} 
{_id: '67f0b9b9095d51688c46b474', categoryId: '67e8b68433e34068bb355466', name: 'Web Development', description: 'web dev', image: '/images/chatgpt-image-mar-29,-2025,-12_15_35-pm-1743829433089.png', …}
  
  
  */
  // const {data: subcategories , isLoading} = useSubCategoryQuery()


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

  // Device breakpoints
  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  const isDesktop = windowSize.width >= 1024;

  // Responsive styles
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

  const categories = [
    {
      key: '1',
      label: 'General',
      icon: <AppstoreOutlined />,
      posts: '42,943',
      expandable: false
    },
    {
      key: '2',
      label: 'Design Techniques',
      icon: <ToolOutlined />,
      posts: '65,023',
      expandable: true,
      subcategories: [
        { label: 'Color Theory', posts: '12,345' },
        { label: 'Typography', posts: '8,765' },
        { label: 'Layout Principles', posts: '15,678' },
        { label: 'UI/UX Patterns', posts: '28,235' }
      ]
    },
    // ... other categories
  ];

  const toggleExpand = (key) => {
    setExpandedKeys(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };



  if(categoryLoading){
    return "loading...."
  }

  return (
    <div className={`w-full bg-white rounded-xl shadow-sm ${getPadding()} sticky top-20`}>
      <h5 className={`${getTitleSize()} font-semibold px-2 mb-4`}>Categories</h5>
      <ul className="list-none p-0 m-0">
        {categories.map((item) => (
          <React.Fragment key={item.key}>
            <motion.li 
              className={`${isMobile ? 'py-2' : 'py-3'} px-2 cursor-pointer hover:bg-gray-50 rounded-md`}
              onClick={() => item.expandable && toggleExpand(item.key)}
              whileHover={!isMobile ? { scale: 1.02 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 text-lg">{item.icon}</span>
                  <span className={`text-gray-800 ${getItemTextSize()}`}>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{item.posts} Posts</span>
                  {item.expandable && (
                    expandedKeys.includes(item.key) 
                      ? <DownOutlined className="text-xs text-gray-400" /> 
                      : <RightOutlined className="text-xs text-gray-400" />
                  )}
                </div>
              </div>
            </motion.li>

            <AnimatePresence>
              {item.expandable && expandedKeys.includes(item.key) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <ul className="pl-8 list-none">
                    {item.subcategories?.map((sub, index) => (
                      <motion.li
                        key={index}
                        className="py-1.5 px-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex justify-between">
                          <span>{sub.label}</span>
                          <span className="text-xs text-gray-400">{sub.posts}</span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesSidebar;