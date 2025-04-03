"use client";

import React, { useState } from 'react';
import { 
  Typography, 
  Input, 
  Card, 
  Select, 
  Space, 
  Button, 
  Upload, 
  Row,
  Col,
  message
} from 'antd';
import { 
  BoldOutlined, 
  ItalicOutlined, 
  LinkOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  AlignLeftOutlined,
  CodeOutlined,
  PictureOutlined,
  ThunderboltOutlined,
  BorderOutlined,
  SmileOutlined,
  FontColorsOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { TextArea } = Input;

const BlogPostForm = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'health', label: 'Health & Wellness' },
  ];

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

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

  const editorIcons = [
    { icon: <BoldOutlined />, title: 'Bold' },
    { icon: <ItalicOutlined />, title: 'Italic' },
    { icon: <LinkOutlined />, title: 'Link' },
    { icon: <OrderedListOutlined />, title: 'Ordered List' },
    { icon: <UnorderedListOutlined />, title: 'Unordered List' },
    { icon: <AlignLeftOutlined />, title: 'Heading' },
    { icon: <CodeOutlined />, title: 'Code' },
    { icon: <PictureOutlined />, title: 'Image' },
    { icon: <ThunderboltOutlined />, title: 'Highlight' },
    { icon: <BorderOutlined />, title: 'Blockquote' },
    { icon: <SmileOutlined />, title: 'Emoji' },
    { icon: <FontColorsOutlined />, title: 'Text Color' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card 
          className="rounded-xl shadow-lg border-0 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <Title level={3} style={{color:'white'}} className="text-white mb-0">Create New Post</Title>
            <Text style={{color:"white"}} className="">Share your thoughts with the world</Text>
          </div>
          
          {/* Form Content */}
          <div className="p-6">
            {/* Title */}
            <div className="mb-8">
              <Title level={5} className="text-gray-700 mb-2">Title</Title>
              <Input 
                placeholder="Write your post title here..." 
                value={title}
                onChange={handleTitleChange}
                maxLength={300}
                suffix={`${title.length}/300`}
                className="py-3 px-4 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
                size="large"
              />
            </div>
            
            {/* Category */}
            <div className="mb-8">
              <Title level={5} className="text-gray-700 mb-2">Category</Title>
              <Select
                placeholder="Select a category"
                onChange={handleCategoryChange}
                className="w-full"
                size="large"
                options={categories}
                suffixIcon={<span className="text-gray-400">▼</span>}
              />
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <Title level={5} className="text-gray-700 mb-2">Description</Title>
              <Card 
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-all"
              >
                {/* Editor Toolbar */}
                <div className="border-b border-gray-200 p-2 bg-gray-50">
                  <Space wrap>
                    {editorIcons.map((item, index) => (
                      <Button 
                        key={index} 
                        type="text" 
                        icon={item.icon} 
                        title={item.title}
                        className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded"
                      />
                    ))}
                  </Space>
                </div>
                
                {/* Text Area */}
                <TextArea
                  placeholder="Write your post description here..."
                  value={description}
                  onChange={handleDescriptionChange}
                  autoSize={{ minRows: 10 }}
                  className="p-4 text-gray-700 border-0 focus:shadow-none"
                />
              </Card>
            </div>
            
            {/* Image Upload */}
            <div className="">
              <Title level={5} className="text-gray-700 mb-2">Featured Images</Title>
              <Card 
                className="border-2  border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-blue-400 transition-all text-center cursor-pointer"
              >
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleFileChange}
                  beforeUpload={() => false}
                  className="flex justify-center"
                  multiple
                >
                  <div className="flex flex-col items-center  text-gray-500">
                    <Text type="secondary" className="mt-1">Add Photo</Text>
                  </div>
                </Upload>
              </Card>
            </div>
            
            {/* Actions */}
            <Row style={{marginTop:"15px"}} justify="end" gutter={16}>
              <Col>
                <Button 
                  icon={<SaveOutlined />} 
                  size="large"
                  className="flex items-center"
                  onClick={handleSaveDraft}
                >
                  Save draft
                </Button>
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  size="large"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 border-0 shadow-md hover:shadow-lg"
                  onClick={handlePublish}
                  loading={loading}
                >
                  Publish Post
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