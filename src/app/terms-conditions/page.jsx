"use client";

import CustomBanner from '@/components/CustomBanner';
import { Spin } from 'antd';
import { useContext } from 'react';
import { useTermsAndConditionQuery } from '../../features/About/AboutApi';
import { ThemeContext } from '../layout';


const page = () => {
  const { data, isLoading, isError } = useTermsAndConditionQuery();
  const { isDarkMode } = useContext(ThemeContext);

  const renderContent = () => {
    if (isLoading) {
      return <div className='flex justify-center'><Spin /></div>;
    }

    if (isError) {
      return <div className='flex justify-center'>Failed to load content</div>;
    }

    if (!data?.data?.content) {
      return <span className='flex justify-center'>No Available Content</span>;
    }

    return <div className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
      {data.data.content.replace(/<[^>]*>/g, '')}
    </div>;
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <CustomBanner routeName="Terms - Conditions" />

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
