"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  AiOutlineHeart, 
  AiFillHeart, 
  AiOutlineMessage, 
  AiOutlineShareAlt, 
  AiOutlineEllipsis, 
  AiOutlineSend 
} from 'react-icons/ai';

const PostCard = ({ 
  postData,
  onLike,
  onCommentSubmit,
  onShare,
  onOptionSelect,
  currentUser
}) => {
  // State management
  const [expanded, setExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const dropdownRef = useRef(null);
  
  // Default post data structure
  const defaultPost = {
    author: {
      name: "Anonymous",
      avatar: "",
      username: "anonymous"
    },
    timePosted: "Just now",
    title: "",
    content: "",
    image: "",
    tags: [],
    stats: {
      likes: 0,
      comments: [],
      reads: 0
    },
    isLiked: false
  };

  // Merge provided post data with defaults
  const post = { ...defaultPost, ...postData };
  
  // Close dropdown when clicking outside
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
  }, [dropdownRef]);
  
  // Content truncation for "See more" feature
  const maxLength = 120;
  const truncatedContent = post.content.slice(0, maxLength);
  const needsTruncation = post.content.length > maxLength;
  
  // Event handlers
  const handleLike = () => {
    if (onLike) {
      onLike(post.id || post._id);
    }
  };
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  const toggleCommentBox = () => {
    setShowCommentBox(!showCommentBox);
  };
  
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim() && onCommentSubmit) {
      onCommentSubmit(post.id || post._id, commentText);
      setCommentText('');
    }
  };

  const handleOptionSelect = (option) => {
    if (onOptionSelect) {
      onOptionSelect(post.id || post._id, option);
    }
    setShowDropdown(false);
  };

  const handleShare = () => {
    if (onShare) {
      onShare(post.id || post._id);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm mb-4">
      <div className="p-4">
        {/* Author info and options */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {post.author.avatar ? (
              <img 
                src={post.author.avatar} 
                alt="Author avatar" 
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-medium text-sm text-gray-900">
              {post.author.username || post.author.name}
            </span>
            <span className="text-xs text-gray-500">{post.timePosted}</span>
          </div>
          
          {/* Options dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              className="text-gray-500 p-1 rounded hover:bg-gray-100"
              onClick={toggleDropdown}
            >
              <AiOutlineEllipsis className="w-5 h-5" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-2">
                  <button 
                    onClick={() => handleOptionSelect('hide')}
                    className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-gray-100"
                  >
                    <span className="text-gray-800">✕</span>
                    <span>Hide Post</span>
                  </button>
                  <button 
                    onClick={() => handleOptionSelect('save')}
                    className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-gray-100"
                  >
                    <span className="text-gray-800">⋏</span>
                    <span>Save Post</span>
                  </button>
                  <button 
                    onClick={() => handleOptionSelect('report')}
                    className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-gray-100"
                  >
                    <span className="text-gray-800">⚑</span>
                    <span>Report Post</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Post title */}
        {post.title && (
          <h2 className="text-xl font-bold mb-2">{post.title}</h2>
        )}
        
        {/* Post content with See more feature */}
        {post.content && (
          <div className="mb-3 text-gray-700">
            {expanded ? post.content : truncatedContent}
            {needsTruncation && !expanded && (
              <button 
                className="text-blue-600 hover:text-blue-800 font-medium ml-1"
                onClick={() => setExpanded(true)}
              >
                See more
              </button>
            )}
          </div>
        )}
        
        {/* Post image */}
        {post.image && (
          <div className="mb-4">
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        )}
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-blue-50 text-blue-700 text-xs py-1 px-2 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Interaction bar */}
        <div className="flex justify-between items-center">
          <div className="flex gap-6">
            {/* Like button */}
            <div className="flex items-center gap-1">
              <button 
                onClick={handleLike}
                className="flex items-center hover:bg-gray-100 p-1 rounded"
              >
                {post.isLiked ? 
                  <AiFillHeart className="w-5 h-5 text-red-500" /> : 
                  <AiOutlineHeart className="w-5 h-5 text-gray-500" />
                }
                <span className="ml-1 text-sm text-gray-700">
                  {post.stats.likes || 0}
                </span>
              </button>
            </div>
            
            {/* Comment button */}
            <div className="flex items-center gap-1">
              <button 
                onClick={toggleCommentBox}
                className="flex items-center hover:bg-gray-100 p-1 rounded"
              >
                <AiOutlineMessage className="w-5 h-5 text-gray-500" />
                <span className="ml-1 text-sm text-gray-700">
                  {post.stats.comments?.length || 0}
                </span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Read count */}
            {post.stats.reads > 0 && (
              <div className="flex items-center text-sm text-gray-500">
                <span>{post.stats.reads} reads</span>
              </div>
            )}
            
            {/* Share button */}
            <button 
              onClick={handleShare}
              className="text-gray-500 hover:bg-gray-100 p-1 rounded"
            >
              <AiOutlineShareAlt className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comment section */}
        {showCommentBox && (
          <div className="mt-4">
            {/* Existing comments */}
            {post.stats.comments?.length > 0 && (
              <div className="mb-4 space-y-3">
                {post.stats.comments.map(comment => (
                  <div key={comment.id || comment._id} className="flex items-start gap-2">
                    {comment.author?.avatar ? (
                      <img 
                        src={comment.author.avatar} 
                        alt="Comment author avatar" 
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                        {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">
                            {comment.author?.username || comment.author?.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment input box */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt="Your avatar" 
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                  {currentUser?.name?.charAt(0).toUpperCase() || 'Y'}
                </div>
              )}
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AiOutlineSend className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

PostCard.defaultProps = {
  postData: {},
  currentUser: {
    name: "User",
    avatar: ""
  }
};

export default PostCard;