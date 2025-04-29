"use client"
import { AppstoreOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { RiArrowUpDownLine } from "react-icons/ri";
import { ThemeContext } from '../app/ClientLayout';


const FeedNavigation = ({ handlefeedGrid, onSortChange, currentSort }) => {
  const [clickCount, setClickCount] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { isDarkMode } = useContext(ThemeContext);

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
      className: currentSort === 'newest' ? 'bg-gray-100' : ''
    },
    {
      key: 'oldest',
      label: 'Oldest',
      className: currentSort === 'oldest' ? 'bg-gray-100' : ''
    },
    {
      key: 'popular',
      label: 'Popular',
      className: currentSort === 'popular' ? 'bg-gray-100' : ''
    },
  ];

  const handleMenuClick = (e) => {
    onSortChange(e.key);
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
    className: 'rounded-lg shadow-md py-1',
    style: {
      minWidth: '120px',
    },
    selectable: true,
    selectedKeys: [currentSort],
  };

  return (
    <div className={`flex ${isDarkMode ? 'dark-mode' : 'light-mode'} justify-between items-center py-4 w-full select-none`}>
      <div
        onClick={handleFeedsClick}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className={`cursor-pointer flex items-center gap-1 p-1 md:p-1.5 rounded-lg transition-all duration-200
         hover:shadow-sm active:scale-95`}
      >
        <AppstoreOutlined className={`mr-1 text-blue-500 ${isMobile ? 'text-base' : 'text-xl'}`} />
        <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
          Your Feeds
        </span>
      </div>

      <Dropdown
        menu={menuProps}
        trigger={['click']}
        dropdownRender={(menu) => (
          <div className="rounded-lg overflow-hidden" style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            {React.cloneElement(menu, {
              style: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
            })}
          </div>
        )}
      >
        <Button
          type="default"
          className={`border border-gray-300 rounded-lg flex items-center ${isMobile ? 'px-2 h-8 text-sm' : 'px-4 h-10 text-base'
            } hover:border-blue-400 hover:text-blue-500 transition-colors duration-200`}
        >
          <RiArrowUpDownLine className={`${isMobile ? 'text-xs' : 'text-lg'} text-gray-500 mr-1`} />
          <span className="font-medium mx-1">
            {items.find(item => item.key === currentSort)?.label}
          </span>
          <DownOutlined className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 ml-1`} />
        </Button>
      </Dropdown>
    </div>
  );
};

export default FeedNavigation;
