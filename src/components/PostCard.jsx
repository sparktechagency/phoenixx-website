"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlineEllipsis, AiOutlineLike } from 'react-icons/ai';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Image from 'next/image';
import { baseURL } from '../../utils/BaseURL';
import { PostSEE } from '../../utils/svgImage';
import { useSavepostMutation } from '@/features/SavePost/savepostApi';

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
  isSaved: false,
  category: "general"
};

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

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

  return windowSize;
};

const PostCard = ({
  postData = defaultPost,
  onLike,
  onCommentSubmit,
  onShare,
  onOptionSelect,
  currentUser = { name: "User", avatar: "" }
}) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [commentText, setCommentText] = useState('');
  const dropdownRef = useRef(null);
  const windowSize = useWindowSize();
  const [isSaved, setIsSaved] = useState(postData?.isSaved || false);
  const [isSaving, setIsSaving] = useState(false);
  const [savepost] = useSavepostMutation();


  console.log(true)

  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  const post = { ...defaultPost, ...postData };

  const getPostNameSlug = useCallback((title) => (
    title ? title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-') : 'post'
  ), []);

  const handlePostDetails = useCallback(() => {
    const postId = post.id || post._id || 'placeholder-id';
    const postName = getPostNameSlug(post.title);
    const category = post.category || 'general';
    router.push(`${postId}`);
  }, [post, getPostNameSlug, router]);

  const handleCommentClick = useCallback(() => {
    const postId = post.id || post._id || 'placeholder-id';
    const postName = getPostNameSlug(post.title);
    const category = post.category || 'general';
    router.push(`/${category}/${postName}/${postId}#comments`);
  }, [post, getPostNameSlug, router]);

  const handleLike = useCallback(() => onLike?.(post.id || post._id), [onLike, post]);

  const toggleDropdown = useCallback(() => setShowDropdown(prev => !prev), []);

  const handleShare = useCallback(() => onShare?.(post.id || post._id), [onShare, post]);

  const handleCommentSubmit = useCallback((e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onCommentSubmit?.(post.id || post._id, commentText);
      setCommentText('');
    }
  }, [commentText, onCommentSubmit, post]);

  const handleSaveUnsave = async (id) => {
    setIsSaving(true);
    try {
      const response = await savepost({ postId: id }).unwrap();
      // console.log(response)
      response?.data === null ? setIsSaved(false) : setIsSaved(true)
    } catch (error) {
      console.error('Save/Unsave error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOptionSelect = async (option, id) => {
    if (option === 'save') {
      await handleSaveUnsave(id);
    } else {
      onOptionSelect?.(post.id || post._id, option);
    }
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderAuthorAvatar = () => (
    post.author.avatar ? (
      <img
        src={post.author.avatar}
        alt="Author avatar"
        className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full cursor-pointer`}
      />
    ) : (
      <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gray-300 flex items-center justify-center text-xs`}>
        {post.author.username?.charAt(0).toUpperCase() || 'A'}
      </div>
    )
  );

  const renderDropdown = () => (
    <div className={`absolute right-0 mt-1 ${isMobile ? 'w-32' : 'w-40'} bg-white rounded-lg shadow-lg border border-gray-200 z-10`}>
      <div className="py-1">
        <button onClick={() => handleOptionSelect('hide', post?.id)} className="w-full text-left px-3 py-2 flex cursor-pointer items-center gap-2 hover:bg-gray-100 text-sm">
          <span>✕</span>
          <span>Hide Post</span>
        </button>
        <button 
          onClick={() => handleOptionSelect('save', post?.id)} 
          disabled={isSaving}
          className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-100 text-sm ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Image 
            src={isSaved ? "/icons/saved_post.png" : "/icons/save_post.png"} 
            width={16} 
            height={16} 
            alt="" 
          />
          <span className="-mt-1">
            {isSaving ? 'Processing...' : (isSaved ? 'Unsave Post' : 'Save Post')}
          </span>
        </button>
        <button onClick={() => handleOptionSelect('report', post?.id)} className="w-full text-left cursor-pointer px-3 py-2 flex items-center gap-2 hover:bg-gray-100 text-sm">
          <Image src="/icons/report.png" height={16} width={16} alt="report" />
          <span className="-mt-1">Report Post</span>
        </button>
      </div>
    </div>
  );

  const renderContent = () => (
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
        post.content.replace(/<[^>]+>/g, '')
      )}
    </div>
  );

  const renderTags = () => (
    post.tags.length > 0 && (
      <div className="flex flex-wrap items-center gap-2">
        {post.tags.map((tag, index) => (
          <span key={index} className="bg-[#E6E6FF] text-xs py-1 px-2 rounded">
            {tag}
          </span>
        ))}
      </div>
    )
  );

  return (
    <div className={`rounded-lg bg-white shadow mb-4 ${isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-5'}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          {renderAuthorAvatar()}
          <div className="flex flex-col justify-center sm:items-center sm:gap-1">
            <span className={`font-medium cursor-pointer ${isMobile ? 'text-xs' : 'text-sm'} text-gray-900`}>
              {post.author.username || post.author.name}
            </span>
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 pl-2`}>{post.timePosted}</span>
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button className="font-bold p-1 rounded hover:bg-gray-100 cursor-pointer" onClick={toggleDropdown}>
            <AiOutlineEllipsis className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </button>
          {showDropdown && renderDropdown()}
        </div>
      </div>

      {post.title && (
        <h2 onClick={handlePostDetails} className={`${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'} cursor-pointer hover:text-blue-700 font-bold mb-3`}>
          {post.title}
        </h2>
      )}

      {renderContent()}

      {post.image && (
        <div className="mb-4">
          <img
            src={`${baseURL}${post.image}`}
            alt="Post content"
            className="w-full h-[350px] rounded-lg object-cover"
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 sm:gap-6">
          <button onClick={handleLike} className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
            {post.isLiked ?
              <FaHeart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-red-500`} /> :
              <FaRegHeart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500`} />
            }
            <span className={`ml-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>{post.stats.likes || 0}</span>
          </button>

          <button onClick={handleCommentClick} className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
            <Image src="/icons/message.png" width={20} height={20} alt="message icons" />
            <span className={`ml-1 -mt-[1px] ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>{post.stats.comments?.length || 0}</span>
          </button>

          {renderTags()}
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
            <PostSEE />
            <span className="">{post.stats.reads}</span>
          </div>

          <button onClick={handleShare} className="text-gray-500 px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded-sm">
            <Image src="/icons/share.png" width={20} height={20} alt="share button" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;