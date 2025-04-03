"use client"
import React, { useEffect, useState } from 'react';
import { Dropdown, Button, theme } from 'antd';
import { AppstoreOutlined, DownOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const FeedNavigation = ({ handlefeedGrid }) => {
  const { token } = theme.useToken(); 
  const [clickCount, setClickCount] = useState(1);
  const [sortOption, setSortOption] = useState('Newest');
  const [isHovered, setIsHovered] = useState(false);
  
  const handleFeedsClick = () => {
    setClickCount((prevCount) => (prevCount % 2) + 1);
  };

  useEffect(()=>{
    handlefeedGrid(clickCount)
  },[clickCount])


  
  const items = [
    { key: 'newest', label: 'Newest' },
    { key: 'oldest', label: 'Oldest' },
    { key: 'popular', label: 'Popular' },
  ];
  
  const handleMenuClick = (e) => {
    const selectedOption = items.find(item => item.key === e.key)?.label;
    setSortOption(selectedOption);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        margin: '8px 0'
      }}
    >
      <motion.div 
        onClick={handleFeedsClick} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center',
          padding: '6px 12px',
          borderRadius: token.borderRadiusSM,
          background: isHovered ? token.colorFillTertiary : 'transparent',
          transition: 'background 0.2s ease'
        }}
        whileTap={{ scale: 0.95 }}
      >
        <AppstoreOutlined style={{ 
          marginRight: token.marginXS, 
          color: token.colorPrimary,
          fontSize: token.fontSizeLG
        }} />
        <span style={{ 
          fontWeight: token.fontWeightStrong,
          color: token.colorText,
          fontSize: token.fontSize
        }}>
          Your Feeds
        </span>
      </motion.div>
      
      <Dropdown
        menu={{ 
          items, 
          onClick: handleMenuClick,
          style: {
            borderRadius: token.borderRadiusLG
          }
        }}
        trigger={['click']}
        dropdownRender={(menu) => (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {menu}
          </motion.div>
        )}
      >
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button 
            type="default"
            style={{ 
              borderColor: token.colorBorder,
              borderRadius: token.borderRadiusSM,
              padding: `0 ${token.paddingContentHorizontal}px`,
              height: token.controlHeight,
              display: 'flex',
              alignItems: 'center',
              gap: token.marginXXS
            }}
          >
            <span style={{ fontWeight: token.fontWeightMedium }}>{sortOption}</span>
            <DownOutlined style={{ fontSize: token.fontSizeSM, color: token.colorTextDescription }} />
          </Button>
        </motion.div>
      </Dropdown>
    </motion.div>
  );
};

export default FeedNavigation;