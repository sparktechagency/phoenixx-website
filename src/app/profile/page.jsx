"use client"
import React, { useState } from 'react';
import { Card, Space, Grid, Modal, Form, Input, Button, message } from 'antd';
import { FiFile, FiBookmark, FiMessageSquare } from 'react-icons/fi';
import ProfilePostCard from '@/components/ProfilePostCard';
import ProfileBanner from '@/components/profile/ProfileBanner';
import { useDeletePostMutation, useMyPostQuery } from '@/features/post/postApi';
import { formatDistanceToNow } from 'date-fns';
import { useGetSaveAllPostQuery } from '@/features/SavePost/savepostApi';

const { useBreakpoint } = Grid;
const { TextArea } = Input;

const ProfilePage = () => {
    const screens = useBreakpoint();
    const { data: postsData, isLoading, refetch } = useMyPostQuery();
    const {data:savePost} = useGetSaveAllPostQuery();
    const [deletePost] = useDeletePostMutation();
    const [userPosts, setUserPosts] = useState(postsData?.data || []);

    // State for UI
    const [activeTab, setActiveTab] = useState('totalPosts');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [form] = Form.useForm();

    // Update local state when data is fetched
    React.useEffect(() => {
        if (postsData?.data) {
            setUserPosts(postsData.data);
        }
    }, [postsData]);

    // Stats based on actual data
    const stats = {
        totalPosts: userPosts.length,
        savedPosts: userPosts.filter(post => post.isSaved).length,
        comments: userPosts.reduce((sum, post) => sum + post.comments.length, 0)
    };

    // Format date to relative time
    const formatDate = (dateString) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    };

    // Transform API data to match your card component's expected format
    const transformPostData = (post) => ({
        id: post._id,
        title: post.title,
        content: post.content,
        image: post.image,
        author: {
            name: post.author.userName,
            username: `@${post.author.userName.toLowerCase()}`,
            avatar: post.author.avatar || '/images/default-avatar.png'
        },
        timePosted: formatDate(post.createdAt),
        stats: {
            likes: post.likes.length,
            comments: post.comments.length,
            reads: post.views
        }
    });

    // Handle opening the edit modal
    const handleEditPost = (postId) => {
        const postToEdit = userPosts.find(post => post._id === postId);
        if (postToEdit) {
            setEditingPost(postToEdit);
            form.setFieldsValue({
                title: postToEdit.title,
                content: postToEdit.content.replace(/<[^>]*>/g, '') // Remove HTML tags for editing
            });
            setIsEditModalOpen(true);
        }
    };

    // Handle modal closes
    const handleEditModalCancel = () => {
        setIsEditModalOpen(false);
        setEditingPost(null);
        form.resetFields();
    };

    const handleDeleteModalCancel = () => {
        setIsDeleteModalOpen(false);
        setPostToDelete(null);
    };

    // Handle form submission for editing a post
    const handleEditFormSubmit = async (values) => {
        if (!editingPost) return;
        
        // Here you would typically make an API call to update the post
        // For now, we'll just close the modal
        setIsEditModalOpen(false);
        setEditingPost(null);
        form.resetFields();
    };

    // Handle delete confirmation
    const handleConfirmDelete = async () => {
        if (!postToDelete) return;
        
        try {
            // Optimistic UI update - remove the post immediately
            setUserPosts(prevPosts => prevPosts.filter(post => post._id !== postToDelete));
            
            // Show success message
            message.success('Post deleted successfully');
            
            // Call the API to delete the post
            await deletePost(postToDelete).unwrap();
            
            // Close the delete modal
            setIsDeleteModalOpen(false);
            setPostToDelete(null);
            
            // Refetch data to ensure consistency (optional)
            refetch();
        } catch (error) {
            // If there's an error, revert the UI change
            if (postsData?.data) {
                setUserPosts(postsData.data);
            }
            message.error('Failed to delete post');
            console.error("Failed to delete the post", error);
        }
    };

    // Handle option select from ProfilePostCard
    const handleOptionSelect = async (postId, option) => {
        if (option === 'edit') {
            handleEditPost(postId);
        } else if (option === 'delete') {
            setPostToDelete(postId);
            setIsDeleteModalOpen(true);
        }
    };

    // Get posts to display based on active tab
    const getPostsToDisplay = () => {
        switch (activeTab) {
            case 'totalPosts':
                return userPosts;
            case 'savedPosts':
                return userPosts.filter(post => post.isSaved);
            case 'comments':
                return userPosts.filter(post => post.comments.length > 0);
            default:
                return userPosts;
        }
    };

    const postsToDisplay = getPostsToDisplay();

    return (
        <div className="bg-[#E5E7EB] min-h-screen">
            <ProfileBanner />
            
            <main className="py-4 sm:py-6 lg:py-8 container mx-auto px-2 sm:px-4 lg:px-32">
                <div className={`flex ${screens.md ? 'flex-row' : 'flex-col'} gap-4 sm:gap-6`}>
                    {/* Sidebar - Activity Stats */}
                    <aside className={`${screens.md ? screens.lg ? 'w-1/4' : 'w-1/3' : 'w-full'}`}>
                        <Card 
                            title="Your Activity" 
                            className="shadow-sm hover:shadow transition-shadow"
                            bodyStyle={{ padding: screens.md ? '16px' : '12px' }}
                        >
                            <Space direction="vertical" size="middle" className="w-full">
                                {[
                                    { key: 'totalPosts', icon: <FiFile />, label: 'Total Posts' },
                                    { key: 'savedPosts', icon: <FiBookmark />, label: 'Saved Posts' },
                                    { key: 'comments', icon: <FiMessageSquare />, label: 'Comments' }
                                ].map(({ key, icon, label }) => (
                                    <button 
                                        key={key}
                                        onClick={() => setActiveTab(key)} 
                                        className={`flex items-center justify-between w-full p-3 cursor-pointer rounded-md transition-all ${
                                            activeTab === key ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        <span className="flex items-center">
                                            {React.cloneElement(icon, {
                                                className: `mr-3 ${activeTab === key ? 'text-indigo-600' : 'text-gray-500'}`
                                            })}
                                            <span>{label}</span>
                                        </span>
                                        <span className={`font-bold ${activeTab === key ? 'text-indigo-600' : 'text-gray-500'}`}>
                                            {stats[key]}
                                        </span>
                                    </button>
                                ))}
                            </Space>
                        </Card>
                    </aside>
                    
                    {/* Posts Feed */}
                    <section className={`${screens.md ? screens.lg ? 'w-3/4' : 'w-2/3' : 'w-full'}`}>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">
                                {activeTab === 'totalPosts' && 'Your Posts'}
                                {activeTab === 'savedPosts' && 'Saved Posts'}
                                {activeTab === 'comments' && 'Your Comments'}
                            </h2>
                        </div>
                        <div className="flex flex-col gap-4">
                            {isLoading ? (
                                <div>Loading...</div>
                            ) : postsToDisplay.length > 0 ? (
                                postsToDisplay.map((post) => (
                                    <div key={post._id} className="transition-all duration-300">
                                        <ProfilePostCard
                                            postData={transformPostData(post)}
                                            onOptionSelect={handleOptionSelect}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                                    <p className="text-gray-500">
                                        No {activeTab === 'totalPosts' ? 'posts' : 
                                           activeTab === 'savedPosts' ? 'saved posts' : 
                                           'comments'} to display
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {/* Edit Post Modal */}
            <Modal
                title="Edit Post"
                open={isEditModalOpen}
                onCancel={handleEditModalCancel}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEditFormSubmit}
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
                        <Button onClick={handleEditModalCancel}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Save Changes
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Delete Post"
                open={isDeleteModalOpen}
                onCancel={handleDeleteModalCancel}
                footer={[
                    <Button key="cancel" onClick={handleDeleteModalCancel}>
                        Cancel
                    </Button>,
                    <Button 
                        key="delete" 
                        type="primary" 
                        danger
                        onClick={handleConfirmDelete}
                    >
                        Delete
                    </Button>,
                ]}
                centered
            >
                <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default ProfilePage;