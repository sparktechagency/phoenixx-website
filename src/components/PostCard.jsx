"use client";
import React, { useState, useCallback, useMemo, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlineEllipsis } from 'react-icons/ai';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Image from 'next/image';
import { Dropdown, message } from 'antd';
import { baseURL } from '../../utils/BaseURL';
import { PostSEE } from '../../utils/svgImage';
import { useGetSaveAllPostQuery, useSavepostMutation } from '@/features/SavePost/savepostApi';
import ReportPostModal from './ReportPostModal';
import { ThemeContext } from '@/app/layout';
import toast from 'react-hot-toast';

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, []);

  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return windowSize;
};

const PostCard = ({
  postData,
  onLike,
  onCommentSubmit,
  currentUser = {}
}) => {
  const router = useRouter();
  const [commentText, setCommentText] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const windowSize = useWindowSize();
  const { isDarkMode } = useContext(ThemeContext);

  const [isSaving, setIsSaving] = useState(false);
  const [savepost] = useSavepostMutation();
  const { data: savedPosts } = useGetSaveAllPostQuery();
  
  const isSaved = useMemo(() => 
    savedPosts?.data?.some(savedPost => savedPost?.postId?._id === postData?.id),
    [savedPosts, postData]
  );

  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;

  const handlePostDetails = useCallback(() => {
    router.push(`/posts/${postData.id}`);
  }, [postData.id, router]);

  const handleCommentClick = useCallback(() => {
    router.push(`/posts/${postData.id}#comments`);
  }, [postData.id, router]);

  const handleLike = useCallback(() => {
    onLike?.(postData.id);
  }, [onLike, postData.id]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(`${baseURL}/posts/${postData.id}`)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"));
  }, [postData.id]);

  const handleSaveUnsave = useCallback(async () => {
    setIsSaving(true);
    try {
      await savepost({ postId: postData.id }).unwrap();
      message.success(isSaved ? 'Post removed from saved items' : 'Post saved successfully');
    } catch (error) {
      console.error('Save/Unsave error:', error);
      message.error('Failed to update saved status');
    } finally {
      setIsSaving(false);
    }
  }, [postData.id, isSaved, savepost]);

  const menuItems = useMemo(() => [
    {
      key: 'save',
      label: (
        <div className="flex items-center gap-2 py-1">
          <Image
            src={"/icons/save_post.png"}
            width={16}
            height={16}
            alt={isSaved ? "Unsave post" : "Save post"}
          />
          <span className="-mt-1">
            {isSaving ? 'Processing...' : isSaved ? 'Unsave Post' : 'Save Post'}
          </span>
        </div>
      ),
    },
    {
      key: 'report',
      label: (
        <div className="flex items-center gap-2 py-1">
          <Image src="/icons/report.png" height={16} width={16} alt="report" />
          <span className="-mt-1">Report Post</span>
        </div>
      ),
    },
  ], [isSaved, isSaving]);

  const handleMenuClick = useCallback(({ key }) => {
    if (key === 'save') {
      handleSaveUnsave();
    } else if (key === 'report') {
      setShowReportModal(true);
    }
  }, [handleSaveUnsave]);

  const renderAuthorAvatar = useMemo(() => (
    postData.author.avatar ? (
      <img
        src={`${baseURL}${postData.author.avatar}`}
        alt="Author avatar"
        className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full cursor-pointer`}
      />
    ) : (
      <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gray-300 flex items-center justify-center text-xs`}>
        {postData.author.username?.charAt(0).toUpperCase() || 'A'}
      </div>
    )
  ), [postData.author, isMobile]);

  const renderContent = useMemo(() => (
    <div className={`mb-3 ${isMobile ? 'text-sm' : 'text-base'}`}>
      {postData.content?.replace(/<[^>]+>/g, '')?.split(' ')?.length > 20 ? (
        <>
          {postData.content.replace(/<[^>]+>/g, '').split(' ').slice(0, 20).join(' ')}...
          <button
            className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium ml-1"
            onClick={handleCommentClick}
          >
            See more
          </button>
        </>
      ) : (
        postData.content.replace(/<[^>]+>/g, '')
      )}
    </div>
  ), [postData.content, isMobile, handleCommentClick]);

  const renderTags = useMemo(() => (
    postData.tags?.length > 0 && (
      <div className="flex flex-wrap items-center gap-2">
        {postData.tags.map((tag, index) => (
          <span key={index} className="bg-[#E6E6FF] text-xs py-1 px-2 rounded">
            {tag}
          </span>
        ))}
      </div>
    )
  ), [postData.tags]);

  

  return (
    <>
      <div className={`rounded-lg ${isDarkMode ? 'dark-mode' : 'light-mode'} shadow mb-4 ${isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-5'}`}>
        <div className="flex justify-between items-center mb-3">
          <div onClick={()=> router.push(`profiles/${postData?.author?.id}`)} className="flex items-center gap-2">
            {renderAuthorAvatar}
            <div className="flex flex-col justify-start items-start">
              <span className={`font-medium cursor-pointer ${isMobile ? 'text-xs' : 'text-base'}`}>
                {postData.author.username || postData.author.name}
              </span>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                {postData.timePosted}
              </span>
            </div>
          </div>

          <Dropdown
            menu={{ items: menuItems, onClick: handleMenuClick }}
            placement="bottomRight"
            trigger={['click']}
          >
            <button className="font-bold p-1 rounded hover:bg-gray-100 cursor-pointer">
              <AiOutlineEllipsis className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            </button>
          </Dropdown>
        </div>

        {postData.title && (
          <h2 
            onClick={handlePostDetails} 
            className={`${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'} cursor-pointer hover:text-blue-700 font-bold mb-3`}
          >
            {postData.title}
          </h2>
        )}

        {renderContent}

        {postData.image && (
          <div className="mb-4">
            <img
              src={`${baseURL}${postData.image}`}
              alt="Post content"
              className="w-full h-[350px] rounded-lg object-cover cursor-pointer"
              onClick={handlePostDetails}
            />
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={handleLike} 
              className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
            >
              {postData.isLiked ? (
                <FaHeart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-red-500`} />
              ) : (
                <FaRegHeart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500`} />
              )}
              <span className={`ml-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>
                {postData.stats.likes || 0}
              </span>
            </button>

            <button 
              onClick={handleCommentClick} 
              className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
            >
              <Image 
                src="/icons/message.png" 
                width={20} 
                height={20} 
                alt="message icon" 
              />
              <span className={`ml-1 -mt-[1px] ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>
                {postData.stats.comments || 0}
              </span>
            </button>

            {renderTags}
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
              <PostSEE />
              <span>{postData.stats.reads}</span>
            </div>

            <button 
              onClick={handleShare} 
              className="text-gray-500 px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded-sm"
            >
              <Image src="/icons/share.png" width={20} height={20} alt="share button" />
            </button>
          </div>
        </div>
      </div>

      <ReportPostModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={postData.id}
      />
    </>
  );
};

export default React.memo(PostCard);