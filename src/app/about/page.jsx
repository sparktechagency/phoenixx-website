"use client";

import CustomBanner from '@/components/CustomBanner';
import { useAboutQuery } from '@/features/About/AboutApi';
import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import React from 'react';

const About = () => {
  const router = useRouter();
  const {data , isLoading} = useAboutQuery();
    return (
        <div>
            <CustomBanner routeName={"About us"} />

            <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto py-8 px-6">
           {isLoading ? <Spin /> :  data?.data?.content?.replace(/<[^>]*>/g, '')}
      </div>

      <div className='flex justify-center gap-5'>
          <h3 onClick={()=> router.push("terms-conditions")} className='font-medium text-base cursor-pointer'>Terms and Conditions</h3>
          |
          <h3 onClick={()=> router.push("privacy-policy")} className='font-medium text-base cursor-pointer'>Privacy Policy</h3>
        </div>

    </div>
        </div>
    );
};

export default About;