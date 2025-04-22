"use client";

import React, { useState, useRef, useEffect, useContext } from 'react';
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
import Image from 'next/image';
import { useCreatePostMutation, useEditPostMutation } from '@/features/post/postApi';
import { useCategoriesQuery, useSubCategoriesQuery } from '@/features/Category/CategoriesApi';
import { toast } from 'react-toastify';
import { baseURL } from '../../../utils/BaseURL';
import { ThemeContext } from '../layout';

const JoditEditor = dynamic(() => import('jodit-react'), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const BlogPostForm = ({ initialValues, isEditing = false, onSuccess, postId }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [description, setDescription] = useState('');
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);
  const router = useRouter();
  const screens = useBreakpoint();
  const { isDarkMode } = useContext(ThemeContext);

 

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || '');
      setCategory(initialValues.category || null);
      setSubcategory(initialValues.subCategory || null);
      setDescription(initialValues.content || '');
      
      // Set image if it exists
      if (initialValues.image) {
        const imageUrl = initialValues.image.startsWith('http') 
          ? initialValues.image 
          : `${baseURL}${initialValues.image}`;
        
        setFileList([{
          uid: '-1',
          name: 'current-image',
          status: 'done',
          url: imageUrl,
          thumbUrl: imageUrl
        }]);
      }
    }
  }, [initialValues]);

  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const [createPost, { isLoading }] = useCreatePostMutation();
  const { data:categoryData } = useCategoriesQuery();
  const {data: subcategoryData, isLoading: isSubcategoriesLoading} = useSubCategoriesQuery(category);
  const [editPost] = useEditPostMutation();

  const categoryOptions = categoryData?.data?.result?.map(item => ({
    value: item.category._id,
    label: item.category.name
  })) || [];

  const getSubcategories = () => {
    if (!category || !subcategoryData?.data?.length) {
      return [];
    }
    
    return subcategoryData.data.map(sub => ({
      value: sub._id,
      label: sub.name
    }));
  };

  const joditConfig = {
    height: isMobile ? 300 : 400,
    placeholder: "Write your post description here...",
    removeButtons: [ 
      'strikethrough', 'superscript', 'subscript', 
      'font', 'fontsize', 'paragraph', 'outdent', 'indent', 'undo', 
      'redo', 'cut', 'copy', 'paste', 'link', 'unlink', 'image', 'table', 'hr', 
      'video', 'file', 'print', 'source', 'preview', 'clean', 'highlight', 
      'directionality', 'left', 'right', 'center', 'justify', 'removeformat', 'formatblock', 
      'format', 'textcolor', 'bgcolor', 'fontsize', 'fontname', 'spellcheck', 'settings', 
      'fullsize', 'about', 'draft', 'statusbar', 'indent', 'outdent', 'insert', 'upload', 
      'replace', 'template', 'insertImage', 'insertTable', 'insertLink', 'insertText', 
      'selectAll', 'clear', 'save', 'code'
    ],
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setSubcategory(null);
  };

  const handleSubcategoryChange = (value) => {
    setSubcategory(value);
  };

  const handleDescriptionChange = (newContent) => {
    setDescription(newContent);
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    return isImage || Upload.LIST_IGNORE;
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    window.open(file.url || file.preview, '_blank');
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!title || !category || !description) {
      message.error('Please fill all required fields');
      return;
    }

    if (isEditing && !subcategory) {
      const selectedCategory = categoryOptions.find(cat => cat.value === category);
      const categoryName = selectedCategory?.label || 'selected category';
      const availableSubcategories = getSubcategories();
      const subcategoryNames = availableSubcategories.map(sub => sub.label).join(', ');
      
      if (availableSubcategories.length > 0) {
        message.error(
          `Please select a subcategory for ${categoryName}. Available subcategories: ${subcategoryNames}`
        );
      } else {
        message.error(
          `No subcategories available for ${categoryName}. Please contact support.`
        );
      }
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      if (subcategory) {
        formData.append('subCategory', subcategory);
      }
      formData.append('content', description);
      
      // Only append image if a new one was uploaded
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      } else if (isEditing && fileList.length === 0) {
        // If editing and image was removed
        formData.append("image", "");
      }

      let response;
      if (isEditing && postId) {
        response = await editPost({ id: postId, body: formData }).unwrap();
        toast.success('Post updated successfully');
      } else {
        response = await createPost(formData).unwrap();
        toast.success('Post created successfully');
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (!isEditing) {
        setTitle('');
        setCategory(null);
        setSubcategory(null);
        setDescription('');
        setFileList([]);
      }
    } catch (error) {
      console.error('Error:', error);
      message.error(
        error.data?.message || 
        (isEditing ? 'Failed to update post' : 'Failed to create post')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      title,
      category,
      subcategory,
      description,
      files: fileList.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url
      }))
    };
    
    localStorage.setItem('blogPostDraft', JSON.stringify(draftData));
    message.info('Draft saved successfully');
  };

  return (
    <div className={isEditing ? "py-4 px-4" : `min-h-screen ${isDarkMode ? 'dark-mode' : 'light-mode'} py-4 sm:py-8 px-2 sm:px-4`}>
      <div className="max-w-4xl mx-auto">
        <Card 
          className={isEditing ? "border-0 shadow-none" : "rounded-xl shadow-lg border-0 overflow-hidden"}
        >
          {!isEditing && (
            <div className="">
              <Image 
                src={"/images/create-post-image.png"} 
                height={1000} 
                width={1000} 
                alt='Create post header image'
                priority
              /> 
            </div>
          )}
          
          <div className="py-4 sm:p-6">
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
                    options={categoryOptions}
                    suffixIcon={<span className="text-gray-400">▼</span>}
                  />
                </Col>
                <Col xs={24} md={12}>
                  <Title level={5} className="text-gray-700 mb-2">Subcategory</Title>
                  <Select
                    placeholder={
                      isSubcategoriesLoading ? "Loading..." : 
                      !category ? "Select a category first" : 
                      getSubcategories().length === 0 ? "No subcategories available" : 
                      "Select a subcategory"
                    }
                    value={subcategory}
                    onChange={handleSubcategoryChange}
                    className="w-full"
                    size={isMobile ? "middle" : "large"}
                    options={getSubcategories()}
                    disabled={!category || getSubcategories().length === 0 || isSubcategoriesLoading}
                    suffixIcon={<span className="text-gray-400">▼</span>}
                    notFoundContent={category && "No subcategories found"}
                  />
                </Col>
              </Row>
            </div>
            
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
                  onBlur={newContent => setDescription(newContent)}
                />
              </Card>
              <div className="mt-2 text-xs text-gray-500">
                Tip: You can use the formatting toolbar to style your content
              </div>
            </div>
            
            <div className="mb-6 sm:mb-8">
              <Title level={5} className="text-gray-700 mb-2">Featured Images</Title>
              <Card 
                className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-blue-400 transition-all text-center cursor-pointer"
              >
                <Upload
                  listType={isMobile ? "picture" : "picture-card"}
                  fileList={fileList}
                  onChange={handleFileChange}
                  onPreview={handlePreview}
                  beforeUpload={beforeUpload}
                  className="flex justify-center"
                  maxCount={1}
                >
                  {fileList.length === 0 && (
                    isMobile ? (
                      <Button icon={<UploadOutlined />} size="middle">
                        Add Photo
                      </Button>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500 p-4">
                        <UploadOutlined className="text-2xl mb-2" />
                        <Text type="secondary">Click or drag files to upload</Text>
                      </div>
                    )
                  )}
                </Upload>
              </Card>
            </div>
            
            <Row justify="end" gutter={[8, 8]}>
              <Col>
                {
                  initialValues ? "" : <Button 
                  icon={<SaveOutlined />} 
                  size={isMobile ? "middle" : "large"}
                  className="flex items-center"
                  onClick={handleSaveDraft}
                >
                  {isMobile ? 'Save' : 'Save draft'}
                </Button>
                }
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  size={isMobile ? "middle" : "large"}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 border-0 shadow-md hover:shadow-lg"
                  onClick={handleSubmit}
                  loading={loading}
                >
                  {isEditing 
                    ? (isMobile ? 'Update' : 'Update Post') 
                    : (isMobile ? 'Publish' : 'Publish Post')
                  }
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