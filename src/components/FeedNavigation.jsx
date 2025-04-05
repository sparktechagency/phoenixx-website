"use client"
import React, { useEffect, useState } from 'react';
import { Dropdown, Button } from 'antd';
import { AppstoreOutlined, DownOutlined } from '@ant-design/icons';
import { RiArrowUpDownLine } from "react-icons/ri";

const FeedNavigation = ({ handlefeedGrid }) => {
  const [clickCount, setClickCount] = useState(1);
  const [sortOption, setSortOption] = useState('Newest');
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleFeedsClick = () => {
    setClickCount((prevCount) => (prevCount % 2) + 1);
  };

  useEffect(() => {
    handlefeedGrid(clickCount);
  }, [clickCount, handlefeedGrid]);

  const items = [
    { key: 'newest', label: 'Newest' },
    { key: 'oldest', label: 'Oldest' },
    { key: 'popular', label: 'Popular'},
  ];
  
  const handleMenuClick = (e) => {
    const selectedOption = items.find(item => item.key === e.key)?.label;
    setSortOption(selectedOption);
  };
  
  return (
    <div className="flex justify-between items-center py-5 bg-white border-gray-200 rounded-lg my-2 w-full select-none">
      <div 
        onClick={handleFeedsClick} 
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className={`cursor-pointer flex items-center gap-1 p-1 md:p-1.5 rounded transition-colors duration-200 ${isHovered ? 'bg-gray-100' : 'bg-transparent'}`}
      >
        <AppstoreOutlined className={`mr-1 text-blue-500 ${isMobile ? 'text-base' : 'text-2xl'}`} />
        <span className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-xl'}`}>
          Your Feeds
        </span>
      </div>
      
      <Dropdown
        menu={{ 
          items, 
          onClick: handleMenuClick,
          className: 'rounded-lg',
        }}
        trigger={['click']}
        dropdownRender={(menu) => (
          <div>
            {menu}
          </div>
        )}
      >
        <Button 
          type="default"
          className={`border border-gray-300 rounded flex items-center py-3${
            isMobile ? 'px-2 h-8 text-sm' : 'px-2 h-10 text-base'
          }`}
        >
          <RiArrowUpDownLine className={`${isMobile ? 'text-xs' : 'text-xl'} text-gray-500 ml-1`} />
          <span className="font-medium">{sortOption}</span>
          <DownOutlined className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 ml-1`} />
        </Button>
      </Dropdown>
    </div>
  );
};

export default FeedNavigation;