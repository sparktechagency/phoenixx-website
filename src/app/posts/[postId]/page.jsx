"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, Card, Button, Input, Select, Dropdown, Menu, Empty, message } from 'antd';
import { MessageOutlined, EllipsisOutlined } from '@ant-design/icons';
import { FaHeart, FaRegHeart, FaEye } from "react-icons/fa";
import Image from 'next/image';
import { usePostDetailsQuery, useLikePostMutation } from '@/features/post/postApi';
import { formatDistanceToNow } from 'date-fns';
import { useGetSaveAllPostQuery, useSavepostMutation } from '@/features/SavePost/savepostApi';
import ReportPostModal from '@/components/ReportPostModal';
import { baseURL } from '../../../../utils/BaseURL';
import { toast } from 'react-toastify';

const PostDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { postId } = params;
  
  // API hooks
  const { data: postDetails, isLoading, error: postError } = usePostDetailsQuery(postId);
  const [likePost] = useLikePostMutation();
  const [savepost, { isLoading: isSaving }] = useSavepostMutation();
  const { data: savedPostsData } = useGetSaveAllPostQuery();

  // State management
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [commentSort, setCommentSort] = useState('relevant');
  const [windowWidth, setWindowWidth] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [login_user_id, setLoginUserId] = useState(null);
  const commentInputRef = useRef(null);

  // Derived state
  const post = postDetails?.data;
  const isSaved = savedPostsData?.data?.some(savedPost => savedPost?.postId?._id === postId);
  const isLiked = post?.likes?.includes(login_user_id);
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  // Current user data
  const currentUser = { 
    _id: login_user_id || "user1",
    userName: "Current User", 
    name: "Current User",
    email: "current@user.com",
    avatar: "/images/profile2.jpg",
    username: "@currentuser"
  };

  // Effects
  useEffect(() => {
    setLoginUserId(localStorage.getItem("login_user_id"));
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (post?.comments && Array.isArray(post.comments)) {
      setComments(post.comments);
    }
  }, [post]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const sortComments = (comments) => {
    const sorted = [...comments];
    return commentSort === 'recent'
      ? sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : sorted.sort((a, b) => b.likes.length - a.likes.length);
  };

  // Event handlers
  const handleLike = async () => {
    if (!login_user_id) return message.warning("Please login to like this post");
    try {
      await likePost(postId).unwrap();
    } catch (error) {
      console.error("Error liking post:", error);
      message.error("Failed to like post");
    }
  };

  const handleSaveUnsave = async () => {
    if (!login_user_id) return message.warning("Please login to save this post");
    try {
      const response = await savepost({ postId }).unwrap();
      message.success(response?.data !== null ? 'Post saved successfully' : 'Post removed from saved items');
    } catch (error) {
      console.error('Save/Unsave error:', error);
      message.error('Failed to update saved status');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success("URL copied to clipboard"))
      .catch(() => message.error("Failed to copy URL"));
  };

  const handleCommentButtonClick = () => {
    // Focus the comment input when comment button is clicked
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !login_user_id) return;
    
    const newComment = {
      _id: `c${Date.now()}`,
      author: currentUser,
      content: commentText,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
    message.success("Comment added successfully");
  };

  const handleCommentLike = (commentId) => {
    setComments(prev => prev.map(comment => {
      if (comment._id === commentId) {
        const isLiked = comment.likes.includes(login_user_id);
        return {
          ...comment,
          likes: isLiked 
            ? comment.likes.filter(id => id !== login_user_id)
            : [...comment.likes, login_user_id]
        };
      }
      
      if (comment.comments?.length) {
        return {
          ...comment,
          comments: comment.comments.map(child => 
            child._id === commentId 
              ? {
                  ...child,
                  likes: child.likes.includes(login_user_id)
                    ? child.likes.filter(id => id !== login_user_id)
                    : [...child.likes, login_user_id]
                }
              : child
          )
        };
      }
      
      return comment;
    }));
  };

  const handleReplySubmit = (parentCommentId) => {
    if (!replyText.trim() || !login_user_id) return;
    
    const newReply = {
      _id: `c${Date.now()}`,
      author: currentUser,
      content: replyText,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };
    
    setComments(prev => prev.map(comment => {
      if (comment._id === parentCommentId) {
        return {
          ...comment,
          comments: [...(comment.comments || []), newReply]
        };
      }
      return comment;
    }));
    
    setReplyText('');
    setReplyingTo(null);
    message.success("Reply added successfully");
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditCommentText(currentText);
  };

  const handleUpdateComment = (commentId) => {
    if (!editCommentText.trim()) return;
    
    setComments(prev => prev.map(comment => {
      if (comment._id === commentId) {
        return { ...comment, content: editCommentText };
      }
      
      if (comment.comments?.length) {
        return {
          ...comment,
          comments: comment.comments.map(child => 
            child._id === commentId 
              ? { ...child, content: editCommentText }
              : child
          )
        };
      }
      
      return comment;
    }));
    
    setEditingCommentId(null);
    setEditCommentText('');
    message.success("Comment updated successfully");
  };

  const handleDeleteComment = (commentId) => {
    setComments(prev => 
      prev.filter(comment => comment._id !== commentId)
         .map(comment => {
           if (comment.comments?.length) {
             return {
               ...comment,
               comments: comment.comments.filter(child => child._id !== commentId)
             };
           }
           return comment;
         })
    );
    message.success("Comment deleted successfully");
  };

  // Render functions
  const postMenuItems = [
    {
      key: 'report',
      label: (
        <div className="flex items-center gap-2 py-1">
          <Image src="/icons/report.png" height={16} width={16} alt="report" />
          <span>Report Post</span>
        </div>
      ),
    },
  ];

  const handlePostMenuClick = ({ key }) => {
    if (key === 'save') handleSaveUnsave();
    else if (key === 'report') setShowReportModal(true);
  };

  const renderCommentMenu = (comment) => {
    const isCurrentUserComment = comment.author._id === login_user_id;
    
    return (
      <Menu>
        {isCurrentUserComment && (
          <>
            <Menu.Item key="edit" onClick={() => handleEditComment(comment._id, comment.content)}>
              Edit Comment
            </Menu.Item>
            <Menu.Item key="delete" onClick={() => handleDeleteComment(comment._id)}>
              Delete Comment
            </Menu.Item>
          </>
        )}
        {!isCurrentUserComment && (
          <Menu.Item key="report">Report Comment</Menu.Item>
        )}
      </Menu>
    );
  };

  const renderComment = (comment, depth = 0) => {
    const isEditing = editingCommentId === comment._id;
    const isCommentLiked = comment.likes.includes(login_user_id);
    const commentAuthor = comment.author || { userName: "Unknown", avatar: null };
    
    return (
      <div 
        key={comment._id} 
        className={`mb-4 ${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}
      >
        <Card className="rounded-2xl">
          <div className="flex items-center justify-start mb-3">
            {commentAuthor.avatar ? (
              <Avatar src={commentAuthor.avatar} size={32} />
            ) : (
              <Avatar size={32}>{commentAuthor.userName?.charAt(0).toUpperCase() || 'U'}</Avatar>
            )}
            <div className="ml-2">
              <div className="font-medium">{commentAuthor.userName}</div>
              <div className="text-xs text-gray-500">{formatDate(comment.createdAt)}</div>
            </div>
            <div className="ml-auto">
              <Dropdown 
                overlay={renderCommentMenu(comment)} 
                trigger={['click']}
                placement="bottomRight"
              >
                <Button type="text" icon={<EllipsisOutlined />} />
              </Dropdown>
            </div>
          </div>

          {isEditing ? (
            <div className="mb-3">
              <Input.TextArea 
                value={editCommentText}
                onChange={(e) => setEditCommentText(e.target.value)}
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
              <div className="flex justify-end mt-2">
                <Button onClick={() => setEditingCommentId(null)} className="mr-2">
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => handleUpdateComment(comment._id)}
                  disabled={!editCommentText.trim()}
                >
                  Update
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 mb-3 pl-10">
              {comment.content}
            </p>
          )}

          <div className="flex items-center text-gray-600">
            <button 
              className="flex items-center mr-4 hover:text-blue-500"
              onClick={() => handleCommentLike(comment._id)}
            >
              {isCommentLiked ? (
                <FaHeart className="mr-1 text-red-500" />
              ) : (
                <FaRegHeart className="mr-1" />
              )}
              <span>{comment.likes.length}</span>
            </button>

            <button 
              className="flex items-center hover:text-blue-500"
              onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
            >
              <MessageOutlined className="mr-1" />
              <span>Reply</span>
            </button>
          </div>

          {replyingTo === comment._id && (
            <div className="mt-3 flex gap-2">
              <Input.TextArea
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                autoSize={{ minRows: 1, maxRows: 4 }}
              />
              <Button 
                type="primary" 
                onClick={() => handleReplySubmit(comment._id)}
                disabled={!replyText.trim()}
              >
                Post
              </Button>
            </div>
          )}

          {comment.comments?.length > 0 && (
            <div className="mt-3">
              {comment.comments.map(childComment => 
                renderComment(childComment, depth + 1)
              )}
            </div>
          )}
        </Card>
      </div>
    );
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <Card loading={true} style={{ width: 300 }} />
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <Card className="text-center">
          <Empty
            description={
              <span className="text-red-500">
                {postError?.message || 'Post not found. It may have been deleted.'}
              </span>
            }
          />
          <Button type="primary" onClick={() => router.push('/')} className="mt-4">
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#F2F4F7] p-4">
      <main className="max-w-3xl mx-auto">
        {/* Post card */}
        <div className="mb-6">
          <div className={`rounded-lg bg-white shadow ${isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-5'}`}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                {post.author?.profile ? (
                  <Image
                    src={post.author.profile}
                    alt="Author avatar"
                    width={isMobile ? 24 : 32}
                    height={isMobile ? 24 : 32}
                    className="rounded-full cursor-pointer"
                  />
                ) : (
                  <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gray-300 flex items-center justify-center text-xs`}>
                    {post.author?.userName?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
                <div className="flex flex-col justify-start items-start">
                  <span className={`font-medium cursor-pointer ${isMobile ? 'text-xs' : 'text-base'} text-gray-900`}>
                    {post.author?.userName || "Anonymous"}
                  </span>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>

              <Dropdown
                menu={{ items: postMenuItems, onClick: handlePostMenuClick }}
                placement="bottomRight"
                trigger={['click']}
              >
                <button className="font-bold p-1 rounded hover:bg-gray-100 cursor-pointer">
                  <EllipsisOutlined className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                </button>
              </Dropdown>
            </div>

            {post.title && (
              <h2 className={`${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'} font-bold mb-3`}>
                {post.title}
              </h2>
            )}

            <div 
              className={`mb-3 text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />

            {post?.image && (
              <div className="mb-4">
                <Image
                  src={`${baseURL}${post?.image}`}
                  alt={post.title}
                  width={800}
                  height={350}
                  className="w-full h-[350px] rounded-lg object-cover"
                />
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 sm:gap-6">
                <button onClick={handleLike} className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
                  {isLiked ?
                    <FaHeart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-red-500`} /> :
                    <FaRegHeart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500`} />
                  }
                  <span className={`ml-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>{post.likes?.length || 0}</span>
                </button>

                <button 
                  onClick={() => {
                    handleCommentButtonClick();
                    if (login_user_id) {
                      // Scroll to comment box
                      commentInputRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
                >
                  <MessageOutlined className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span className={`ml-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>{comments.length}</span>
                </button>

                {post.category && (
                  <span className="bg-[#E6E6FF] text-xs py-1 px-2 rounded">
                    {post.category?.name || "General"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                  <FaEye className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  <span>{post.views || 0}</span>
                </div>

                <button onClick={handleShare} className="text-gray-500 px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded-sm">
                  <Image src="/icons/share.png" width={20} height={20} alt="share button" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comment form */}
        <form onSubmit={handleCommentSubmit} className="mb-4">
          <div className="flex gap-3 items-center">
            {currentUser.avatar ? (
              <Avatar src={currentUser.avatar} size={32} />
            ) : (
              <Avatar size={32}>{currentUser.name?.charAt(0).toUpperCase() || 'U'}</Avatar>
            )}
            <Input
              ref={commentInputRef}
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="rounded-full bg-gray-100 border-gray-200"
              disabled={!login_user_id}
            />
          </div>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="mt-2 ml-12"
            disabled={!commentText.trim() || !login_user_id}
          >
            Post Comment
          </Button>
          {!login_user_id && (
            <span className="text-sm text-gray-500 ml-2">
              Please login to comment
            </span>
          )}
        </form>

        {/* Comments section */}
        <div id="comments" className='flex flex-col gap-3'>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-800">Comments ({comments.length})</h3>
            <Select
              value={commentSort}
              onChange={setCommentSort}
              className="text-gray-600"
              options={[
                { value: 'relevant', label: 'Most relevant' },
                { value: 'recent', label: 'Most recent' },
              ]}
            />
          </div>

          {comments.length === 0 ? (
            <Card className="text-center p-8">
              <Empty
                description={
                  <span className="text-gray-500">
                    No comments yet. Be the first to comment!
                  </span>
                }
              />
            </Card>
          ) : (
            sortComments(comments).map(comment => renderComment(comment))
          )}
        </div>
      </main>

      <ReportPostModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={postId}
      />
    </div>
  );
};

export default PostDetailsPage;