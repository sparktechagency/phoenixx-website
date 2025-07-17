'use client';

import { Avatar, Button, Dropdown, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { useContext, useState } from 'react';
import { BsEmojiSmile, BsReply, BsThreeDotsVertical, BsTrash } from 'react-icons/bs';
import { TbPinned } from 'react-icons/tb';
import { getImageUrl } from '../../../../utils/getImageUrl';
import { ThemeContext } from '../../ClientLayout';

const MessageBubble = ({ 
  message, 
  isCurrentUser, 
  onReaction, 
  onPin, 
  onReply, 
  reactions, 
  formatDate, 
  index 
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [clickedMessageId, setClickedMessageId] = useState(null);

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: index * 0.02,
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const handleReactionClick = (reactionName) => {
    onReaction(message._id, reactionName);
    setShowReactionPicker(false);
  };

  const handlePinClick = () => {
    const action = message.isPinned ? 'unpin' : 'pin';
    onPin(message._id, action);
  };

  const getReactionEmoji = (reactionType) => {
    const reactionMap = {
      love: "❤️",
      thumbs_up: "👍",
      laugh: "😂",
      angry: "😡",
      sad: "😢"
    };
    return reactionMap[reactionType] || "👍";
  };

  const menuItems = [
    {
      key: 'reply',
      label: 'Reply',
      icon: <BsReply />,
      onClick: () => onReply(message)
    },
    {
      key: 'pin',
      label: message.isPinned ? 'Unpin Message' : 'Pin Message',
      icon: <TbPinned />,
      onClick: handlePinClick
    },
    {
      key: 'delete',
      label: 'Delete Message',
      icon: <BsTrash />,
      danger: true,
      onClick: () => console.log('Delete message', message._id)
    }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={messageVariants}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 group`}
    >
      {!isCurrentUser && (
        <Avatar
          src={getImageUrl(message.sender?.profile)}
          size={32}
          className="mr-3 mt-1"
        />
      )}

      <div className={`relative max-w-xs lg:max-w-md ${isCurrentUser ? 'order-1' : 'order-2'}`}>
        {/* Pin indicator */}
        {message.isPinned && (
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
            <TbPinned className="text-blue-500 text-sm" />
          </div>
        )}

        {/* Reply indicator */}
        {message.replyTo && (
          <div
            className={`mb-2 p-2 rounded-lg text-xs cursor-pointer border-l-4 border-blue-500 ${
              isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
            }`}
            onClick={() => {
              setClickedMessageId(message._id);
              setTimeout(() => setClickedMessageId(null), 1000);
            }}
          >
            <div className="flex items-center space-x-2">
              <Avatar src={getImageUrl(message.replyTo.sender?.profile)} size={16} />
              <span className="font-medium text-blue-600">
                {message.replyTo.sender?.userName}
              </span>
            </div>
            <p className="text-gray-500 mt-1 truncate">
              {message.replyTo.text || "📷 Image"}
            </p>
          </div>
        )}

        {/* Message bubble */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`relative p-3 rounded-2xl shadow-md ${
            message.isDeleted
              ? (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500')
              : isCurrentUser
              ? 'bg-blue-500 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-200'
              : 'bg-white text-gray-800'
          } ${
            clickedMessageId === message._id ? 'animate-pulse bg-yellow-200' : ''
          }`}
        >
          {/* Message content */}
          {message.images?.length > 0 && !message.isDeleted && (
            <div className="mb-2">
              <img
                src={getImageUrl(message.images[0])}
                alt="Message"
                className="rounded-lg max-w-full h-auto max-h-64 object-cover cursor-pointer"
                onClick={() => window.open(getImageUrl(message.images[0]), '_blank')}
              />
            </div>
          )}

          {!message.isDeleted && message.text && (
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          )}

          {message.isDeleted && (
            <p className="italic flex items-center">
              <span className="mr-2">🗑️</span>
              This message has been deleted
            </p>
          )}

          {/* Message time */}
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${
              isCurrentUser ? 'text-blue-100' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {formatDate(message.createdAt)}
            </span>
            {message.read && isCurrentUser && (
              <span className="text-xs text-blue-200 ml-2">✓✓</span>
            )}
          </div>

          {/* Reactions */}
          {!message.isDeleted && message.reactions?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, i) => (
                <Tooltip key={i} title={reaction?.userId?.userName || 'User'}>
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                  }`}>
                    <span className="mr-1">{getReactionEmoji(reaction.reactionType)}</span>
                    <span>{reaction.count || 1}</span>
                  </div>
                </Tooltip>
              ))}
            </div>
          )}
        </motion.div>

        {/* Message actions */}
        <div className={`absolute top-0 ${
          isCurrentUser ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
        } opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1`}>
          <div className="relative">
            <Button
              type="text"
              size="small"
              icon={<BsEmojiSmile />}
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className={`rounded-full ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'
              } shadow-md hover:shadow-lg`}
            />
            
            {showReactionPicker && (
              <div className={`absolute z-50 p-2 rounded-full flex items-center space-x-1 ${
                isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
              } shadow-lg ${isCurrentUser ? 'right-0' : 'left-0'} -top-12`}>
                {reactions.map((reaction) => (
                  <Button
                    key={reaction.name}
                    type="text"
                    size="small"
                    onClick={() => handleReactionClick(reaction.name)}
                    className="hover:scale-125 transition-transform"
                  >
                    <span className="text-lg">{reaction.emoji}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement={isCurrentUser ? 'bottomLeft' : 'bottomRight'}
          >
            <Button
              type="text"
              size="small"
              icon={<BsThreeDotsVertical />}
              className={`rounded-full ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'
              } shadow-md hover:shadow-lg`}
            />
          </Dropdown>
        </div>
      </div>

      {isCurrentUser && (
        <Avatar
          src={getImageUrl(message.sender?.profile)}
          size={32}
          className="ml-3 mt-1"
        />
      )}
    </motion.div>
  );
};

export default MessageBubble;