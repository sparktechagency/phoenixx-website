"use client";

import React, { useState, useRef, useCallback } from 'react';
import { 
  Typography, 
  Input, 
  Card, 
  Select, 
  Button, 
  Upload, 
  Row,
  Col,
  message,
  Grid
} from 'antd';
import { 
  UploadOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import JoditEditor to avoid SSR issues
const JoditEditor = dynamic(() => import('jodit-react'), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const BlogPostForm = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const screens = useBreakpoint();
  
  // Responsive layout adjustments
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'health', label: 'Health & Wellness' },
  ];

  // Jodit configuration
  const joditConfig = {
    readonly: false,
    height: isMobile ? 300 : 400,
    placeholder: "Write your post description here...",
    toolbarSticky: false,
    toolbarAdaptive: true,
    buttons: [
      'bold', 'italic', 'underline', '|', 
      'ul', 'ol', '|', 
      'link', 'image', '|',
      'source'
    ],
    removeButtons: isMobile ? ['about', 'print', 'hr'] : [],
    uploader: {
      insertImageAsBase64URI: true
    }
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
  };

  // Update the description state when content changes
  const handleDescriptionChange = useCallback((newContent) => {
    setDescription(newContent);
  }, []);

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handlePublish = () => {
    if (!title || !category || !description) {
      message.warning('Please fill all required fields');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      message.success('Post published successfully!');
      setLoading(false);
      router.push('/');
    }, 1500);
  };

  const handleSaveDraft = () => {
    message.info('Draft saved successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <Card 
          className="rounded-xl shadow-lg border-0 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r rounded-md from-blue-600 to-purple-600 p-4 sm:p-6">
            <Title 
              level={isMobile ? 4 : 3} 
              style={{color:"white"}}
              className="text-white mb-0"
            >
              Create New Post
            </Title>
            <Text style={{color:"white"}} className="text-white text-sm sm:text-base">
              Share your thoughts with the world
            </Text>
          </div>
          
          {/* Form Content */}
          <div className="py-4 sm:p-6">
            {/* Title */}
            <div className="mb-6 sm:mb-8">
              <Title level={5} className="text-gray-700 mb-2">Title</Title>
              <Input 
                placeholder="Write your post title here..." 
                value={title}
                onChange={handleTitleChange}
                maxLength={300}
                suffix={`${title.length}/300`}
                className="py-2 sm:py-3 px-4 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                size={isMobile ? "middle" : "large"}
              />
            </div>
            
            {/* Category */}
            <div className="mb-6 sm:mb-8">
              <Title level={5} className="text-gray-700 mb-2">Category</Title>
              <Select
                placeholder="Select a category"
                onChange={handleCategoryChange}
                className="w-full"
                size={isMobile ? "middle" : "large"}
                options={categories}
                suffixIcon={<span className="text-gray-400">▼</span>}
              />
            </div>
            
            {/* Description - Jodit Editor */}
            <div className="mb-6 sm:mb-8">
              <Title level={5} className="text-gray-700 mb-2">Description</Title>
              <Card 
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-all p-0"
                bodyStyle={{ padding: 0 }}
              >
                <JoditEditor
                  value={description} // Bind description state to JoditEditor value
                  config={joditConfig}
                  onChange={handleDescriptionChange} // Use the updated callback for changes
                />
              </Card>
              <div className="mt-2 text-xs text-gray-500">
                Tip: You can click the &lt;/&gt; button to view and edit HTML source
              </div>
            </div>
            
            {/* Image Upload */}
            <div className="mb-6 sm:mb-8">
              <Title level={5} className="text-gray-700 mb-2">Featured Images</Title>
              <Card 
                className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-blue-400 transition-all text-center cursor-pointer"
              >
                <Upload
                  listType={isMobile ? "picture" : "picture-card"}
                  fileList={fileList}
                  onChange={handleFileChange}
                  beforeUpload={() => false}
                  className="flex justify-center"
                  multiple
                >
                  {isMobile ? (
                    <Button icon={<UploadOutlined />} size="middle">
                      Add Photo
                    </Button>
                  ) : (
                    <div className="flex flex-col items-center text-gray-500 p-4">
                      <UploadOutlined className="text-2xl mb-2" />
                      <Text type="secondary">Click or drag files to upload</Text>
                    </div>
                  )}
                </Upload>
              </Card>
            </div>
            
            {/* Actions */}
            <Row justify="end" gutter={[8, 8]}>
              <Col>
                <Button 
                  icon={<SaveOutlined />} 
                  size={isMobile ? "middle" : "large"}
                  className="flex items-center"
                  onClick={handleSaveDraft}
                >
                  {isMobile ? 'Save' : 'Save draft'}
                </Button>
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  size={isMobile ? "middle" : "large"}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 border-0 shadow-md hover:shadow-lg"
                  onClick={handlePublish}
                  loading={loading}
                >
                  {isMobile ? 'Publish' : 'Publish Post'}
                </Button>
              </Col>
            </Row>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BlogPostForm;
