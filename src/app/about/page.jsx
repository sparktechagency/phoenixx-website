"use client";

import CustomBanner from '@/components/CustomBanner';
import { useAboutQuery } from '@/features/About/AboutApi';
import { Spin } from 'antd';
import Link from 'next/link';
import { useContext } from 'react';
import { ThemeContext } from '../layout';


const About = () => {
  const { data, isLoading, isError } = useAboutQuery();
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

    return <div>{data.data.content.replace(/<[^>]*>/g, '')}</div>;
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <CustomBanner routeName="About us" />

      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-5xl mx-auto py-8 px-6">
          {renderContent()}
        </div>

        <div className='flex justify-center gap-5 pb-8'>
          <Link href="/terms-conditions" className={`font-medium text-base cursor-pointer ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            Terms and Conditions
          </Link>
          |
          <Link href="/privacy-policy" className={`font-medium text-base cursor-pointer ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
