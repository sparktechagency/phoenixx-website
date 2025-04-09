"use client";
import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, Button, Grid, Upload , Row, Col} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const ProfileBanner = () => {
  // Use Grid.useBreakpoint directly since destructuring doesn't work properly
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [userData, setUserData] = useState({
    fullName: 'George Clooney',
    email: 'secret.undersign@gmail.com',
    phone: '+8601916333014',
    username: 'george_clooney',
    profileImage: '/images/profile.jpg'
  });
  
  const [fileList, setFileList] = useState([]);

  // Reset form with updated userData when it changes
  useEffect(() => {
    if (isModalOpen) {
      form.setFieldsValue(userData);
    }
  }, [userData, isModalOpen, form]);

  const showModal = () => {
    // Reset file list when opening modal
    setFileList([]);
    form.setFieldsValue(userData);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleUpdate = () => {
    form.validateFields().then(values => {
      // If a new image was uploaded, update the profile image
      if (fileList.length > 0 && fileList[0].originFileObj) {
        // In a real application, you would upload the file to a server
        // and get back a URL. For now, we'll simulate this with a fake URL
        const fakeImageUrl = URL.createObjectURL(fileList[0].originFileObj);
        values.profileImage = fakeImageUrl;
      } else {
        // Keep the existing image if no new one was uploaded
        values.profileImage = userData.profileImage;
      }
      
      setUserData(values);
      setIsModalOpen(false);
    }).catch(error => {
      console.error('Validation failed:', error);
    });
  };

  const uploadProps = {
    beforeUpload: (file) => {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        console.error('You can only upload image files!');
        return Upload.LIST_IGNORE;
      }
      return false; // Prevent auto upload
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    fileList,
    maxCount: 1,
    listType: 'picture-card',
  };

  return (
    <div className="bg-[#EBEBFF] pt-20 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-7xl shadow-md">
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-12">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-300">
                <img
                  src={userData.profileImage}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="flex-1"></div>
          <button
            onClick={showModal}
            className={`
              ${isMobile ? 'px-3 py-1.5 rounded-md' : 'px-4 py-2 rounded-md'} 
              bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer
              text-white flex items-center justify-center gap-2
              shadow-sm
            `}
            aria-label="Edit profile"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none"
              className="mr-1"
            >
              <path 
                d="M9.99952 10L3.84252 16.162C3.60992 16.3944 3.43819 16.6805 3.34252 16.995L2.02052 21.355C1.9943 21.4415 1.99202 21.5335 2.01392 21.6212C2.03583 21.7089 2.08109 21.789 2.1449 21.853C2.20871 21.917 2.28869 21.9626 2.37631 21.9847C2.46394 22.0069 2.55593 22.0049 2.64252 21.979L7.00052 20.656C7.31399 20.5599 7.59902 20.3882 7.83052 20.156L13.9995 13.982" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M12.8291 7.17153L17.1881 2.82553C17.4498 2.5638 17.7605 2.35619 18.1025 2.21455C18.4445 2.0729 18.811 2 19.1811 2C19.5512 2 19.9177 2.0729 20.2597 2.21455C20.6017 2.35619 20.9124 2.5638 21.1741 2.82553C21.4358 3.08725 21.6434 3.39796 21.7851 3.73992C21.9267 4.08188 21.9996 4.44839 21.9996 4.81853C21.9996 5.18866 21.9267 5.55517 21.7851 5.89713C21.6434 6.23909 21.4358 6.5498 21.1741 6.81153L16.8211 11.1645" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M15 5L19 9" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium">Edit</span>
          </button>
        </div>

        <div className="text-center pb-10">
          <h2 className="text-xl sm:text-2xl font-bold">{userData.fullName}</h2>
          <p className="text-gray-500 text-sm sm:text-base">@{userData.username}</p>
        </div>
      </div>

      <Modal
        title="Edit Profile Information"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        width={isMobile ? "95%" : 520}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={userData}
        >

<Form.Item label="Profile Picture">
  <Row gutter={16} align="middle">
    {/* Profile Image */}
    {fileList.length === 0 && (
      <Col xs={24} sm={8} lg={6}>
        <div className="flex justify-center">
          <img 
            src={userData.profileImage} 
            alt="Current profile" 
            className="w-20 h-20 object-cover rounded-full"
          />
        </div>
        <div className="text-xs text-gray-500 mt-1 text-center">
          Current profile image
        </div>
      </Col>
    )}

    {/* Upload Section */}
    <Col xs={24} sm={16} lg={18}>
      <Upload {...uploadProps}>
        {fileList.length === 0 && (
          <div className=" p-4 rounded-lg">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        )}
      </Upload>
    </Col>
  </Row>
</Form.Item>


          <Form.Item
            name="fullName"
            label="Full Name*"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email*"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username*"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              block
              onClick={handleUpdate}
              style={{ backgroundColor: '#1C37E0', height: '42px' }}
            >
              Update Info
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfileBanner;