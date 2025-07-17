'use client';

import { Avatar, Button } from 'antd';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { BsX } from 'react-icons/bs';
import { TbPinned } from 'react-icons/tb';
import { getImageUrl } from '../../../../utils/getImageUrl';
import { ThemeContext } from '../../ClientLayout';

const PinnedMessage = ({ messages, onUnpin }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const latestPinned = messages[0]; // Show the latest pinned message

  if (!latestPinned) return null;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className={`p-3 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
        }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <TbPinned className="text-blue-500" />
            <span className="text-sm font-medium text-blue-600">
              Pinned Message
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Avatar
              src={getImageUrl(latestPinned.sender?.profile)}
              size={20}
            />
            <span className="text-sm font-medium">
              {latestPinned.sender?.userName}
            </span>
          </div>
        </div>

        <Button
          type="text"
          size="small"
          icon={<BsX />}
          onClick={() => onUnpin(latestPinned._id)}
          className="text-gray-500 hover:text-gray-700"
        />
      </div>

      <div className="mt-2 ml-6">
        <p className={`text-sm truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
          {latestPinned.text || "📷 Image"}
        </p>
      </div>

      {messages.length > 1 && (
        <div className="mt-2 ml-6">
          <span className="text-xs text-blue-500">
            +{messages.length - 1} more pinned messages
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default PinnedMessage;