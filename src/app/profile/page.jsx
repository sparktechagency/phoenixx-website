"use client"
import React, { useState, useEffect } from 'react';
import { Card, Space, Grid, Modal, Form, Input, Button, message } from 'antd';
import { FiFile, FiBookmark, FiMessageSquare } from 'react-icons/fi';
import ProfilePostCard from '@/components/ProfilePostCard';
import ProfileBanner from '@/components/profile/ProfileBanner';
import { useDeletePostMutation, useLikePostMutation, useMyPostQuery } from '@/features/post/postApi';
import { formatDistanceToNow } from 'date-fns';
import { useGetSaveAllPostQuery, useSavepostMutation } from '@/features/SavePost/savepostApi';
import toast from 'react-hot-toast';
import { useMyCommentPostQuery } from '@/features/comments/commentApi';

const { useBreakpoint } = Grid;
const { TextArea } = Input;

const ProfilePage = () => {
    const screens = useBreakpoint();
    const { data: postsData, isLoading: isPostsLoading, isError: isPostsError, refetch: refetchPosts } = useMyPostQuery();
    const {
        data: savePostData,
        isLoading: isSavePostsLoading,
        isError: isSavePostError,
        refetch: refetchSavedPosts
    } = useGetSaveAllPostQuery();

    const { data: myCommentPost, isLoading: myCommentPostLoading } = useMyCommentPostQuery();

    const [deletePost] = useDeletePostMutation();
    const [savepost, { isLoading: isUnsaving }] = useSavepostMutation();

    // State management
    const [activeTab, setActiveTab] = useState(() =>
        typeof window !== 'undefined' ? localStorage.getItem('profileActiveTab') || 'totalPosts' : 'totalPosts'
    );
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [form] = Form.useForm();
    const [likePost] = useLikePostMutation();
    const [isDeleting, setIsDeleting] = useState(false);

    // Store active tab in localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('profileActiveTab', activeTab);
        }
    }, [activeTab]);

    // Error handling
    useEffect(() => {
        if (isPostsError) message.error('Failed to load your posts');
        if (isSavePostError) message.error('Failed to load saved posts');
    }, [isPostsError, isSavePostError]);

    // Data preparation
    const userPosts = postsData?.data || [];
    const savedPosts = savePostData?.data || [];
    const myComment = myCommentPost?.data || [];

    // Activity stats
    const stats = {
        totalPosts: userPosts.length || 0,
        savedPosts: savedPosts.length || 0,
        comments: myComment.length || 0
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return 'Just now';
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (error) {
            return 'Just now';
        }
    };

    // Transform post data for rendering
    const transformPostData = (post) => ({
        ...post,
        createdAt: formatDate(post.createdAt),
        isSavedPost: false
    });

    // Transform saved post data
    const transformSavedPostData = (savedPost) => {
        if (!savedPost || !savedPost.postId) return null;

        return {
            ...savedPost.postId,
            _id: savedPost.postId._id, // Original post ID
            savedPostId: savedPost._id, // Saved post record ID for unsaving
            savedAt: formatDate(savedPost.createdAt),
            isSavedPost: true // Flag to identify as a saved post
        };
    };

    // Handle post actions
    const handleEditPost = (postId) => {
        const postToEdit = userPosts.find(post => post._id === postId);
        if (postToEdit) {
            setEditingPost(postToEdit);
            form.setFieldsValue({
                title: postToEdit.title,
                content: postToEdit.content?.replace(/<[^>]*>/g, '') || ''
            });
            setIsEditModalOpen(true);
        }
    };

    const handleEditFormSubmit = async (values) => {
        if (!editingPost) return;

        try {
            // API call would go here
            setIsEditModalOpen(false);
            setEditingPost(null);
            form.resetFields();
            message.success('Post updated successfully');
            refetchPosts();
        } catch (error) {
            message.error('Failed to update post');
        }
    };

    const handleConfirmDelete = async () => {
        if (!postToDelete) return;

        setIsDeleting(true);
        try {
            await deletePost(postToDelete).unwrap();
            message.success('Post deleted successfully');
            refetchPosts();
            setIsDeleteModalOpen(false);
            setPostToDelete(null);
        } catch (error) {
            message.error('Failed to delete post');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOptionSelect = (postId, option) => {
        if (option === 'edit') {
            handleEditPost(postId);
        } else if (option === 'delete') {
            setPostToDelete(postId);
            setIsDeleteModalOpen(true);
        }
    };

    const handleLike = async (postId) => {
        try {
            await likePost(postId).unwrap();
            refetchPosts();
            // Also refetch saved posts if we're in that tab to keep likes in sync
            if (activeTab === 'savedPosts') {
                refetchSavedPosts();
            }
        } catch (error) {
            message.error('Failed to like post');
            console.error('Like error:', error);
        }
    };

    // Handle unsaving a post
    const handleUnsave = async (postId) => {
        // Find the saved post record that contains this post
        const savedPostRecord = savedPosts.find(item =>
            item.postId && item.postId._id === postId
        );

        // console.log(savedPostRecord?.postId?._id)

        if (!savedPostRecord) {
            message.error('Could not find saved post record');
            return;
        }

        try {
            // Use the saved post record ID (not the original post ID)
            const response = await savepost({ postId: savedPostRecord?.postId?._id }).unwrap();
            console.log(response)
            toast.success('Post removed from saved items');
            refetchSavedPosts();
        } catch (error) {
            console.error('Error unsaving post:', error);
            toast.error('Failed to unsave post');
        }
    };

    // Get posts based on active tab
    const getPostsToDisplay = () => {
        switch (activeTab) {
            case 'totalPosts':
                return userPosts.map(transformPostData);
            case 'savedPosts':
                return savedPosts
                    .map(transformSavedPostData)
                    .filter(Boolean);
            case 'comments':
                return userPosts
                    .filter(post => post.comments?.length > 0)
                    .map(transformPostData);
            default:
                return userPosts.map(transformPostData);
        }
    };

    const postsToDisplay = getPostsToDisplay();
    const isLoading = isPostsLoading || (activeTab === 'savedPosts' && isSavePostsLoading);

    // Tab configuration
    const tabs = [
        { key: 'totalPosts', icon: <FiFile />, label: 'Total Posts' },
        { key: 'savedPosts', icon: <FiBookmark />, label: 'Saved Posts' },
        { key: 'comments', icon: <FiMessageSquare />, label: 'Comments' }
    ];

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
                                {tabs.map(({ key, icon, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        className={`flex items-center justify-between w-full p-3 rounded-md transition-all ${activeTab === key
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'hover:bg-gray-100 text-gray-700'
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

                        {isLoading ? (
                            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-500">Loading...</p>
                            </div>
                        ) : postsToDisplay.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {postsToDisplay.map((post) => (
                                    <ProfilePostCard
                                        key={`${post.isSavedPost ? 'saved-' : ''}${post._id}`}
                                        postData={post}
                                        onLike={handleLike}
                                        onOptionSelect={handleOptionSelect}
                                        onUnsave={handleUnsave}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-500">
                                    {activeTab === 'totalPosts' ? 'No posts to display' :
                                        activeTab === 'savedPosts' ? 'No saved posts to display' :
                                            'No comments to display'}
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* Edit Post Modal */}
            <Modal
                title="Edit Post"
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setEditingPost(null);
                    form.resetFields();
                }}
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
                        <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit">Save Changes</Button>
                    </div>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Delete Post"
                open={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>,
                    <Button
                        key="delete"
                        type="primary"
                        danger
                        onClick={handleConfirmDelete}
                        loading={isDeleting}
                    >
                        Delete
                    </Button>
                ]}
                centered
            >
                <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default ProfilePage;