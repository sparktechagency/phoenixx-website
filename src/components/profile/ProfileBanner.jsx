"use client";
import { useGetProfileQuery, useUpdateProfileMutation } from '@/features/profile/profileApi';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Grid, Input, message, Modal, Row, Upload } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { getImageUrl } from '../../../utils/getImageUrl';
import { ThemeContext } from '../../app/ClientLayout';
import Loading from '../Loading/Loading';

const ProfileBanner = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { data, error, isLoading: profileLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: updateProfileLoading }] = useUpdateProfileMutation();

  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (isModalOpen && data?.data) {
      form.setFieldsValue({
        name: data.data.name || data.data.userName,
        email: data.data.email,
        contact: data.data.contact || '',
      });
    }
  }, [data, isModalOpen, form]);

  const showModal = () => {
    setFileList([]);
    if (data?.data) {
      form.setFieldsValue({
        name: data.data.name || data.data.userName,
        email: data.data.email,
        contact: data.data.contact || '',
      });
    }
    setIsModalOpen(true);
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    // Restore background scrolling
    document.body.style.overflow = 'unset';
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('name', values.name);
      if (values.contact) {
        formData.append('contact', values.contact);
      }

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      const response = await updateProfile(formData).unwrap();

      if (response.success) {
        message.success("Profile updated successfully");
        setIsModalOpen(false);
        // Restore background scrolling
        document.body.style.overflow = 'unset';
      } else {
        message.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      message.error(error.data?.message || "Failed to update profile");
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    fileList,
    maxCount: 1,
    listType: screens.xs ? 'picture' : 'picture-card',
    accept: 'image/*'
  };

  if (profileLoading) {
    return (
      <div className={`pt-20 pb-10 flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-[#EBEBFF]'}`}>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`pt-20 pb-10 flex items-center justify-center ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-[#EBEBFF] text-gray-800'}`}>
        Error loading profile
      </div>
    );
  }

  return (
    <div className={`pt-20 pb-10 ${isDarkMode ? 'bg-gray-800' : 'bg-[#EBEBFF]'}`}>
      <div className="container mx-auto px-4">
        <div className={`rounded-lg shadow-md ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
          {/* Banner Content */}
          <div className="relative pt-10 pb-4 px-4 sm:px-6">
            {/* Profile Picture */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-12">
              <div className="relative">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 ${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-300 border-white'}`}>
                  <img
                    src={getImageUrl(data?.data?.profile)}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Edit Button - positioned differently based on screen size */}
            <div className={`flex ${isMobile ? 'justify-center mt-4' : 'justify-end'}`}>
              <button
                onClick={showModal}
                className={`
                  ${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} 
                  bg-[#1C37E0] hover:bg-[#1530C7] transition-colors cursor-pointer
                  text-white flex items-center justify-center gap-2
                  rounded-md shadow-sm border-none
                `}
                aria-label="Edit profile"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={isMobile ? "18" : "20"}
                  height={isMobile ? "18" : "20"}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.99952 10L3.84252 16.162C3.60992 16.3944 3.43819 16.6805 3.34252 16.995L2.02052 21.355C1.9943 21.4415 1.99202 21.5335 2.01392 21.6212C2.03583 21.7089 2.08109 21.789 2.1449 21.853C2.20871 21.917 2.28869 21.9626 2.37631 21.9847C2.46394 22.0069 2.55593 22.0049 2.64252 21.979L7.00052 20.656C7.31399 20.5599 7.59902 20.3882 7.83052 20.156L13.9995 13.982" />
                  <path d="M12.8291 7.17153L17.1881 2.82553C17.4498 2.5638 17.7605 2.35619 18.1025 2.21455C18.4445 2.0729 18.811 2 19.1811 2C19.5512 2 19.9177 2.0729 20.2597 2.21455C20.6017 2.35619 20.9124 2.5638 21.1741 2.82553C21.4358 3.08725 21.6434 3.39796 21.7851 3.73992C21.9267 4.08188 21.9996 4.44839 21.9996 4.81853C21.9996 5.18866 21.9267 5.55517 21.7851 5.89713C21.6434 6.23909 21.4358 6.5498 21.1741 6.81153L16.8211 11.1645" />
                  <path d="M15 5L19 9" />
                  <path d="M2 2L22 22" />
                </svg>
                <span className="font-medium">Edit Profile</span>
              </button>
            </div>

            {/* User Info */}
            <div className="text-center">
              <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {data?.data?.name || data?.data?.userName}
              </h2>
              <p className={`text-sm sm:text-base mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {data?.data?.name ? "@" + data?.data?.userName : data?.data?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title={<span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Edit Profile Information</span>}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        width={isMobile ? "90%" : 520}
        className={isDarkMode ? 'dark-modal' : ''}
        styles={{
          header: {
            borderBottom: isDarkMode ? '1px solid #424242' : '1px solid #f0f0f0',
            backgroundColor: isDarkMode ? '#374151' : '#ffffff'
          },
          body: {
            padding: isMobile ? '16px' : '4px',
            backgroundColor: isDarkMode ? '#374151' : '#ffffff'
          },
          content: {
            backgroundColor: isDarkMode ? '#374151' : '#ffffff'
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          className={isDarkMode ? 'dark-form' : ''}
        >
          <Form.Item label={<span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Profile Picture</span>}>
            <Row gutter={[16, 16]} align="middle">
              {fileList.length === 0 && (
                <Col xs={24} sm={8} md={6}>
                  <div className="flex justify-center">
                    <img
                      src={getImageUrl(data?.data?.profile)}
                      alt="Current profile"
                      className={`w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full border-2 ${isDarkMode ? 'border-gray-500' : 'border-gray-300'}`}
                    />
                  </div>
                  <div className={`text-xs mt-1 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Current profile
                  </div>
                </Col>
              )}

              <Col xs={24} sm={16} md={18}>
                <Upload {...uploadProps}>
                  {fileList.length === 0 && (
                    <div className={`p-2 sm:p-4 rounded-lg border-2 border-dashed transition-colors hover:border-blue-500 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-gray-50 border-gray-300 text-gray-600'}`}>
                      <div className="flex flex-col items-center justify-center">
                        <PlusOutlined className={`text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-gray-400'}`} />
                        <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                          {isMobile ? 'Upload Photo' : 'Upload Profile Picture'}
                        </div>
                      </div>
                    </div>
                  )}
                </Upload>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item
            name="name"
            label={<span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Full Name*</span>}
            rules={[
              { required: true, message: 'Please enter your name' },
              { min: 2, message: 'Name must be at least 2 characters' }
            ]}
          >
            <Input
              placeholder='Name'
              className={isDarkMode ? 'bg-gray-600 text-white border-gray-500 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300'}
              size={isMobile ? 'middle' : 'large'}
              style={{
                backgroundColor: isDarkMode ? '#4B5563' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#111827',
                borderColor: isDarkMode ? '#6B7280' : '#d1d5db'
              }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Email</span>}
          >
            <Input
              disabled
              className={isDarkMode ? 'bg-gray-600 text-gray-300 border-gray-500' : 'bg-gray-100 text-gray-500 border-gray-300'}
              size={isMobile ? 'middle' : 'large'}
              style={{
                backgroundColor: isDarkMode ? '#4B5563' : '#f3f4f6',
                color: isDarkMode ? '#d1d5db' : '#6b7280',
                borderColor: isDarkMode ? '#6B7280' : '#d1d5db'
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              block
              onClick={handleUpdate}
              loading={updateProfileLoading}
              size={isMobile ? 'middle' : 'large'}
              style={{
                backgroundColor: '#1C37E0',
                borderColor: '#1C37E0',
                height: isMobile ? '40px' : '44px',
                marginTop: '8px'
              }}
              className="hover:bg-[#1530C7] hover:border-[#1530C7] transition-colors"
            >
              {updateProfileLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Custom styles for dark mode */}
      <style jsx>{`
        .dark-modal .ant-modal-content {
          background-color: #374151 !important;
        }
        .dark-modal .ant-modal-header {
          background-color: #374151 !important;
          border-bottom: 1px solid #4B5563 !important;
        }
        .dark-modal .ant-modal-close {
          color: #ffffff !important;
        }
        .dark-modal .ant-modal-close:hover {
          color: #d1d5db !important;
        }
        .dark-form .ant-form-item-label > label {
          color: #ffffff !important;
        }
        .dark-form .ant-form-item-explain-error {
          color: #f87171 !important;
        }
        .dark-form .ant-upload.ant-upload-select-picture-card {
          background-color: #4B5563 !important;
          border-color: #6B7280 !important;
        }
        .dark-form .ant-upload-list-picture-card .ant-upload-list-item {
          background-color: #4B5563 !important;
          border-color: #6B7280 !important;
        }
      `}</style>
    </div>
  );
};

export default ProfileBanner;