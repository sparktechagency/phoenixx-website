"use client";
import React from 'react';
import { Grid } from 'antd';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCreateChatMutation } from '@/features/chat/massage';
import AuthorPostCard from '@/components/AuthorPostCard';
import { useGetByUserIdQuery, useLikePostMutation } from '@/features/post/postApi';


const ProfileBanner = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const router = useRouter();
  const { id } = useParams();
  const [createChat, { isLoading }] = useCreateChatMutation();
  const [likePost, { isLoading: likeLoading }] = useLikePostMutation();
  const { data, isLoading: getbuyUserLoading, refetch } = useGetByUserIdQuery(id);


  const handleLike = async (postId) => {
    try {
      await likePost(postId).unwrap();
      refetch()
    } catch (error) {
      message.error('Failed to like post');
      console.error('Like error:', error);
    }
  };



  const handleChat = async (id) => {
    try {
      const response = await createChat({ participant: id }).unwrap();
      console.log(response)
      if (response.success) {
        router.push(`/chat/${id}`)
      }
    } catch (error) {
      console.log(error)
    }
  }





  // Now 'data' is a JavaScript array containing objects

  return (
    <div className=' bg-[#F2F4F7]'>
      <div className="bg-[#EBEBFF] pt-20 flex items-center justify-center">
        <div className="bg-white rounded-lg w-full max-w-7xl shadow-md">
          <div className="flex justify-between items-center px-4 sm:px-6 py-4 relative">
            <div className="absolute left-1/2 -translate-x-1/2 -top-12">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-300">
                  <img
                    src={"/icons/user.png"}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1"></div>
            <button
              onClick={() => handleChat(id)}
              className={`
              ${isMobile ? 'px-3 py-1.5 rounded-md' : 'px-4 py-2 rounded-md'} 
              bg-primary hover:bg-blue-700 transition-colors cursor-pointer
              text-white flex items-center justify-center gap-2
              shadow-sm
            `}
              aria-label="Edit profile"
            >
              <Image src={"/images/Vector.svg"} height={16} width={16} alt='' />
              <span className="text-sm font-medium">Send Message</span>
            </button>
          </div>

          <div className="text-center pb-10">
            <h2 className="text-xl sm:text-2xl font-bold">{"Pranab kumar"}</h2>
            <p className="text-gray-500 text-sm sm:text-base">{"@pronab12"}</p>
          </div>
        </div>
      </div>

      <div className='max-w-4xl mx-auto py-5'>

        {
          data?.data?.map(post => <AuthorPostCard postData={post} onLike={handleLike} />)
        }

      </div>
    </div>
  );
};

export default ProfileBanner;