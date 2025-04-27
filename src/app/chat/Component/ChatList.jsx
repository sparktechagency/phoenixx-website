"use client";

import LoadingUi from '@/components/LoadingUi';
import { useGetAllChatQuery } from '@/features/chat/massage';
import { Avatar, Flex, Input } from 'antd';
import moment from 'moment';
import { useParams, useRouter } from 'next/navigation';
import { BsSearch } from 'react-icons/bs';
import { getImageUrl } from '../../../../utils/getImageUrl';

const ChatList = ({ setIsChatActive, status }) => {
  const router = useRouter();
  const { id } = useParams();
  const { data: chatList, isLoading } = useGetAllChatQuery("");
  
  console.log(chatList)

  const activeChat = chatList?.find((chat) => chat?._id === id); 
  console.log(activeChat);

  const handleSelectChat = (id) => {
    router.push(`/chat/${id}`);
    // Activate chat view on mobile when a chat is selected
    if (setIsChatActive) {
      setIsChatActive(true);
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const bangladeshTime = moment.utc(timestamp).utcOffset(6);
    return bangladeshTime.fromNow();
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
        {chatList && chatList.map((chat) => (
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
        ))}
      </div>
    </div>
  );
};

export default ChatList;