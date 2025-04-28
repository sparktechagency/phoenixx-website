"use client";
import { useMyPostQuery } from '@/features/post/postApi';
import { Dropdown } from 'antd';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { AiOutlineEllipsis } from 'react-icons/ai';
import { FaHeart, FaRegBookmark, FaRegHeart } from "react-icons/fa";
import { baseURL } from '../../utils/BaseURL';
import { PostSEE } from '../../utils/svgImage';
import EditPostModal from './EditPostModal';

const AuthorPostCard = ({
  postData,
  onLike,
  onOptionSelect,
  onUnsave,
  currentUser = { name: "User", avatar: "" }
}) => {
  const router = useRouter();
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const dropdownRef = useRef(null);
  const login_user_id = typeof window !== 'undefined' ? localStorage.getItem("login_user_id") : null;

  const { data } = useMyPostQuery();

  // Check if the current user has liked this post
  const isLikedByUser = postData?.likes?.some(userId => userId === login_user_id);

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

  // Check if we have all the necessary data
  if (!postData) {
    return null;
  }

  const handlePostDetails = () => {
    const postId = postData._id;
    router.push(`/posts/${postId}`);
  };

  const handleCommentClick = () => {
    const postId = postData._id;
    router.push(`/posts/${postId}#comments`);
  };

  const handleLike = () => onLike?.(postData._id);

  const handleShare = () => {
    navigator.clipboard.writeText(`${baseURL}/posts/${postId}`).then(() => {
      toast.success("Link copied successfully");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const handleOptionSelect = ({ key }) => {
    if (key === 'edit') {
      setEditModalVisible(true);
    } else if (key === 'unsave') {
      onUnsave?.(postData._id);
    } else {
      onOptionSelect?.(postData._id, key);
    }
  };

  const renderAuthorAvatar = () => {
    const author = postData?.author || {};
    return (
      author.profile ? (
        <img
          src={`${baseURL}${author.profile}`}
          alt="Author avatar"
          className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full cursor-pointer`}
        />
      ) : (
        <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gray-300 flex items-center justify-center text-xs`}>
          {author.userName?.charAt(0).toUpperCase() || author.name?.charAt(0).toUpperCase() || 'A'}
        </div>
      )
    );
  };

  const renderContent = () => {
    const content = postData.content || '';
    const plainContent = content.replace(/<[^>]+>/g, '');

    return (
      <div className={`mb-3 text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}>
        {plainContent.split(' ').length > 20 ? (
          <>
            {plainContent.split(' ').slice(0, 20).join(' ')}...
            <button
              className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium ml-1"
              onClick={handleCommentClick}
            >
              See more
            </button>
          </>
        ) : (
          plainContent
        )}
      </div>
    );
  };

  const renderTags = () => {
    const tags = postData.tags || [];
    return (
      tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="bg-[#E6E6FF] text-xs py-1 px-2 rounded">
              {tag}
            </span>
          ))}
        </div>
      )
    );
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Just now';
    }
  };

  // Determine whether to show owner options or saved post options
  const menuItems = postData.isSavedPost ? [
    {
      key: 'unsave',
      label: (
        <div className="flex items-center gap-2 py-1">
          <FaRegBookmark className="text-gray-600" />
          <span>Unsave Post</span>
        </div>
      ),
    }
  ] : [
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

  const author = postData.author || {};
  const commentsCount = postData.comments?.length || 0;
  const likesCount = postData.likes?.length || 0;
  const readsCount = postData.reads || 0;

  return (
    <>
      <div className={`rounded-lg bg-white shadow mb-4 ${isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-5'}`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            {renderAuthorAvatar()}
            <div className="flex flex-col items-start">
              <span className={`font-medium ${isMobile ? 'text-xs' : 'text-base'} text-gray-900`}>
                {author.userName || author.name || "User"}
              </span>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                {postData.isSavedPost
                  ? `Saved ${postData.savedAt}`
                  : (formatDate(postData.createdAt))}
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

        {postData.title && (
          <h2 onClick={handlePostDetails} className={`${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'} cursor-pointer hover:text-blue-700 font-bold mb-3`}>
            {postData.title}
          </h2>
        )}

        {renderContent()}

        {postData.image && (
          <div className="mb-4">
            <img
              src={`${baseURL}${postData.image}`}
              alt="Post content"
              className="w-full h-[350px] rounded-lg object-cover"
            />
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={handleLike} className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
              {isLikedByUser ?
                <FaHeart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-red-500`} /> :
                <FaRegHeart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500`} />
              }
              <span className={`ml-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>{likesCount}</span>
            </button>

            <button onClick={handleCommentClick} className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
              <Image src="/icons/message.png" width={20} height={20} alt="message icons" />
              <span className={`ml-1 -mt-[1px] ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>{commentsCount}</span>
            </button>

            {renderTags()}
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
              <PostSEE />
              <span className="">{postData?.views}</span>
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
        postData={postData}
      />
    </>
  );
};

export default AuthorPostCard;
