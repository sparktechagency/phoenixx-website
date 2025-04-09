"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AiOutlineHeart, 
  AiFillHeart, 
  AiOutlineMessage, 
  AiOutlineEllipsis, 
  AiOutlineSend, 
  AiFillLike,
  AiOutlineLike
} from 'react-icons/ai';
import Image from 'next/image';
import { IoIosShareAlt } from 'react-icons/io';
import EditPostModal from './EditPostModal';

const ProfilePostCard = ({ 
  postData,
  onLike,
  onCommentSubmit,
  onShare,
  onOptionSelect,
  currentUser
}) => {
  // Next.js router for navigation
  const router = useRouter();
  
  // State management
  const [expanded, setExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  // New state for edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  
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
    isLiked: false,
    category: "general" // Default category
  };

  // Device detection
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

  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  const isDesktop = windowSize.width >= 1024;

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
  const maxLength = isMobile ? 100 : isTablet ? 150 : 200;
  const truncatedContent = post.content.slice(0, maxLength);
  const needsTruncation = post.content.length > maxLength;
  
  // Generate a URL-friendly post name from the title
  const getPostNameSlug = (title) => {
    return title 
      ? title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')
      : 'post';
  };
  
  // Event handlers
  const handleLike = () => {
    if (onLike) {
      onLike(post.id || post._id);
    }
  };
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  const handlePostDetails = () => {
    const postId = post.id || post._id || 'placeholder-id';
    const postName = getPostNameSlug(post.title);
    const category = post.category || 'general';
    
    // Redirect to the post's dedicated page with a hash that we'll handle in the PostPage
    router.push(`/${category}/${postName}/${postId}#top`);
  };

  const handleCommentClick = () => {
    const postId = post.id || post._id || 'placeholder-id';
    const postName = getPostNameSlug(post.title);
    const category = post.category || 'general';
    
    // Redirect to the post's dedicated page with a hash that we'll handle in the PostPage
    router.push(`/${category}/${postName}/${postId}#comments`);
  };
  
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim() && onCommentSubmit) {
      onCommentSubmit(post.id || post._id, commentText);
      setCommentText('');
    }
  };

  const handleOptionSelect = (option) => {
    if (option === 'edit') {
      // Show edit modal when edit option is selected
      setEditModalVisible(true);
    } else if (onOptionSelect) {
      onOptionSelect(post.id || post._id, option);
    }
    setShowDropdown(false);
  };

  const handleShare = () => {
    if (onShare) {
      onShare(post.id || post._id);
    }
  };

  // Handle edit modal close
  const handleEditModalClose = () => {
    setEditModalVisible(false);
  };

  return (
    <>
      <div className={`rounded-lg bg-white shadow mb-4 ${isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-5'}`}>
        {/* Author info and options */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            {post.author.avatar ? (
              <img 
                src={post.author.avatar} 
                alt="Author avatar" 
                className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full cursor-pointer`}
              />
            ) : (
              <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gray-300 flex items-center justify-center text-xs`}>
                {post.author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col justify-center sm:items-center sm:gap-1">
              <span className={`font-medium cursor-pointer ${isMobile ? 'text-xs' : 'text-sm'} text-gray-900`}>
                {post.author.username || post.author.name}
              </span>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 pl-2`}>{post.timePosted}</span>
            </div>
          </div>
          
          {/* Options dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              className="font-bold p-1 rounded hover:bg-gray-100 cursor-pointer"
              onClick={toggleDropdown}
            >
              <AiOutlineEllipsis className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            </button>
            
            {showDropdown && (
              <div className={`absolute right-0 mt-1 ${isMobile ? 'w-32' : 'w-40'} bg-white rounded-lg shadow-lg border border-gray-200 z-10`}>
                <div className="py-1">
                  <button 
                    onClick={() => handleOptionSelect('delete')}
                    className="w-full text-left px-3 py-2 flex cursor-pointer items-center gap-2 hover:bg-gray-100 text-sm"
                  >
                    <span>✕</span>
                    <span>Delete Post</span>
                  </button>
                  <button 
                    onClick={() => handleOptionSelect('edit')}
                    className="w-full text-left px-3 cursor-pointer py-2 flex items-center gap-2 hover:bg-gray-100 text-sm"
                  >
                    <Image src={"/icons/save_post.png"} width={16} height={16} alt='' />
                    <span className='-mt-1'>Edit Post</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Post title */}
        {post.title && (
          <h2 onClick={handlePostDetails} className={`${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'} cursor-pointer hover:text-blue-700 font-bold mb-3`}>{post.title}</h2>
        )}
        
        {/* Post content with See more feature */}
        {post.content && (
          <div className={`mb-3 text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}>
            {post.content.split(' ').length > 20 ? (
              <>
                {post.content.split(' ').slice(0, 20).join(' ')}...
                <button 
                  className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium ml-1"
                  onClick={handleCommentClick}
                >
                  See more
                </button>
              </>
            ) : (
              post.content
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
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Like button */}
            <div className="flex items-center gap-1">
              <button 
                onClick={handleLike}
                className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
              >
                {post.isLiked ? 
                  <AiFillLike className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-[#4096FF]`} /> : 
                  <AiOutlineLike className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500`} />
                }
                <span className={`ml-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>
                  {post.stats.likes || 0}
                </span>
              </button>
            </div>

            {/* Comment button */}
            <div className="flex items-center gap-1">
              <button 
                onClick={handleCommentClick}
                className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
              >
                <Image src={"/icons/message.png"} width={20} height={20} alt='message icons'/>
                <span className={`ml-1 -mt-[1px] ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>
                  {post.stats.comments?.length || 0}
                </span>
              </button>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-[#E6E6FF] text-xs py-1 px-2 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Read count */}
            {post.stats.reads > 0 && (
              <div className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                <Image src={"/icons/read.png"} width={20} height={20} alt='read all user' />
                <span className='pt-1'>{post.stats.reads}</span>
              </div>
            )}
            
            {/* Share button */}
            <button 
              onClick={handleShare}
              className="text-gray-500 px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded-sm"
            >
              <Image className='' src={"/icons/share.png"} width={20} height={20} alt='share button'/>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Post Modal */}
      <EditPostModal 
        visible={editModalVisible}
        onClose={handleEditModalClose}
        postData={post}
      />
    </>
  );
};

ProfilePostCard.defaultProps = {
  postData: {},
  currentUser: {
    name: "User",
    avatar: ""
  }
};

export default ProfilePostCard;