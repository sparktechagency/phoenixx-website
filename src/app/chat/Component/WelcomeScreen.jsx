'use client';

import { motion } from 'framer-motion';
import { useContext } from 'react';
import { ThemeContext } from '../../ClientLayout';

const WelcomeScreen = () => {
  const { isDarkMode } = useContext(ThemeContext);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`flex flex-col items-center justify-center h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}
    >
      <motion.div
        variants={itemVariants}
        className="text-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="text-8xl mb-6"
        >
          💬
        </motion.div>

        <motion.h2
          variants={itemVariants}
          className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
        >
          Welcome to Messenger
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className={`text-lg mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
        >
          Select a conversation to start messaging
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center space-y-4"
        >
          <div className={`grid grid-cols-3 gap-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
            <div className="text-center">
              <div className="text-3xl mb-2">🔐</div>
              <p className="text-sm">End-to-end encrypted</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-sm">Real-time messaging</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <p className="text-sm">Cross-platform</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;