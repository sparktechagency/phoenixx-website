"use client";

import CustomBanner from '@/components/CustomBanner';
import { Spin } from 'antd';
import { usePrivacyPolicyQuery } from '../../features/About/AboutApi';

const page = () => {
  const { data, isLoading } = usePrivacyPolicyQuery()
  console.log(data?.data)
    return (
        <div>
            <CustomBanner routeName={"Privacy Policy"} />
            <div className=" max-w-5xl mx-auto">
       {isLoading ? <Spin size='small' /> :  data?.data?.content?.replace(/<[^>]*>/g, '')}
    </div>
        </div>
    );
};

export default page;