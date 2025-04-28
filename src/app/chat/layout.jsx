'use client';

import { useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useAuth } from '../../hooks/useAuth';
import ChatList from './Component/ChatList';


const ChatLayout = ({ children }) => {
  useAuth()
  const [isChatActive, setIsChatActive] = useState(false);




  return (
    <div className="container mx-auto gap-3 my-10  flex flex-col lg:flex-row ">
      <div className={`w-full lg:w-3/12 bg-white ${isChatActive ? 'hidden lg:block' : ''}`}>
        <ChatList status={isChatActive} setIsChatActive={setIsChatActive} />

      </div>


      <div className={`${isChatActive ? '' : 'hidden lg:block'} border border-gray-200 rounded-lg shadow w-full lg:w-2/3 flex flex-col bg-gray-50`}>
        <button className={`lg:hidden ${isChatActive ? 'block' : ''}`} onClick={() => setIsChatActive(false)}>
          <IoIosArrowBack className="text-2xl" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default ChatLayout;
