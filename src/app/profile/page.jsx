"use client"

import PostCard from '@/components/PostCard';
import ProfileBanner from '@/components/profile/ProfileBanner';
import React, { useState, useEffect } from 'react';
import { Card, Space, Typography, Grid, Modal, Form, Input, Button } from 'antd';
import { FiFile, FiBookmark, FiMessageSquare } from 'react-icons/fi';
import ProfilePostCard from '@/components/ProfilePostCard';

const { useBreakpoint } = Grid;
const { TextArea } = Input;

const ProfilePage = () => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isTablet = screens.md && !screens.lg;
    const isDesktop = screens.lg;

    // These would ideally come from props or API calls
    const stats = {
        totalPosts: 15,
        savedPosts: 5,
        comments: 0
    };
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [form] = Form.useForm();
    
    // Initialize state with value from localStorage if available, otherwise default to 'totalPosts'
    const [activeTab, setActiveTab] = useState(() => {
        // Only run on client-side
        if (typeof window !== 'undefined') {
            const savedTab = localStorage.getItem('profileActiveTab');
            return savedTab || 'totalPosts';
        }
        return 'totalPosts';
    });
    
    // Save activeTab to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('profileActiveTab', activeTab);
        }
    }, [activeTab]);
    
    // Mock data for different post types
    const [mockPosts, setMockPosts] = useState({
        totalPosts: Array.from({ length: stats.totalPosts }).map((_, i) => ({ 
            id: `total-${i}`, 
            type: 'total',
            title: `Post ${i + 1}`,
            author: {
                name: "John Doe",
                username: "@johndoe",
                avatar: "/images/profile.jpg"
            },
            timePosted: `${i + 1} days ago`,
            content: `This is the content of post ${i + 1}`,
            stats: {
                likes: Math.floor(Math.random() * 100),
                comments: Math.floor(Math.random() * 20),
                reads: Math.floor(Math.random() * 500)
            }
        })),
        savedPosts: Array.from({ length: stats.savedPosts }).map((_, i) => ({ 
            id: `saved-${i}`, 
            type: 'saved',
            title: `Saved Post ${i + 1}`,
            author: {
                name: "John Doe",
                username: "@johndoe",
                avatar: "/images/post.png"
            },
            timePosted: `${i + 1} days ago`,
            content: `This is the content of saved post ${i + 1}`,
            stats: {
                likes: Math.floor(Math.random() * 100),
                comments: Math.floor(Math.random() * 20),
                reads: Math.floor(Math.random() * 500)
            }
        })),
        comments: Array.from({ length: stats.comments }).map((_, i) => ({ 
            id: `comment-${i}`, 
            type: 'comment',
            title: `Comment Post ${i + 1}`,
            author: {
                name: "John Doe",
                username: "@johndoe",
                avatar: "/path/to/avatar.jpg"
            },
            timePosted: `${i + 1} days ago`,
            content: `This is the content of comment post ${i + 1}`,
            stats: {
                likes: Math.floor(Math.random() * 100),
                comments: Math.floor(Math.random() * 20),
                reads: Math.floor(Math.random() * 500)
            }
        }))
    });
    
    // Determine which posts to display based on active tab
    const postsToDisplay = mockPosts[activeTab] || [];
    
    // Generate tab label with proper accessibility
    const getTabLabel = (type) => {
        const labels = {
            totalPosts: 'Total Posts',
            savedPosts: 'Saved Posts',
            comments: 'Comments'
        };
        return labels[type] || type;
    };

    // Handle opening the edit modal
    const handleEditPost = (postId) => {
        // Find the post to edit based on the active tab
        const postToEdit = mockPosts[activeTab].find(post => post.id === postId);
        
        if (postToEdit) {
            setEditingPost(postToEdit);
            
            // Set form values
            form.setFieldsValue({
                title: postToEdit.title,
                content: postToEdit.content
            });
            
            setIsModalOpen(true);
        }
    };

    // Handle modal close
    const handleModalCancel = () => {
        setIsModalOpen(false);
        setEditingPost(null);
        form.resetFields();
    };

    // Handle form submission for editing a post
    const handleEditFormSubmit = (values) => {
        if (!editingPost) return;
        
        // Update the post in the appropriate array
        const updatedPosts = {...mockPosts};
        
        // Find and update the post in the active tab
        updatedPosts[activeTab] = updatedPosts[activeTab].map(post => {
            if (post.id === editingPost.id) {
                return {
                    ...post,
                    title: values.title,
                    content: values.content
                };
            }
            return post;
        });
        
        setMockPosts(updatedPosts);
        setIsModalOpen(false);
        setEditingPost(null);
        form.resetFields();
    };

    // Handle option select from ProfilePostCard
    const handleOptionSelect = (postId, option) => {
        if (option === 'edit') {
            handleEditPost(postId);
        } else if (option === 'delete') {
            // Handle delete functionality
            const updatedPosts = {...mockPosts};
            updatedPosts[activeTab] = updatedPosts[activeTab].filter(post => post.id !== postId);
            setMockPosts(updatedPosts);
        }
    };
    
    return (
        <div className="bg-[#E5E7EB] min-h-screen">
            <ProfileBanner />
            
            <main className="py-4 sm:py-6 lg:py-8 container mx-auto px-2 sm:px-4 lg:px-32">
                <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 sm:gap-6`}>
                    {/* Sidebar - Activity Stats */}
                    <aside className={`${isMobile ? 'w-full' : isTablet ? 'w-1/3' : 'w-1/4'} transition-all duration-300`}>
                        <Card 
                            title={<span className="text-base sm:text-lg font-medium">Your Activity</span>} 
                            className="shadow-sm hover:shadow transition-shadow"
                            aria-label="User statistics"
                            bodyStyle={{ padding: isMobile ? '12px' : '16px' }}
                        >
                            <Space direction="vertical" size={isMobile ? 'small' : 'middle'} className="w-full">
                                {Object.keys(stats).map(tabKey => (
                                    <button 
                                        key={tabKey}
                                        onClick={() => setActiveTab(tabKey)} 
                                        className={`flex items-center justify-between text-gray-700 w-full p-2 sm:p-3 rounded-md transition-all ${activeTab === tabKey ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}
                                        aria-selected={activeTab === tabKey}
                                        aria-controls={`${tabKey}-panel`}
                                        role="tab"
                                    >
                                        <span className="flex items-center cursor-pointer">
                                            {tabKey === 'totalPosts' && <FiFile className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 ${activeTab === tabKey ? 'text-indigo-600' : 'text-gray-500'}`} />}
                                            {tabKey === 'savedPosts' && <FiBookmark className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 ${activeTab === tabKey ? 'text-indigo-600' : 'text-gray-500'}`} />}
                                            {tabKey === 'comments' && <FiMessageSquare className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 ${activeTab === tabKey ? 'text-indigo-600' : 'text-gray-500'}`} />}
                                            <span className="text-sm sm:text-base">{getTabLabel(tabKey)}</span>
                                        </span>
                                        <span className={`font-bold text-sm sm:text-base ${activeTab === tabKey ? 'text-indigo-600' : 'text-gray-500'}`}>
                                            {stats[tabKey]}
                                        </span>
                                    </button>
                                ))}
                            </Space>
                        </Card>
                        
                        {/* Mobile-only: Filter Indicator */}
                        {isMobile && (
                            <div className="mt-3 bg-white p-2 rounded-md shadow-sm text-center text-sm text-gray-600">
                                Currently viewing: <span className="font-medium text-indigo-600">{getTabLabel(activeTab)}</span>
                            </div>
                        )}
                    </aside>
                    
                    {/* Posts Feed */}
                    <section 
                        className={`${isMobile ? 'w-full' : isTablet ? 'w-2/3' : 'w-3/4'} transition-all duration-300`} 
                        id={`${activeTab}-panel`}
                        role="tabpanel"
                        aria-labelledby={`${activeTab}-tab`}
                    >
                        <div className="mb-3 sm:mb-4 lg:mb-6">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">
                                {activeTab === 'totalPosts' && 'Your Posts'}
                                {activeTab === 'savedPosts' && 'Saved Posts'}
                                {activeTab === 'comments' && 'Your Comments'}
                            </h2>
                        </div>
                        <div className="flex flex-col gap-3 sm:gap-2 lg:gap-1">
                            {postsToDisplay.length > 0 ? (
                                postsToDisplay.map((post) => (
                                    <ProfilePostCard
                                        key={post.id} 
                                        postData={post} 
                                        className={`${isMobile ? 'p-3' : 'p-4'} hover:shadow-md transition-shadow`}
                                        onOptionSelect={handleOptionSelect}
                                    />
                                ))
                            ) : (
                                <div className="text-center p-6 sm:p-8 bg-white rounded-lg shadow-sm">
                                    <p className="text-gray-500 text-sm sm:text-base">
                                        No {activeTab === 'totalPosts' ? 'posts' : activeTab === 'savedPosts' ? 'saved posts' : 'comments'} to display
                                    </p>
                                    <button className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm sm:text-base">
                                        {activeTab === 'totalPosts' ? 'Create your first post' : 
                                         activeTab === 'savedPosts' ? 'Browse posts to save' : 
                                         ''}
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {/* Edit Post Modal */}
            <Modal
                title="Edit Post"
                open={isModalOpen}
                onCancel={handleModalCancel}
                footer={null}
                destroyOnClose={true}
                maskClosable={false}
                className="edit-post-modal"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEditFormSubmit}
                    initialValues={{
                        title: editingPost?.title || '',
                        content: editingPost?.content || ''
                    }}
                >
                    <Form.Item
                        name="title"
                        label="Post Title"
                        rules={[{ required: true, message: 'Please enter a title' }]}
                    >
                        <Input placeholder="Enter post title" />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Post Content"
                        rules={[{ required: true, message: 'Please enter some content' }]}
                    >
                        <TextArea 
                            placeholder="Enter post content" 
                            rows={6} 
                            autoSize={{ minRows: 6, maxRows: 12 }}
                        />
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={handleModalCancel}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Save Changes
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ProfilePage;