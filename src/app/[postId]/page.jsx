"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Avatar, Card, Button, Input, Select, Dropdown, Menu } from 'antd';
import { LikeOutlined, LikeFilled, MessageOutlined, ShareAltOutlined, EllipsisOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { usePostDetailsQuery } from '@/features/post/postApi';
import { formatDistanceToNow } from 'date-fns';

export default function PostDetailsPage() {
  const params = useParams();
  const { postId } = params;
  const { data: apiResponse, isLoading } = usePostDetailsQuery(postId);
  const post = apiResponse?.data;

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [commentSort, setCommentSort] = useState('relevant');
  const commentInputRef = useRef(null);

  // Mock current user - replace with your actual auth user
  const currentUser = { 
    _id: "user1",
    userName: "Current User", 
    email: "current@user.com",
    avatar: "/images/profile2.jpg" 
  };

  // Format date to relative time (e.g., "2 hours ago")
  const formatDate = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Comment actions
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
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
  };

  const handleCommentLike = (commentId) => {
    setComments(prev => prev.map(comment => {
      if (comment._id === commentId) {
        const isLiked = comment.likes.includes(currentUser._id);
        return {
          ...comment,
          likes: isLiked 
            ? comment.likes.filter(id => id !== currentUser._id)
            : [...comment.likes, currentUser._id]
        };
      }
      
      if (comment.comments?.length) {
        return {
          ...comment,
          comments: comment.comments.map(child => 
            child._id === commentId 
              ? {
                  ...child,
                  likes: child.likes.includes(currentUser._id)
                    ? child.likes.filter(id => id !== currentUser._id)
                    : [...child.likes, currentUser._id]
                }
              : child
          )
        };
      }
      
      return comment;
    }));
  };

  const handleReplySubmit = (parentCommentId) => {
    if (!replyText.trim()) return;
    
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
  };

  const sortComments = (comments) => {
    const sorted = [...comments];
    if (commentSort === 'recent') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Sort by likes count (most liked first)
      sorted.sort((a, b) => b.likes.length - a.likes.length);
    }
    return sorted;
  };

  const renderCommentMenu = (comment) => {
    const isCurrentUserComment = comment.author._id === currentUser._id;
    
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
    const isLiked = comment.likes.includes(currentUser._id);
    
    return (
      <div 
        key={comment._id} 
        className={`mb-4 ${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}
      >
        <Card className="rounded-2xl">
          <div className="flex items-center mb-3">
            <Avatar src={comment.author.avatar} size={32} />
            <div className="ml-2">
              <div className="font-medium">{comment.author.userName}</div>
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
              {isLiked ? (
                <LikeFilled className="mr-1 text-blue-500" />
              ) : (
                <LikeOutlined className="mr-1" />
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

  if (isLoading) return <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">Loading...</div>;
  if (!post) return <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">Post not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <main className="max-w-2xl mx-auto">
        {/* Post card */}
        <div className="mb-6">
          <div className="rounded-lg bg-white shadow p-4 md:p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Avatar src={post.author?.avatar} size={40} />
                <div>
                  <div className="font-medium">{post.author?.userName}</div>
                  <div className="text-sm text-gray-500">
                    {formatDate(post.createdAt)}
                  </div>
                </div>
              </div>
              
              <Dropdown 
                menu={{
                  items: [
                    { key: 'report', label: 'Report Post' }
                  ]
                }}
                trigger={['click']}
              >
                <Button type="text" icon={<EllipsisOutlined />} />
              </Dropdown>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              {post.title}
            </h2>
            
            <div 
              className="mb-3 text-gray-700 prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
            
            {post.image && (
              <div className="mb-4">
                <img 
                  src={post.image} 
                  alt="Post content" 
                  className="w-full h-auto rounded-lg object-cover"
                />
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
                  {post.likes.includes(currentUser._id) ? 
                    <LikeFilled className="w-5 h-5 text-[#4096FF]" /> : 
                    <LikeOutlined className="w-5 h-5 text-gray-500" />
                  }
                  <span className="ml-1 text-sm text-gray-700">
                    {post.likes.length}
                  </span>
                </button>

                <button 
                  className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
                  onClick={() => {
                    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <MessageOutlined className="w-5 h-5 text-gray-500" />
                  <span className="ml-1 text-sm text-gray-700">
                    {comments.length}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {post.views > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Image src="/icons/read.png" width={20} height={20} alt="views" />
                    <span>{post.views}</span>
                  </div>
                )}
                
                <button className="text-gray-500 px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded-sm">
                  <ShareAltOutlined className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comment form */}
        <form onSubmit={handleCommentSubmit} className="mb-4">
          <div className="flex gap-3 items-center">
            <Avatar src={currentUser.avatar} size={32} />
            <Input
              ref={commentInputRef}
              placeholder="Add Comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="rounded-full bg-gray-100 border-gray-200"
            />
          </div>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="mt-2 ml-12"
            disabled={!commentText.trim()}
          >
            Post Comment
          </Button>
        </form>

        {/* Comments section */}
        <div id="comments" className='flex flex-col gap-3'>
          <div className="flex items-center justify-start -ml-3">
            <Select
              value={commentSort}
              onChange={setCommentSort}
              bordered={false}
              className="text-gray-600 font-medium"
              options={[
                { value: 'relevant', label: 'Most relevant' },
                { value: 'recent', label: 'Most recent' },
              ]}
            />
          </div>

          {sortComments(comments).map(comment => renderComment(comment))}
        </div>
      </main>
    </div>
  );
}