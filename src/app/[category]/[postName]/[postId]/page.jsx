"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, Card, Button, Input, Select, Dropdown, Menu } from 'antd';
import { LikeOutlined, LikeFilled, MessageOutlined, ShareAltOutlined, EllipsisOutlined } from '@ant-design/icons';
import Image from 'next/image';

export default function PostDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { category, postName, postId } = params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [commentSort, setCommentSort] = useState('relevant');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const commentInputRef = useRef(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  const currentUser = { 
    id: "user1",
    name: "Current User", 
    username: "@currentuser", 
    avatar: "/images/profile2.jpg" 
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch post data based on postId
  useEffect(() => {
    const fetchPost = async () => {
      // Simulate API call with mock data including comments
      const mockPost = {
        id: postId,
        author: { id: "user2", name: "John Doe", username: "@johndoe", avatar: "/images/profile.jpg" },
        timePosted: "2 hours ago",
        title: decodeURIComponent(postName.replace(/-/g, ' ')),
        content: "Curabitur euismod magna a volutpat rhoncus. Nam vel risus euismod, vestibulum dui at, aliquam purus. Donec vel turpis in odio tincidunt volutpat ac ac lacus. Integer in mollis justo. Nullam vitae sapien feugiat, congue ipsum at, vehicula sapien.",
        image: "/images/post.png",
        tags: ["Technology", "Programming"],
        stats: { likes: 24, comments: 3, reads: 150 },
        isLiked: false,
        category: category
      };
      
      // Mock comments data with nested structure
      const mockComments = [
        {
          id: "c1",
          author: { id: "user3", name: "Alice Smith", username: "@alice", avatar: "/images/profile3.jpg" },
          content: "Great post! I learned a lot from this.",
          time: '1 hour ago',
          likes: 5,
          likedByUser: false,
          comments: [
            {
              id: "c1-1",
              author: currentUser,
              content: "Thanks Alice! Glad you found it helpful.",
              time: '30 minutes ago',
              likes: 2,
              likedByUser: true,
              comments: []
            }
          ]
        },
        {
          id: "c2",
          author: { id: "user4", name: "Bob Johnson", username: "@bob", avatar: "/images/profile2.jpg" },
          content: "Interesting perspective. Have you considered the implications for X?",
          time: '45 minutes ago',
          likes: 3,
          likedByUser: false,
          comments: []
        }
      ];
      
      setPost(mockPost);
      setComments(mockComments);
    };

    fetchPost();
  }, [postId, postName, category]);

  // Scroll to comments if hash is present and focus comment input
  useEffect(() => {
    if (window.location.hash === '#comments') {
      const commentsSection = document.getElementById('comments');
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Add slight delay to ensure the element is available
        setTimeout(() => {
          if (commentInputRef.current) {
            commentInputRef.current.focus();
          }
        }, 300);
      }
    }
  }, []);

  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  const handleOptionSelect = (option) => {
    setShowDropdown(false);
    console.log(`Selected option: ${option}`);
  };

  const handleLike = () => {
    setPost(prev => ({
      ...prev,
      isLiked: !prev.isLiked,
      stats: { 
        ...prev.stats, 
        likes: prev.isLiked ? prev.stats.likes - 1 : prev.stats.likes + 1 
      }
    }));
  };

  const handleCommentLike = (commentId) => {
    const updateCommentLikes = (comments) => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.likedByUser ? comment.likes - 1 : comment.likes + 1,
            likedByUser: !comment.likedByUser
          };
        }
        
        if (comment.comments && comment.comments.length > 0) {
          return {
            ...comment,
            comments: updateCommentLikes(comment.comments)
          };
        }
        
        return comment;
      });
    };
    
    setComments(updateCommentLikes(comments));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    const newComment = {
      id: `c${Date.now()}`,
      author: currentUser,
      content: commentText,
      time: 'Just now',
      likes: 0,
      likedByUser: false,
      comments: []
    };
    
    setComments([newComment, ...comments]);
    setPost(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        comments: prev.stats.comments + 1
      }
    }));
    setCommentText('');
  };

  const handleReplySubmit = (parentCommentId) => {
    if (!replyText.trim()) return;
    
    const addReplyToComment = (comments) => {
      return comments.map(comment => {
        if (comment.id === parentCommentId) {
          const newReply = {
            id: `c${Date.now()}`,
            author: currentUser,
            content: replyText,
            time: 'Just now',
            likes: 0,
            likedByUser: false,
            comments: []
          };
          
          return {
            ...comment,
            comments: [...comment.comments, newReply]
          };
        }
        
        if (comment.comments && comment.comments.length > 0) {
          return {
            ...comment,
            comments: addReplyToComment(comment.comments)
          };
        }
        
        return comment;
      });
    };
    
    setComments(addReplyToComment(comments));
    setPost(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        comments: prev.stats.comments + 1
      }
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
    
    const updateCommentText = (comments) => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            content: editCommentText
          };
        }
        
        if (comment.comments && comment.comments.length > 0) {
          return {
            ...comment,
            comments: updateCommentText(comment.comments)
          };
        }
        
        return comment;
      });
    };
    
    setComments(updateCommentText(comments));
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleDeleteComment = (commentId) => {
    const deleteComment = (comments) => {
      const filteredComments = comments.filter(comment => comment.id !== commentId);
      
      return filteredComments.map(comment => {
        if (comment.comments && comment.comments.length > 0) {
          return {
            ...comment,
            comments: deleteComment(comment.comments)
          };
        }
        return comment;
      });
    };
    
    setComments(deleteComment(comments));
    setPost(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        comments: prev.stats.comments - 1
      }
    }));
  };

  const sortComments = (comments) => {
    if (commentSort === 'recent') {
      return [...comments].sort((a, b) => new Date(b.time) - new Date(a.time));
    }
    // Default is 'relevant' which sorts by likes
    return [...comments].sort((a, b) => b.likes - a.likes);
  };

  const renderCommentMenu = (comment) => {
    const isCurrentUserComment = comment.author.id === currentUser.id;
    
    return (
      <Menu>
        {isCurrentUserComment && (
          <>
            <Menu.Item key="edit" onClick={() => handleEditComment(comment.id, comment.content)}>
              Edit Comment
            </Menu.Item>
            <Menu.Item key="delete" onClick={() => handleDeleteComment(comment.id)}>
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
    const isEditing = editingCommentId === comment.id;
    
    return (
      <div 
        key={comment.id} 
        className={`mb-4 ${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}
      >
        <Card className="rounded-2xl">
          <div className="flex items-center mb-3">
            <Avatar src={comment.author.avatar} size={32} />
            <div className="ml-2">
              <div className="font-medium">{comment.author.username}</div>
              <div className="text-xs text-gray-500">{comment.time}</div>
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
                  onClick={() => handleUpdateComment(comment.id)}
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
              onClick={() => handleCommentLike(comment.id)}
            >
              {comment.likedByUser ? (
                <LikeFilled className="mr-1 text-blue-500" />
              ) : (
                <LikeOutlined className="mr-1" />
              )}
              <span>{comment.likes}</span>
            </button>

            <button 
              className="flex items-center hover:text-blue-500"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              <MessageOutlined className="mr-1" />
              <span>Reply</span>
            </button>
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <Input.TextArea
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                autoSize={{ minRows: 1, maxRows: 4 }}
              />
              <Button 
                type="primary" 
                onClick={() => handleReplySubmit(comment.id)}
                disabled={!replyText.trim()}
              >
                Post
              </Button>
            </div>
          )}

          {comment.comments && comment.comments.length > 0 && (
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

  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  const isDesktop = windowSize.width >= 1024;

  const renderAuthorAvatar = (author) => (
    author.avatar ? (
      <img 
        src={author.avatar} 
        alt="Author avatar" 
        className={`${isMobile ? 'w-6 h-6' : isTablet ? 'w-8 h-8' : 'w-10 h-10'} rounded-full cursor-pointer`}
      />
    ) : (
      <div className={`${isMobile ? 'w-6 h-6' : isTablet ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-gray-300 flex items-center justify-center text-xs`}>
        {author.name.charAt(0).toUpperCase()}
      </div>
    )
  );

  const renderDropdown = () => (
    <div className={`absolute right-0 mt-1 ${isMobile ? 'w-32' : isTablet ? 'w-36' : 'w-40'} bg-white rounded-lg shadow-lg border border-gray-200 z-10`}>
      <div className="py-1">
        <button onClick={() => handleOptionSelect('report')} className="w-full text-left cursor-pointer px-3 py-2 flex items-center gap-2 hover:bg-gray-100 text-sm">
          <Image src="/icons/report.png" height={16} width={16} alt="report" />
          <span className="-mt-1">Report Post</span>
        </button>
      </div>
    </div>
  );

  const renderTags = () => (
    post?.tags?.length > 0 && (
      <div className="flex flex-wrap items-center gap-2">
        {post.tags.map((tag, index) => (
          <span key={index} className="bg-[#E6E6FF] text-xs py-1 px-2 rounded">
            {tag}
          </span>
        ))}
      </div>
    )
  );

  if (!post) return <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <main className="max-w-2xl mx-auto">
        {/* Post card */}
        <div className="mb-6">
          <div className={`rounded-lg bg-white shadow ${isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-5'}`}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                {renderAuthorAvatar(post.author)}
                <div className="flex flex-col justify-center sm:items-center sm:gap-1">
                  <span className={`font-medium cursor-pointer ${isMobile ? 'text-xs' : 'text-sm'} text-gray-900`}>
                    {post.author.username || post.author.name}
                  </span>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 pl-2`}>{post.timePosted}</span>
                </div>
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  className="font-bold p-1 rounded hover:bg-gray-100 cursor-pointer" 
                  onClick={toggleDropdown}
                >
                  <EllipsisOutlined className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                </button>
                {showDropdown && renderDropdown()}
              </div>
            </div>
            
            {post.title && (
              <h2 className={`${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'} font-bold mb-3`}>
                {post.title}
              </h2>
            )}
            
            <div className={`mb-3 text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}>
              {post.content}
            </div>
            
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
              <div className="flex items-center gap-4 sm:gap-6">
               
              <button onClick={handleLike} className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
                  {post.isLiked ? 
                    <LikeFilled className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-[#4096FF]`} /> : 
                    <LikeOutlined className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500`} />
                  }
                  <span className={`ml-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>
                    {post.stats.likes || 0}
                  </span>
                </button>

                <button 
                  className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
                  onClick={() => {
                    document.getElementById('comments').scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <MessageOutlined className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500`} />
                  <span className={`ml-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>
                    {post.stats.comments || 0}
                  </span>
                </button>

                {renderTags()}
              </div>

              <div className="flex items-center gap-3">
                {post.stats.reads > 0 && (
                  <div className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                    <Image src="/icons/read.png" width={20} height={20} alt="read all user" />
                    <span className="pt-1">{post.stats.reads}</span>
                  </div>
                )}
                
                <button className="text-gray-500 px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded-sm">
                  <ShareAltOutlined className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
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
              style={{ paddingBottom: "30px" }}
              className="ml-2 rounded-full bg-gray-100 border-gray-200"
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
              onChange={(value) => setCommentSort(value)}
              bordered={false}
              className="text-gray-600 font-medium"
              style={{ fontWeight: "bold" }}
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
