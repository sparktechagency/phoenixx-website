"use client";

import CustomBanner from '@/components/CustomBanner';
import { Spin } from 'antd';
import { useContext } from 'react';
import { usePrivacyPolicyQuery } from '../../features/About/AboutApi';
import { ThemeContext } from '../ClientLayout';



const page = () => {
  const { data, isLoading, isError } = usePrivacyPolicyQuery();
  const { isDarkMode } = useContext(ThemeContext);

  const renderContent = () => {
    if (isLoading) {
      return <div className='flex justify-center'><Spin /></div>;
    }

    if (isError) {
      return <div className={`flex justify-center ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
        Failed to load content
      </div>;
    }

    if (!data?.data?.content) {
      return <span className={`flex justify-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        No Available Content
      </span>;
    }

    return <div className={`prose max-w-none ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`} dangerouslySetInnerHTML={{ __html: data.data.content }}>
    </div>;
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <CustomBanner routeName="Privacy Policy" />

      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
        <div className="max-w-5xl mx-auto py-8 px-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default page;
