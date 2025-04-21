"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlineEllipsis } from 'react-icons/ai';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Image from 'next/image';
import { Dropdown, message } from 'antd';
import { baseURL } from '../../utils/BaseURL';
import { PostSEE } from '../../utils/svgImage';
import EditPostModal from './EditPostModal';

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
  category: "general"
};

const ProfilePostCard = ({ 
  postData = defaultPost ,
  onLike,
  onOptionSelect,
  currentUser = { name: "User", avatar: "" }
}) => {
  const router = useRouter();
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const dropdownRef = useRef(null);

  

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
  const post = { ...defaultPost, ...postData };


  const getPostNameSlug = (title) => (
    title ? title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-') : 'post'
  );

  const handlePostDetails = () => {
    const postId = post.id || post._id || 'placeholder-id';
    router.push(`/posts/${postId}`);
  };

  const handleCommentClick = () => {
    const postId = post.id || post._id || 'placeholder-id';
    router.push(`/posts/${postId}#comments`);
  };

  const handleLike = () => onLike?.(post.id || post._id);

  const handleShare = () => {
    navigator.clipboard.writeText(`${baseURL}/posts/${post.id || post._id}`).then(() => {
      message.success("Link copied successfully");
    }).catch(() => {
      message.error("Failed to copy link");
    });
  };

  const handleOptionSelect = ({ key }) => {
    if (key === 'edit') {
      setEditModalVisible(true);
    } else {
      onOptionSelect?.(post.id || post._id, key);
    }
  };

  const renderAuthorAvatar = () => (
    post.author.avatar ? (
      <img
        src={`${baseURL}${post.author.avatar}`}
        alt="Author avatar"
        className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full cursor-pointer`}
      />
    ) : (
      <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gray-300 flex items-center justify-center text-xs`}>
        {post.author.username?.charAt(0).toUpperCase() || 'A'}
      </div>
    )
  );

  const renderContent = () => (
    <div className={`mb-3 text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}>
      {post.content.replace(/<[^>]+>/g, '').split(' ').length > 20 ? (
        <>
          {post.content?.replace(/<[^>]+>/g, '')?.split(' ')?.slice(0, 20)?.join(' ')}...
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

  const menuItems = [
    {
      key: 'delete',
      label: (
        <div className="flex items-center gap-2 py-1">
          <span>✕</span>
          <span>Delete Post</span>
        </div>
      ),
    },
    {
      key: 'edit',
      label: (
        <div className="flex items-center gap-2 py-1">
          <Image
            src={"/icons/save_post.png"}
            width={16}
            height={16}
            alt="Edit post"
          />
          <span className="-mt-1">Edit Post</span>
        </div>
      ),
    }
  ];

  return (
    <>
      <div className={`rounded-lg bg-white shadow mb-4 ${isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-5'}`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            {renderAuthorAvatar()}
            <div className="flex flex-col justify-start items-start sm:items-center sm:gap-1">
              <span className={`font-medium cursor-pointer ${isMobile ? 'text-xs' : 'text-base'} text-gray-900`}>
                {post.author.username || post.author.name}
              </span>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 pl-2`}>
                {post.timePosted}
              </span>
            </div>
          </div>

          <Dropdown
            menu={{ items: menuItems, onClick: handleOptionSelect }}
            placement="bottomRight"
            trigger={['click']}
          >
            <button className="font-bold p-1 rounded hover:bg-gray-100 cursor-pointer">
              <AiOutlineEllipsis className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            </button>
          </Dropdown>
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

      <EditPostModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        postData={post}
      />
    </>
  );
};

export default ProfilePostCard;