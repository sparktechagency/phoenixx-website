"use client";

import {
  deleteChatLocally,
  markChatAsRead,
  toggleBlockChat,
  toggleMuteChat
} from '@/redux/features/chatSlice';
import { Avatar, Dropdown, Flex, Input, message, Spin } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import moment from 'moment';
import { useParams, useRouter } from 'next/navigation';
import { useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BsBell,
  BsBellSlash,
  BsBlockquoteRight,
  BsSearch,
  BsThreeDotsVertical,
  BsTrash
} from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { getImageUrl } from '../../../../utils/getImageUrl';
import { useChatBlockAndUnblockMutation, useDeleteChatMutation, useGetAllChatQuery, useMarkAsReadMutation, useMuteChatMutation } from '../../../features/chat/chatList/chatApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { ThemeContext } from '../../ClientLayout';

const ChatList = ({ setIsChatActive, status }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const router = useRouter();
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const dispatch = useDispatch();
  const [loadingStates, setLoadingStates] = useState({});

  const [markAsRead] = useMarkAsReadMutation();
  const [deleteChat] = useDeleteChatMutation();
  const [muteChat] = useMuteChatMutation();
  const [blockChat] = useChatBlockAndUnblockMutation();

  const { data: chatListData, isLoading, isError, refetch } = useGetAllChatQuery(debouncedSearchTerm);
  const { chats, unreadCount } = useSelector((state) => state.chats);
  console.log(chats);


  const chatList = useMemo(() => {
    if (!chatListData?.data?.chats) return [];
    return [...chatListData?.data?.chats].sort((a, b) => {
      return new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0);
    });
  }, [chatListData?.data?.chats]);

  const handleSelectChat = async (chatId) => {
    setLoadingStates(prev => ({ ...prev, [chatId]: true }));
    router.push(`/chat/${chatId}`);
    if (setIsChatActive) setIsChatActive(true);

    try {
      const response = await markAsRead(chatId).unwrap();
      if (response.success) {
        dispatch(markChatAsRead(chatId));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, [chatId]: false }));
    }
  };

  const handleDeleteChat = async (chatId) => {
    setLoadingStates(prev => ({ ...prev, [chatId]: true }));
    try {
      await deleteChat(chatId).unwrap();
      dispatch(deleteChatLocally(chatId));
      message.success('Chat deleted successfully');
      if (id === chatId) {
        router.push('/chat');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, [chatId]: false }));
    }
  };

  const handleMuteChat = async (chatId) => {
    setLoadingStates(prev => ({ ...prev, [chatId]: true }));
    try {
      const chat = chatList.find(c => c._id === chatId);
      if (!chat) return;

      const isCurrentlyMuted = chat.mutedBy?.includes(localStorage.getItem("login_user_id"));

      await muteChat({
        id: chatId,
        body: { action: isCurrentlyMuted ? 'unmute' : 'mute' }
      }).unwrap();

      dispatch(toggleMuteChat(chatId));
      toast.success(`Chat ${isCurrentlyMuted ? 'unmuted' : 'muted'} successfully`);
    } catch (error) {
      console.error('Mute error:', error);
      toast.error(error?.data?.message || 'Failed to toggle mute status');
    } finally {
      setLoadingStates(prev => ({ ...prev, [chatId]: false }));
    }
  };

  const handleBlockChat = async (chatId) => {
    setLoadingStates(prev => ({ ...prev, [chatId]: true }));
    try {
      const chat = chatList.find(c => c._id === chatId);
      if (!chat) return;

      const userId = localStorage.getItem("login_user_id");
      const isCurrentlyBlocked = chat.blockedUsers?.some(
        block => block.blocker === userId
      );
      const targetId = chat.participants.find(p => p._id !== userId)?._id;

      if (!targetId) {
        throw new Error("Participant not found");
      }

      await blockChat({
        chatId,
        targetId,
        body: { action: isCurrentlyBlocked ? 'unblock' : 'block' }
      }).unwrap();

      dispatch(toggleBlockChat(chatId));
      message.success(`User ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully`);
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, [chatId]: false }));
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const bangladeshTime = moment.utc(timestamp).utcOffset(6);
    return bangladeshTime.fromNow();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getMenuItems = (chat) => [
    {
      key: 'mute',
      label: chat.mutedBy?.includes(localStorage.getItem("login_user_id")) ? 'Unmute Chat' : 'Mute Chat',
      icon: chat.mutedBy?.includes(localStorage.getItem("login_user_id")) ? <BsBell /> : <BsBellSlash />,
      onClick: () => handleMuteChat(chat._id)
    },
    {
      key: 'block',
      label: chat.isBlocked ? 'Unblock User' : 'Block User',
      icon: <BsBlockquoteRight />,
      onClick: () => handleBlockChat(chat._id)
    },
    {
      key: 'delete',
      label: 'Delete Chat',
      icon: <BsTrash />,
      danger: true,
      onClick: () => handleDeleteChat(chat._id)
    }
  ];

  if (isLoading) {
    return (
      <div className={`w-full h-[80vh] rounded-lg flex flex-col shadow-lg border ${isDarkMode ? 'dark-mode bg-gray-800 border-gray-700' : 'bg-[#f9f9f9] border-gray-200'}`}>
        <div className="p-4">
          <Flex gap={8}>
            <Input
              prefix={<BsSearch className="mx-1 text-subtitle" size={20} />}
              placeholder="Search for..."
              allowClear
              style={{ width: '100%', height: 42 }}
              disabled
            />
          </Flex>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`w-full h-[80vh] rounded-lg flex flex-col shadow-lg border ${isDarkMode ? 'dark-mode bg-gray-800 border-gray-700' : 'bg-[#f9f9f9] border-gray-200'}`}>
        <div className="p-4">
          <Flex gap={8}>
            <Input
              prefix={<BsSearch className="mx-1 text-subtitle" size={20} />}
              placeholder="Search for..."
              allowClear
              style={{ width: '100%', height: 42 }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Flex>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Failed to load chats. <button onClick={refetch} className="text-primary">Retry</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-[80vh] rounded-lg flex flex-col shadow-lg border ${isDarkMode ? 'dark-mode bg-gray-800 border-gray-700' : 'bg-[#f9f9f9] border-gray-200'}`}>
      <div className="p-4">
        <Flex gap={8}>
          <Input
            prefix={<BsSearch className={`mx-1 ${isDarkMode ? 'text-gray-300' : 'text-subtitle'}`} size={20} />}
            placeholder="Search for..."
            allowClear
            style={{ width: '100%', height: 42 }}
            value={searchTerm}
            onChange={handleSearchChange}
            className={isDarkMode ? 'bg-gray-700 text-white' : ''}
          />
        </Flex>
      </div>

      <div className={`chat-list-container flex-1 overflow-y-auto px-4 ${isDarkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
        <style jsx global>{`
          .chat-list-container::-webkit-scrollbar {
            width: 6px;
          }
          .chat-list-container::-webkit-scrollbar-track {
            background: ${isDarkMode ? '#374151' : '#FFFFFF'};
          }
          .chat-list-container::-webkit-scrollbar-thumb {
            background-color: ${isDarkMode ? '#4B5563' : '#CBD5E0'};
            border-radius: 3px;
          }
        `}</style>

        {chatList?.length > 0 ? (
          <AnimatePresence>
            {chatList.map((chat) => (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Spin spinning={!!loadingStates[chat._id]}>
                  <div
                    onClick={() => handleSelectChat(chat._id)}
                    className={`flex items-center gap-4 p-4 cursor-pointer rounded-lg relative group ${chat._id === id
                      ? (isDarkMode ? 'bg-gray-700' : 'bg-[#EBF4FF]')
                      : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#EBF4FF]')
                      } ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}
                  >
                    <div className="relative">
                      <Avatar
                        size={50}
                        src={getImageUrl(chat?.participants?.[0]?.profile)}
                        className="transition-transform duration-200 group-hover:scale-110"
                      />
                      {chat.isBlocked && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <BsBlockquoteRight className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className={`font-medium ${chat.unreadCount > 0 ? "font-bold" : "font-normal"} truncate ${chat.isBlocked ? 'line-through' : ''}`}>
                          {chat?.participants?.[0]?.userName || "User"}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatTime(chat?.lastMessage?.createdAt)}
                          </span>
                          {chat.mutedBy?.includes(localStorage.getItem("login_user_id")) && <BsBellSlash className="text-gray-400" size={14} />}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${chat.unreadCount > 0 ? "font-semibold" : "font-normal"} truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {chat?.lastMessage?.text?.slice(0, 25) || ''}
                          {!chat?.lastMessage?.text && chat?.lastMessage?.image && '📷 Photo'}
                          {!chat?.lastMessage?.text && !chat?.lastMessage?.image && 'No messages yet'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {chat?.unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-primary text-white rounded-full px-2 py-1 text-xs min-w-[20px] text-center"
                        >
                          {chat?.unreadCount}
                        </motion.span>
                      )}

                      <Dropdown
                        menu={{ items: getMenuItems(chat) }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <BsThreeDotsVertical />
                        </motion.button>
                      </Dropdown>
                    </div>
                  </div>
                </Spin>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center h-32"
          >
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              {searchTerm ? 'No matching chats found' : 'No chats yet. Start a conversation!'}
            </p>
          </motion.div>
        )}
      </div>

      {unreadCount > 0 && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-sm font-medium">
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
              {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;