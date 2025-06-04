"use client";

import { useCategoriesQuery } from '@/features/Category/CategoriesApi';
import { DownOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Collapse, Spin, Typography } from 'antd';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import { baseURL } from '../../utils/BaseURL';
import { ThemeContext } from '../app/ClientLayout';

const { Title, Text } = Typography;
const { Panel } = Collapse;

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

  const getTotalPosts = () => categories.reduce((total, item) => total + (item.category.postCount || 0), 0);

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

  const toggleExpand = (key) => {
    setExpandedKeys(prev => prev.includes(key)
      ? prev.filter(k => k !== key)
      : [...prev, key]
    );
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

  // Custom styles for dark mode
  const cardStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderColor: isDarkMode ? '#374151' : '#d1d5db',
  };

  const titleStyle = {
    color: isDarkMode ? '#e5e7eb' : '#1f2937',
    marginBottom: 16,
  };

  const getButtonType = (isSelected) => {
    if (isSelected) {
      return 'primary';
    }
    return 'text';
  };

  const getButtonStyle = (isSelected) => ({
    width: '100%',
    height: 'auto',
    padding: isMobile ? '8px 12px' : '12px 16px',
    marginBottom: 4,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    textAlign: 'left',
    backgroundColor: isSelected
      ? (isDarkMode ? '#1d4ed8' : '#3b82f6')
      : (isDarkMode ? 'transparent' : 'transparent'),
    borderColor: isSelected
      ? (isDarkMode ? '#1d4ed8' : '#3b82f6')
      : 'transparent',
    color: isSelected
      ? '#ffffff'
      : (isDarkMode ? '#e5e7eb' : '#374151'),
    borderLeft: isSelected ? `4px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}` : 'none',
  });

  const renderCategoryAvatar = (category, isSelected) => {
    if (category?.image) {
      return (
        <Avatar
        shape='square'
          size={isMobile ? 32 : 40}
          src={
            <Image
              src={`${baseURL}${category.image}`}
              alt={category?.name || "Category image"}
              width={isMobile ? 32 : 40}
              height={isMobile ? 32 : 40}
              style={{ objectFit: 'contain' }}
            />
          }
          style={{
            border: `1px solid ${isDarkMode
              ? (isSelected ? '#60a5fa' : '#4b5563')
              : (isSelected ? '#3b82f6' : '#d1d5db')
              }`,
            backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
          }}
        />
      );
    }

    return (
      <Avatar
      shape='square'
        size={isMobile ? 32 : 40}
        icon={<UnorderedListOutlined />}
        style={{
          border: `1px solid ${isDarkMode
            ? (isSelected ? '#60a5fa' : '#4b5563')
            : (isSelected ? '#3b82f6' : '#d1d5db')
            }`,
          backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
          color: isDarkMode ? '#e5e7eb' : '#374151',
        }}
      />
    );
  };

  const renderSubcategoryAvatar = (subcategory, isSelected) => {
    if (subcategory?.image) {
      return (
        <Avatar
          shape='square'
          size={28}
          src={
            <Image
              src={`${baseURL}${subcategory.image}`}
              alt={subcategory?.name || "Subcategory image"}
              width={28}
              height={28}
              style={{ objectFit: 'contain' }}
            />
          }
          style={{
            border: `1px solid ${isDarkMode
              ? (isSelected ? '#60a5fa' : '#4b5563')
              : (isSelected ? '#3b82f6' : '#d1d5db')
              }`,
            backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
          }}
        />
      );
    }

    return (
      <Avatar
      shape='square'
        size={28}
        style={{
          border: `1px solid ${isDarkMode
            ? (isSelected ? '#60a5fa' : '#4b5563')
            : (isSelected ? '#3b82f6' : '#d1d5db')
            }`,
          backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
          color: isDarkMode ? '#e5e7eb' : '#374151',
          fontSize: '12px',
        }}
      >
        {subcategory.name?.charAt(0)}
      </Avatar>
    );
  };

  return (
    <Card
      style={{
        ...cardStyle,
        position: isMobile ? 'static' : 'sticky',
        top: isMobile ? 'auto' : 80,
        width: '100%',
      }}
      bodyStyle={{
        padding: isMobile ? '16px' : '24px',
      }}
    >
      <Title
        level={isMobile ? 4 : 3}
        style={titleStyle}
      >
        Categories
      </Title>

      {categoryLoading ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* All Posts Button */}
          <Button
            type={getButtonType(!selectedCategory && !selectedSubCategory)}
            style={getButtonStyle(!selectedCategory && !selectedSubCategory)}
            onClick={handleShowAllPosts}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
              <Avatar
              shape='square'
                size={isMobile ? 32 : 40}
                icon={<UnorderedListOutlined />}
                style={{
                  border: `1px solid ${isDarkMode
                    ? (!selectedCategory && !selectedSubCategory ? '#60a5fa' : '#4b5563')
                    : (!selectedCategory && !selectedSubCategory ? '#3b82f6' : '#d1d5db')
                    }`,
                  backgroundColor: !selectedCategory && !selectedSubCategory
                    ? (isDarkMode ? '#1d4ed8' : '#3b82f6')
                    : (isDarkMode ? '#374151' : '#f3f4f6'),
                  color: !selectedCategory && !selectedSubCategory
                    ? '#ffffff'
                    : (isDarkMode ? '#e5e7eb' : '#374151'),
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                <Text
                  strong
                  style={{
                    color: !selectedCategory && !selectedSubCategory
                      ? '#ffffff'
                      : (isDarkMode ? '#e5e7eb' : '#374151'),
                    fontSize: isMobile ? '14px' : '16px',
                  }}
                >
                  All Posts
                </Text>
                <Text
                  style={{
                    color: !selectedCategory && !selectedSubCategory
                      ? 'rgba(255, 255, 255, 0.8)'
                      : (isDarkMode ? '#9ca3af' : '#6b7280'),
                    fontSize: '12px',
                  }}
                >
                  {getTotalPosts()} Posts
                </Text>
              </div>
            </div>
          </Button>

          {/* Categories List */}
          <div style={{ marginTop: 16 }}>
            {categories.map((item) => {
              const category = item.category;
              const subcategories = item.subcategories || [];
              const hasSubcategories = subcategories.length > 0;
              const key = category._id;
              const isSelected = selectedCategory === category._id && !selectedSubCategory;
              const isExpanded = expandedKeys.includes(key);

              return (
                <div key={key} style={{ marginBottom: 4 }}>
                  {/* Category Button */}
                  <Button
                    type={getButtonType(isSelected)}
                    style={getButtonStyle(isSelected)}
                    onClick={() => handleCategoryClick(category._id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        {renderCategoryAvatar(category, isSelected)}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                          <Text
                            strong
                            style={{
                              color: isSelected
                                ? '#ffffff'
                                : (isDarkMode ? '#e5e7eb' : '#374151'),
                              fontSize: isMobile ? '14px' : '16px',
                            }}
                          >
                            {category.name}
                          </Text>
                          <Text
                            style={{
                              color: isSelected
                                ? 'rgba(255, 255, 255, 0.8)'
                                : (isDarkMode ? '#9ca3af' : '#6b7280'),
                              fontSize: '12px',
                            }}
                          >
                            {category.postCount || 0} Posts
                          </Text>
                        </div>
                      </div>
                      {hasSubcategories && (
                        <Button
                          type="text"
                          size="small"
                          icon={
                            <DownOutlined
                              style={{
                                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                transition: 'transform 0.2s',
                                color: isSelected
                                  ? '#ffffff'
                                  : (isDarkMode ? '#9ca3af' : '#6b7280'),
                              }}
                            />
                          }
                          onClick={(e) => handleExpandClick(category._id, e)}
                          style={{
                            border: 'none',
                            boxShadow: 'none',
                            backgroundColor: 'transparent',
                          }}
                        />
                      )}
                    </div>
                  </Button>

                  {/* Subcategories */}
                  {hasSubcategories && (
                    <div
                      style={{
                        overflow: 'hidden',
                        maxHeight: isExpanded ? '1000px' : '0px',
                        opacity: isExpanded ? 1 : 0,
                        transition: 'all 0.3s ease-in-out',
                        paddingLeft: 32,
                      }}
                    >
                      <div style={{ paddingTop: 4, paddingBottom: 8 }}>
                        {subcategories.map((subcategory) => {
                          const isSubSelected = selectedSubCategory === subcategory._id && selectedCategory === category._id;

                          return (
                            <Button
                              key={subcategory._id}
                              type={getButtonType(isSubSelected)}
                              style={{
                                ...getButtonStyle(isSubSelected),
                                height: 'auto',
                                padding: '8px 12px',
                                fontSize: '14px',
                              }}
                              onClick={(e) => handleSubcategoryClick(category._id, subcategory._id, e)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                                {renderSubcategoryAvatar(subcategory, isSubSelected)}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                                  <Text
                                    strong
                                    style={{
                                      color: isSubSelected
                                        ? '#ffffff'
                                        : (isDarkMode ? '#e5e7eb' : '#374151'),
                                      fontSize: '14px',
                                    }}
                                  >
                                    {subcategory.name}
                                  </Text>
                                  <Text
                                    style={{
                                      color: isSubSelected
                                        ? 'rgba(255, 255, 255, 0.8)'
                                        : (isDarkMode ? '#9ca3af' : '#6b7280'),
                                      fontSize: '12px',
                                    }}
                                  >
                                    {subcategory.postCount || 0} Posts
                                  </Text>
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
};

export default CategoriesSidebar;