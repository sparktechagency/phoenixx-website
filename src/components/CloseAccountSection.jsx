import React, { useState } from 'react';
import { Button, Modal, Input, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useDeleteAccountMutation } from '@/features/profile/profileApi';


const CloseAccountSection = () => {
  const { confirm } = Modal;
  const [password, setPassword] = useState('');
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const router = useRouter();
  const [deleteAccount , {isLoading}] = useDeleteAccountMutation();

  const showConfirm = () => {
    setIsPasswordModalVisible(true); // Show the modal for entering the password
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value); // Handle the password input change
  };

  const handleAccountDeletion =async () => {
   try {
    const response = await deleteAccount({password:password}).unwrap();
    console.log(response)
    router.push("/auth/login")
   } catch (error) {
    message.error(error.data.message)
   }
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

      {/* Password Modal */}
      <Modal
        centered
        title="Please confirm your password"
        open={isPasswordModalVisible}
        onOk={handleAccountDeletion}
        onCancel={() => setIsPasswordModalVisible(false)}
        loading={isLoading}
        okText="Delete Account"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <Input.Password 
          placeholder="Enter your password" 
          value={password} 
          onChange={handlePasswordChange} 
        />
      </Modal>
    </div>
  );
};

export default CloseAccountSection;
