"use client";

import LoadingUi from '@/components/LoadingUi';
import { useGetAllChatQuery, useMarkAsReadMutation } from '@/features/chat/massage';
import { Avatar, Flex, Input } from 'antd';
import moment from 'moment';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { BsSearch } from 'react-icons/bs';
import { getImageUrl } from '../../../../utils/getImageUrl';
import { useDebounce } from '../../../hooks/useDebounce';



const ChatList = ({ setIsChatActive, status }) => {
  const router = useRouter();
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce search for better performance

  // Use the debounced search term for API query
  const [markAsRead, { isLoading: markAsReadLoading }] = useMarkAsReadMutation()
  const { data: chatList, isLoading, isError, refetch } = useGetAllChatQuery(debouncedSearchTerm);


  const activeChat = chatList?.data?.find((chat) => chat?._id === id);

  const handleSelectChat = async (id) => {
    router.push(`/chat/${id}`);
    // Activate chat view on mobile when a chat is selected
    if (setIsChatActive) {
      setIsChatActive(true);
    }

    try {
      const response = await markAsRead(id).unwrap();
      console.log(response)
      refetch()

    } catch (error) {
      toast.error(error.message);
    }



  }

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const bangladeshTime = moment.utc(timestamp).utcOffset(6);
    return bangladeshTime.fromNow();
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return <LoadingUi />
  }

  return (
    <div className="w-full h-[80vh] shadow border border-gray-200 bg-white rounded-lg flex flex-col">
      <div className="p-4">
        <Flex gap={8}>
          <Input
            prefix={<BsSearch className="text-subtitle mx-1" size={20} />}
            placeholder="Search for..."
            allowClear
            style={{ width: '100%', height: 42 }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Flex>
      </div>

      <div className="chat-list-container flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 #FFFFFF',
        }}>
        <style jsx global>{`
          .chat-list-container::-webkit-scrollbar {
            width: 6px;
          }
          .chat-list-container::-webkit-scrollbar-track {
            background: #FFFFFF;
          }
          .chat-list-container::-webkit-scrollbar-thumb {
            background-color: #CBD5E0;
          }
        `}</style>
        {chatList?.data && chatList?.data?.length > 0 ? (
          chatList?.data?.map((chat) => (
            <div
              key={chat?._id}
              onClick={() => handleSelectChat(chat?._id)}
              className={`flex items-center gap-4 p-4 cursor-pointer rounded-lg
                        ${chat?._id === id ? 'bg-[#EBF4FF]' : 'hover:bg-[#EBF4FF]'}`}
            >
              <Avatar size={50} src={getImageUrl(chat?.participants?.[0]?.profile)} />
              <div className="flex-1">
                <h3 className="font-medium ellipsis truncate max-w-[20ch]">
                  {chat?.participants?.[0]?.userName || "User"}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {chat?.lastMessage?.text}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {formatTime(chat.createdAt)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">No chats found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
