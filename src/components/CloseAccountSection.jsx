import React from 'react';
import { Button, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const CloseAccountSection = () => {
  const { confirm } = Modal;

  const showConfirm = () => {
    confirm({
      title: 'Are you sure you want to delete your account?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone. All of your data will be permanently deleted.',
      okText: 'Yes, Delete My Account',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        console.log('OK clicked, account deletion logic would go here');
        // Handle account deletion logic here
      },
    });
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium mb-1">Close your account</h3>
      <p className="text-gray-600 mb-4">Once you delete your account, there's no going back. Please be certain!</p>
      <Button 
        danger
        onClick={showConfirm}
        className="h-12 px-6 font-medium"
      >
        Delete Account
      </Button>
    </div>
  );
};

export default CloseAccountSection;