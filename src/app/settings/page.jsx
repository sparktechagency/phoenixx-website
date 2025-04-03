// components/AccountTabs.jsx
"use client";
import React, { useState } from 'react';
import { Tabs } from 'antd';
import CustomBanner from '@/components/CustomBanner';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import CloseAccountSection from '@/components/CloseAccountSection';

const AccountTabs = () => {
  const [activeKey, setActiveKey] = useState('1');

  const onChange = (key) => {
    setActiveKey(key);
  };

  const items = [
    {
      key: '1',
      label: 'Change Password',
      children: <ChangePasswordForm />,
    },
    {
      key: '2',
      label: 'Account',
      children: <CloseAccountSection />,
    },
  ];

  return (
  <div>
    <CustomBanner routeName={"Settings"} />
      <div className="max-w-xl mx-auto mt-8">
      <Tabs
        activeKey={activeKey}
        items={items}
        onChange={onChange}
        tabBarStyle={{
          marginBottom: 24,
        }}
      />
    </div>
  </div>
  );
};

export default AccountTabs;