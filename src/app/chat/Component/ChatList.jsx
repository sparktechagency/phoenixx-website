"use client";

import { Avatar, Flex, Input } from 'antd';
import { useRouter } from 'next/navigation';
import { BsSearch } from 'react-icons/bs';
import { getImageUrl } from '../../../../utils/getImageUrl';
import { useGetAllChatQuery } from '@/features/chat/massage';

const ChatList = ({ setIsChatActive }) => {
    const router = useRouter();
    const { data: chatList, isLoading } = useGetAllChatQuery("");

    const handleSelectChat = (id) => {
        router.push(`/chat/${id}`);
        // Activate chat view on mobile when a chat is selected
        if (setIsChatActive) {
            setIsChatActive(true);
        }
    }

    if (isLoading) {
        return "loading..."
    }

    return (
        <div className="w-full h-[80vh] overflow-y-auto bg-white rounded-lg">
            <div className="p-4">
                <Flex gap={8}>
                    <Input
                        prefix={<BsSearch className="text-subtitle mx-1" size={20} />}
                        placeholder="Search"
                        allowClear
                        style={{ width: '100%', borderRadius: '90px', height: 42 }}
                    />
                </Flex>
            </div>

            <div className="chat-list-container">
                {chatList && chatList.map((chat) => (
                    <div
                        key={chat?._id}
                        onClick={() => handleSelectChat(chat?._id)}
                        className="flex items-center gap-4 p-4 cursor-pointer rounded-lg hover:bg-gray-100 border-b"
                    >
                        <Avatar size={50} src={getImageUrl(chat?.participants?.[0]?.profile)} />
                        <div className="flex-1">
                            <h3 className="font-medium ellipsis truncate max-w-[20ch]">
                                {chat?.participants?.[0]?.userName || "User"}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                                {/* Ensure lastMessage is a string */}
                                {typeof chat?.lastMessage === 'string'
                                    ? chat.lastMessage
                                    : "Chat Not Started Yet"}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                {/* Ensure createdAt is rendered as string */}
                                {typeof chat?.createdAt === 'string'
                                    ? chat.createdAt
                                    : chat?.createdAt instanceof Date
                                        ? chat.createdAt.toLocaleString()
                                        : ""}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatList;