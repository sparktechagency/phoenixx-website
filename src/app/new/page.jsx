"use client";

import { useCategoriesQuery, useSubCategoriesQuery } from '@/features/Category/CategoriesApi';
import { useCreatePostMutation, useEditPostMutation } from '@/features/post/postApi';
import {
  SaveOutlined,
  UploadOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Grid,
  Input,
  message,
  Row,
  Select,
  Space,
  Typography,
  Upload
} from 'antd';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { baseURL } from '../../../utils/BaseURL';
import { useAuth } from '../../hooks/useAuth';
import { ThemeContext } from '../ClientLayout';


const JoditEditor = dynamic(() => import('jodit-react'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const BlogPostForm = ({ initialValues, isEditing = false, onSuccess, postId }) => {
  useAuth();
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

  // API hooks
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const { data: categoryData } = useCategoriesQuery();
  const { data: subcategoryData, isLoading: isSubcategoriesLoading } = useSubCategoriesQuery(category);
  const [editPost] = useEditPostMutation();

  // Responsive breakpoints
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  // Memoized category options
  const categoryOptions = useMemo(() => (
    categoryData?.data?.result?.map(item => ({
      value: item.category._id,
      label: item.category.name
    })) || []
  ), [categoryData]);

  const getSubcategories = useMemo(() => {
    if (!category || !subcategoryData?.data?.length) return [];
    return subcategoryData.data.map(sub => ({
      value: sub._id,
      label: sub.name
    }));
  }, [category, subcategoryData]);

  // Enhanced Jodit editor configuration with proper dark mode support
  const joditConfig = useMemo(() => ({
    height: isMobile ? 300 : 400,
    placeholder: "Write your post description here...",
    theme: isDarkMode ? 'dark' : 'default',
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
    // Enhanced dark mode styling
    colors: {
      greyscale: isDarkMode ? '#ffffff,#f5f5f5,#e8e8e8,#dddddd,#c0c0c0,#a9a9a9,#808080,#696969,#545454,#3f3f3f,#2f2f2f,#1e1e1e,#0f0f0f,#080808,#000000' : '#000000,#333333,#555555,#777777,#999999,#BBBBBB,#DDDDDD,#FFFFFF',
    },
    style: {
      backgroundColor: isDarkMode ? '#1f2937' : '#fff',  // Match with bg-gray-800 from TailwindCSS
      color: isDarkMode ? '#e5e7eb' : '#374151',  // Match with text-gray-200 from TailwindCSS
    },
    // Custom CSS for dark mode compatibility
    extraCss: isDarkMode ?
      `.jodit-container,.jodit-workplace {
        background-color: #1f2937 !important;
        color: #e5e7eb !important;
        border-color: #4b5563 !important;
      }
      .jodit-toolbar {
        background-color: #374151 !important;
        border-color: #4b5563 !important;
      }
      .jodit-toolbar__box {
        background-color: #374151 !important;
        border-color: #4b5563 !important;
      }
      .jodit-toolbar__box a.jodit-toolbar-button {
        color: #e5e7eb !important;
      }
      .jodit-toolbar__box a.jodit-toolbar-button:hover {
        background-color: #4b5563 !important;
        color: #ffffff !important;
      }
      .jodit-container.jodit-wysiwyg {
        color: #e5e7eb !important;
        background-color: #1f2937 !important;
      }
      .jodit-wysiwyg {
        color: #e5e7eb !important;
        background-color: #1f2937 !important;
      }
      .jodit-workplace {
        background-color: #1f2937 !important;
      }
      .jodit-status-bar {
        background-color: #374151 !important;
        border-color: #4b5563 !important;
        color: #e5e7eb !important;
      }` : '',
    // Event handlers for dark mode fixes
    events: {
      afterInit: (editor) => {
        if (isDarkMode) {
          if (editor && editor.workplace) {
            editor.workplace.style.backgroundColor = '#1f2937';
            editor.workplace.style.color = '#e5e7eb';

            if (editor.editor) {
              editor.editor.style.backgroundColor = '#1f2937';
              editor.editor.style.color = '#e5e7eb';
            }
          }
        }
      }
    }
  }), [isMobile, isDarkMode]);

  // Add CSS for dark mode to document head
  useEffect(() => {
    if (isDarkMode) {
      // Create style element for Jodit dark mode
      const style = document.createElement('style');
      style.id = 'jodit-dark-mode-styles';
      style.innerHTML = `
        .jodit-container.jodit-dark-theme,
        .jodit-container.jodit-dark-theme .jodit-workplace,
        .jodit-container.jodit-dark-theme .jodit-wysiwyg {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
        }
        .jodit-dark-theme .jodit-toolbar__box {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
        }
        .jodit-dark-theme .jodit-toolbar {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
        }
        .jodit-dark-theme .jodit-wysiwyg {
          color: #e5e7eb !important;
        }
        .dark-editor .jodit-container {
          border-color: #4b5563 !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        if (document.getElementById('jodit-dark-mode-styles')) {
          document.head.removeChild(document.getElementById('jodit-dark-mode-styles'));
        }
      };
    }
  }, [isDarkMode]);

  // Load draft data when component mounts
  useEffect(() => {
    if (!isEditing && !initialValues) {
      const savedDraft = localStorage.getItem('blogPostDraft');
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          setTitle(draftData.title || '');
          setCategory(draftData.category || null);
          setSubcategory(draftData.subcategory || null);
          setDescription(draftData.description || '');

          if (draftData.files && draftData.files.length > 0) {
            setFileList(draftData.files.map(file => ({
              uid: file.uid || `-${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              status: 'done',
              url: file.url,
              thumbUrl: file.url
            })));
          }
          message.info('Draft loaded successfully');
        } catch (error) {
          console.error('Error loading draft:', error);
          localStorage.removeItem('blogPostDraft');
        }
      }
    }
  }, [isEditing, initialValues]);

  // Initialize form with initial values when editing
  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || '');
      setCategory(initialValues.category || null);
      setSubcategory(initialValues.subCategory || null);
      setDescription(initialValues.content || '');

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

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleCategoryChange = (value) => {
    setCategory(value);
    setSubcategory(null);
  };
  const handleSubcategoryChange = (value) => setSubcategory(value);
  const handleDescriptionChange = (newContent) => setDescription(newContent);

  const handleFileChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) message.error('You can only upload image files!');
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

  const handleSaveDraft = () => {
    const draftData = {
      title,
      category,
      subcategory,
      description,
      files: fileList.map(file => ({
        uid: file.uid,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url || file.thumbUrl
      }))
    };

    localStorage.setItem('blogPostDraft', JSON.stringify(draftData));
    toast.success('Draft saved successfully');
  };

  const handleClearDraft = () => {
    localStorage.removeItem('blogPostDraft');
    setTitle('');
    setCategory(null);
    setSubcategory(null);
    setDescription('');
    setFileList([]);
    message.success('Draft cleared successfully');
  };

  const handleSubmit = async () => {
    if (!title || !category || !description) {
      message.error('Please fill all required fields');
      return;
    }

    if (isEditing && !subcategory) {
      const selectedCategory = categoryOptions.find(cat => cat.value === category);
      const categoryName = selectedCategory?.label || 'selected category';
      const subcategoryNames = getSubcategories.map(sub => sub.label).join(', ');

      if (getSubcategories.length > 0) {
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
      if (subcategory) formData.append('subCategory', subcategory);
      formData.append('content', description);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      } else if (isEditing && fileList.length === 0) {
        formData.append("image", "");
      }

      const response = isEditing && postId
        ? await editPost({ id: postId, body: formData }).unwrap()
        : await createPost(formData).unwrap();

      toast.success(isEditing ? 'Post updated successfully' : 'Post created successfully');

      if (!isEditing) {
        router.push('/')
      }

      if (!isEditing) {
        localStorage.removeItem('blogPostDraft');
      }

      if (onSuccess) onSuccess();

      if (!isEditing) {
        setTitle('');
        setCategory(null);
        setSubcategory(null);
        setDescription('');
        setFileList([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error.data?.message ||
        (isEditing ? 'Failed to update post' : 'Failed to create post')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen py-4 sm:py-8 px-2 sm:px-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}>
      <div className="max-w-4xl mx-auto">
        <Card
          className={`rounded-xl shadow-lg border-0 overflow-hidden transition-colors duration-200 ${isEditing ? 'border-0 shadow-none' : ''
            } ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          bodyStyle={{ backgroundColor: 'transparent' }}
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

          <div className={`py-4 sm:p-6 ${isDarkMode ? 'dark-editor' : ''}`}>
            {/* Title Input */}
            <div className="mb-6 sm:mb-8">
              <Title level={5} className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Title</Title>
              <Input
                placeholder="Write your post title here..."
                value={title}
                onChange={handleTitleChange}
                maxLength={300}
                suffix={`${title.length}/300`}
                className={`py-2 sm:py-3 px-4 rounded-lg hover:border-blue-400 focus:border-blue-500 transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                size={isMobile ? "middle" : "large"}
              />
            </div>

            {/* Category and Subcategory Selectors */}
            <div className="mb-6 sm:mb-8">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Title level={5} className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Category</Title>
                  <Select
                    placeholder="Select a category"
                    value={category}
                    onChange={handleCategoryChange}
                    className={`w-full ${isDarkMode ? 'ant-select-dark' : ''
                      }`}
                    size={isMobile ? "middle" : "large"}
                    options={categoryOptions}
                    dropdownClassName={isDarkMode ? 'dark-dropdown' : ''}
                  />
                </Col>
                <Col xs={24} md={12}>
                  <Title level={5} className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Subcategory</Title>
                  <Select
                    placeholder={
                      isSubcategoriesLoading ? "Loading..." :
                        !category ? "Select a category first" :
                          getSubcategories.length === 0 ? "No subcategories available" :
                            "Select a subcategory"
                    }
                    value={subcategory}
                    onChange={handleSubcategoryChange}
                    className={`w-full ${isDarkMode ? 'ant-select-dark' : ''
                      }`}
                    size={isMobile ? "middle" : "large"}
                    options={getSubcategories}
                    disabled={!category || getSubcategories.length === 0 || isSubcategoriesLoading}
                    notFoundContent={category && "No subcategories found"}
                    dropdownClassName={isDarkMode ? 'dark-dropdown' : ''}
                  />
                </Col>
              </Row>
            </div>

            {/* Content Editor */}
            <div className="mb-6 sm:mb-8">
              <Title level={5} className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Description</Title>
              <Card
                className={`border rounded-lg overflow-hidden hover:border-blue-300 transition-all p-0 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}
                bodyStyle={{ padding: 0 }}
              >
                <div className={`${isDarkMode ? 'jodit-dark-theme' : ''}`}>
                  <JoditEditor
                    ref={editorRef}
                    value={description}
                    config={joditConfig}
                    tabIndex={1}
                    onBlur={handleDescriptionChange}
                    className={isDarkMode ? 'jodit-dark-mode' : ''}
                  />
                </div>
              </Card>
              <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Tip: You can use the formatting toolbar to style your content
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-6 sm:mb-8">
              <Title level={5} className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Featured Images</Title>
              <Card
                className={`border-2 border-dashed rounded-xl hover:border-blue-400 transition-all text-center cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                  }`}
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
                      <Button
                        icon={<UploadOutlined />}
                        size="middle"
                        className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}
                      >
                        Add Photo
                      </Button>
                    ) : (
                      <div className={`flex flex-col items-center p-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        <UploadOutlined className="text-2xl mb-2" />
                        <Text>Click or drag files to upload</Text>
                      </div>
                    )
                  )}
                </Upload>
              </Card>
            </div>

            {/* Form Actions */}
            <Row justify="end" gutter={[8, 8]}>
              <Col>
                {!initialValues && (
                  <Space>
                    <Button
                      icon={<SaveOutlined />}
                      size={isMobile ? "middle" : "large"}
                      className={`flex items-center ${isDarkMode ? 'text-gray-200 hover:text-white' : 'text-gray-800'
                        }`}
                      onClick={handleSaveDraft}
                    >
                      {isMobile ? 'Save' : 'Save draft'}
                    </Button>
                    {localStorage.getItem('blogPostDraft') && (
                      <Button
                        danger
                        size={isMobile ? "middle" : "large"}
                        onClick={handleClearDraft}
                      >
                        {isMobile ? 'Clear' : 'Clear draft'}
                      </Button>
                    )}
                  </Space>
                )}
              </Col>
              <Col>
                <Button
                  type="primary"
                  size={isMobile ? "middle" : "large"}
                  className="border-0 shadow-md hover:shadow-lg"
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
