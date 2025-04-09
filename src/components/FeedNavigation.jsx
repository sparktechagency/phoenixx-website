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
    { 
      key: 'newest', 
      label: 'Newest',
      className: sortOption === 'Newest' ? 'bg-gray-50' : '' 
    },
    { 
      key: 'oldest', 
      label: 'Oldest',
      className: sortOption === 'Oldest' ? 'bg-gray-50' : '' 
    },
    { 
      key: 'popular', 
      label: 'Popular',
      className: sortOption === 'Popular' ? 'bg-gray-50' : '' 
    },
  ];
  
  const handleMenuClick = (e) => {
    const selectedOption = items.find(item => item.key === e.key)?.label;
    setSortOption(selectedOption);
  };
  
  const menuProps = {
    items,
    onClick: handleMenuClick,
    className: 'rounded-lg shadow-md py-1',
    style: {
      minWidth: '120px',
    },
    selectable: true,
    selectedKeys: [items.find(item => item.label === sortOption)?.key],
  };
  
  return (
    <div className="flex justify-between items-center py-4 w-full select-none">
      <div 
        onClick={handleFeedsClick} 
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className={`cursor-pointer flex items-center gap-1 p-1 md:p-1.5 rounded-lg transition-all duration-200 ${
          isHovered ? 'bg-gray-100' : 'bg-transparent'
        } hover:shadow-sm active:scale-95`}
      >
        <AppstoreOutlined className={`mr-1 text-blue-500 ${isMobile ? 'text-base' : 'text-xl'}`} />
        <span className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>
          Your Feeds
        </span>
      </div>
      
      <Dropdown
        menu={menuProps}
        trigger={['click']}
        dropdownRender={(menu) => (
          <div className="rounded-lg overflow-hidden">
            {React.cloneElement(menu, {
              style: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
            })}
          </div>
        )}
      >
        <Button 
          type="default"
          className={`border border-gray-300 rounded-lg flex items-center ${
            isMobile ? 'px-2 h-8 text-sm' : 'px-4 h-10 text-base'
          } hover:border-blue-400 hover:text-blue-500 transition-colors duration-200`}
        >
          <RiArrowUpDownLine className={`${isMobile ? 'text-xs' : 'text-lg'} text-gray-500 mr-1`} />
          <span className="font-medium mx-1">{sortOption}</span>
          <DownOutlined className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 ml-1`} />
        </Button>
      </Dropdown>
    </div>
  );
};

export default FeedNavigation;