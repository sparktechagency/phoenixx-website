"use client";
import React, { useState } from 'react';
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

const { Title, Text } = Typography;

const CategoriesSidebar = () => {
  // Start with empty array (all categories collapsed)
  const [expandedKeys, setExpandedKeys] = useState([]);

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
    {
      key: '3',
      label: 'Fashion Trends',
      icon: <SkinOutlined />,
      posts: '65,023',
      expandable: false
    },
    {
      key: '4',
      label: 'Business of Design',
      icon: <ShopOutlined />,
      posts: '65,023',
      expandable: true,
      subcategories: [
        { label: 'Freelancing', posts: '9,876' },
        { label: 'Agency Management', posts: '5,432' }
      ]
    },
    {
      key: '5',
      label: 'Collaborations',
      icon: <TeamOutlined />,
      posts: '65,023',
      expandable: false
    },
  ];

  const toggleExpand = (key) => {
    setExpandedKeys(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key) // Remove if already expanded
        : [...prev, key]             // Add if collapsed
    );
  };

  return (
    <div className="w-md bg-white rounded-xl shadow-sm p-4">
      <h5 className="text-lg font-semibold px-2 mb-4">Categories</h5>
      <ul className="list-none p-0 m-0">
        {categories.map((item) => (
          <React.Fragment key={item.key}>
            <motion.li 
              className="py-3 px-2 cursor-pointer hover:bg-gray-50 transition-colors rounded-md"
              onClick={() => item.expandable && toggleExpand(item.key)}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 text-lg">{item.icon}</span>
                  <span className="text-gray-800 font-medium">{item.label}</span>
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
                        className="py-2 px-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
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