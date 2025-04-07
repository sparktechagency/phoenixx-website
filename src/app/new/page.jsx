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
  Grid,
  Space
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
  const [subcategory, setSubcategory] = useState(null);
  const [description, setDescription] = useState('');
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);
  const router = useRouter();
  const screens = useBreakpoint();
  
  // Responsive layout adjustments
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  // Categories with subcategories
  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'health', label: 'Health & Wellness' },
  ];

  // Subcategories mapping
  const subcategoriesMap = {
    technology: [
      { value: 'web-dev', label: 'Web Development' },
      { value: 'mobile-dev', label: 'Mobile Apps' },
      { value: 'ai', label: 'Artificial Intelligence' },
      { value: 'cloud', label: 'Cloud Computing' },
      { value: 'security', label: 'Cybersecurity' }
    ],
    design: [
      { value: 'ui', label: 'UI Design' },
      { value: 'ux', label: 'UX Design' },
      { value: 'graphic', label: 'Graphic Design' },
      { value: 'product', label: 'Product Design' },
      { value: 'illustration', label: 'Illustration' }
    ],
    business: [
      { value: 'marketing', label: 'Marketing' },
      { value: 'entrepreneurship', label: 'Entrepreneurship' },
      { value: 'finance', label: 'Finance' },
      { value: 'management', label: 'Management' },
      { value: 'strategy', label: 'Strategy' }
    ],
    lifestyle: [
      { value: 'travel', label: 'Travel' },
      { value: 'food', label: 'Food & Cooking' },
      { value: 'fashion', label: 'Fashion' },
      { value: 'home', label: 'Home & Decor' },
      { value: 'hobbies', label: 'Hobbies' }
    ],
    health: [
      { value: 'fitness', label: 'Fitness' },
      { value: 'nutrition', label: 'Nutrition' },
      { value: 'mental-health', label: 'Mental Health' },
      { value: 'wellness', label: 'Wellness' },
      { value: 'medical', label: 'Medical Advice' }
    ]
  };

  // Get available subcategories based on selected category
  const getSubcategories = () => {
    if (!category) return [];
    return subcategoriesMap[category] || [];
  };

  // Jodit configuration - improved settings
  const joditConfig = {
    height: isMobile ? 300 : 400,
    placeholder: "Write your post description here...",
    toolbarSticky: false,
    toolbarAdaptive: true,
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|', 
      'ul', 'ol', '|',
      'link', 'image', '|',
      'paragraph', 'align', '|',
      'undo', 'redo', '|',
      'source'
    ],
    removeButtons: ['hr', 'about', 'print', 'table'],
    cleanHTML: {
      fillEmptyParagraph: false
    },
    spellcheck: true,
    showPlaceholder: true
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    // Reset subcategory when category changes
    setSubcategory(null);
  };

  const handleSubcategoryChange = (value) => {
    setSubcategory(value);
  };

  // Content handler with better implementation
  const handleDescriptionChange = (newContent) => {
    setDescription(newContent);
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    // Return false to prevent automatic upload
    return false;
  };

  const handlePublish = async () => {
    console.log("Current form values:", { 
      title, 
      category,
      subcategory,
      description, 
      fileCount: fileList
    });
    
    if (!title || !category || !subcategory || !description) {
      message.warning('Please fill all required fields');
      return;
    }
  
    try {
      setLoading(true);
      
      // Create form data object
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('subcategory', subcategory);
      formData.append('description', description);
      
      // Handle file uploads - make sure we're getting the actual File objects
      fileList.forEach((file, index) => {
        if (file.originFileObj) {
          formData.append(`images[${index}]`, file.originFileObj);
        }
      });
  
      // Log form data contents for debugging
      // for (let [key, value] of formData.entries()) {
      //   console.log(`FormData: ${key} => ${value instanceof File ? value.name : value}`);
      // }
  
      // Example API call - replace with your actual API endpoint
      /*
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Server responded with an error');
      }
      
      const data = await response.json();
      */
      
      // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      // message.success('Post published successfully!');
      
      // Optionally reset form after successful submission
      setTitle('');
      setCategory(null);
      setSubcategory(null);
      setDescription('');
      setFileList([]);
      
      // Optionally redirect after success
      // router.push('/blog');
    } catch (error) {
      console.error('Error publishing post:', error);
      message.error('Failed to publish post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // Get current form data
    const draftData = {
      title,
      category,
      subcategory,
      description,
      files: fileList.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };
    
    // Save to localStorage or your preferred storage
    localStorage.setItem('blogPostDraft', JSON.stringify(draftData));
    
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
            
            {/* Category and Subcategory */}
            <div className="mb-6 sm:mb-8">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Title level={5} className="text-gray-700 mb-2">Category</Title>
                  <Select
                    placeholder="Select a category"
                    value={category}
                    onChange={handleCategoryChange}
                    className="w-full"
                    size={isMobile ? "middle" : "large"}
                    options={categories}
                    suffixIcon={<span className="text-gray-400">▼</span>}
                  />
                </Col>
                <Col xs={24} md={12}>
                  <Title level={5} className="text-gray-700 mb-2">Subcategory</Title>
                  <Select
                    placeholder={category ? "Select a subcategory" : "Select a category first"}
                    value={subcategory}
                    onChange={handleSubcategoryChange}
                    className="w-full"
                    size={isMobile ? "middle" : "large"}
                    options={getSubcategories()}
                    disabled={!category}
                    suffixIcon={<span className="text-gray-400">▼</span>}
                  />
                </Col>
              </Row>
            </div>
            
            {/* Description - Jodit Editor */}
            <div className="mb-6 sm:mb-8">
              <Title level={5} className="text-gray-700 mb-2">Description</Title>
              <Card 
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-all p-0"
                bodyStyle={{ padding: 0 }}
              >
                <JoditEditor
                  ref={editorRef}
                  value={description}
                  config={joditConfig}
                  tabIndex={1}
                  onBlur={newContent => setDescription(newContent)} // preferred to use only this option to update the content
                />
              </Card>
              <div className="mt-2 text-xs text-gray-500">
                Tip: You can use the formatting toolbar to style your content
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
                  beforeUpload={beforeUpload}
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