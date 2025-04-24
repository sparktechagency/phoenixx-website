"use client";
import { useState, useEffect, useRef } from 'react';
import { Input, Avatar, Badge, Button, Dropdown, Menu } from 'antd';
import { 
  SendOutlined, 
  SmileOutlined, 
  PaperClipOutlined, 
  MoreOutlined, 
  SearchOutlined
} from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { IoIosArrowBack } from "react-icons/io";
import { useParams, useRouter } from 'next/navigation';
import { useGetAllChatQuery, useMessageSendMutation } from '@/features/chat/massage';

dayjs.extend(relativeTime);

export default function ChatApp() {
  const router = useRouter();
  const { id } = useParams(); // userid
  const { data: chatData, isLoading } = useGetAllChatQuery();
  const [messageSend , {isLoading:messageSendLoading}] = useMessageSendMutation()
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // State management
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [chatList, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  // Process chat data when it's loaded
  useEffect(() => {
    if (chatData?.data && chatData.data.length > 0) {
      const formattedChats = chatData.data.map(chat => ({
        id: chat._id,
        name: chat.participants[0]?.userName || 'Unknown User',
        status: 'offline', // Default status
        lastMessage: chat.lastMessage?.content || 'No messages yet',
        avatar: chat.participants[0]?.profile || '',
        unread: chat.unreadMessage || 0,
        lastSeen: chat.updatedAt ? dayjs(chat.updatedAt).fromNow() : '',
        participants: chat.participants
      }));
      
      setChatList(formattedChats);
      
      // Set active chat to first chat if none is selected
      if (!activeChat && formattedChats.length > 0) {
        setActiveChat({
          id: formattedChats[0].id,
          name: formattedChats[0].name,
          avatar: formattedChats[0].avatar || 'https://joeschmoe.io/api/v1/random',
          status: formattedChats[0].status,
          messages: [],
          typing: false,
          participants: formattedChats[0].participants
        });
      }
    }
  }, [chatData]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowSidebar(true);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'online': return <Badge status="success" />;
      case 'away': return <Badge status="warning" />;
      default: return <Badge status="default" />;
    }
  };

  const formatMessageTime = (time) => dayjs(time).format('h:mm A');
  const formatMessageDate = (time) => dayjs(time).format('MMM D, YYYY');

  const shouldShowDate = (index, messages) => {
    if (index === 0) return true;
    const currentDate = dayjs(messages[index].time).format('YYYY-MM-DD');
    const prevDate = dayjs(messages[index - 1].time).format('YYYY-MM-DD');
    return currentDate !== prevDate;
  };

  // Message handlers
  const handleSendMessage =async () => {
    if (!messageText.trim() || !activeChat) return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      time: new Date().toISOString(),
      status: 'sent'
    };
    
    setActiveChat(prev => ({
      ...prev,
      messages: [...(prev.messages || []), newMessage]
    }));
    
    setMessageText('');
    
    /* 
    need :
    user id form parems 
    image ,

    data 
    
    */

    try {
      const response = await messageSend().unwrap();
      console.log(response)
    } catch (error) {
      console.log(error)
    }
    

    // Here you would call your API to send the message
    // e.g., sendMessageMutation({ chatId: activeChat.id, text: messageText })
  };

  // File upload handler
  const handleFileChange = (e) => {
    if (!activeChat) return;
    
    const files = e.target.files;
    if (files.length > 0) {
      const attachments = Array.from(files).map(file => ({
        type: file.type.startsWith('image') ? 'image' : 'file',
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file)
      }));

      const newMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: '',
        time: new Date().toISOString(),
        status: 'sent',
        attachments
      };
      
      setActiveChat(prev => ({
        ...prev,
        messages: [...(prev.messages || []), newMessage]
      }));

      e.target.value = '';
      
      // Here you would call your API to send the file(s)
      // e.g., uploadFileMutation({ chatId: activeChat.id, files })
    }
  };

  const handleContactClick = (contact) => {
    setActiveChat({
      id: contact.id,
      name: contact.name,
      avatar: contact.avatar || 'https://joeschmoe.io/api/v1/random',
      status: contact.status,
      lastSeen: contact.lastSeen,
      typing: false,
      messages: [], // This would be fetched from API in a real app
      participants: contact.participants
    });
    
    // Mark as read (in a real app, call API)
    setChatList(prev => prev.map(c => 
      c.id === contact.id ? {...c, unread: 0} : c
    ));
    
    // Here you would call your API to fetch messages for this chat
    // e.g., const { data } = await fetchMessages(contact.id)
    
    if (isMobileView) setShowSidebar(false);
  };

  // Dropdown menu for chat options
  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<SearchOutlined />}>Search</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2" danger>Delete chat</Menu.Item>
    </Menu>
  );

  // Filter contacts based on search text
  const filteredContacts = searchText
    ? chatList.filter(c => 
        c.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(searchText.toLowerCase()))
      )
    : chatList;

  return (
    <div className='bg-[#F2F4F7]'>
      <div className="flex gap-7 sm:p-6 p-0 sm:h-[835px] h-screen sm:w-10/12 w-full mx-auto">
        {/* Left sidebar - Contacts */}
        {(showSidebar || !isMobileView) && (
          <div className={`w-full md:w-80 bg-white rounded-lg shadow flex flex-col ${isMobileView ? 'absolute z-10 h-full' : ''}`}>
            {/* User header */}
            <div className="p-4 border rounded-t-lg border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center">
                <Avatar src="https://joeschmoe.io/api/v1/random" size="large" className="mr-3" />
                <div>
                  <div className="font-semibold">You</div>
                  <div className="text-xs text-gray-500">Online</div>
                </div>
              </div>
              <Button type="text" icon={<MoreOutlined />} />
            </div>
            
            {/* Search */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <Input
                placeholder="Search messages"
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="rounded-lg bg-white"
              />
            </div>
            
            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-24">
                  <span>Loading chats...</span>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="flex justify-center items-center h-24 text-gray-500">
                  {searchText ? 'No matching chats found' : 'No chats available'}
                </div>
              ) : (
                filteredContacts.map(contact => (
                  <div 
                    key={contact.id} 
                    className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                      activeChat?.id === contact.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleContactClick(contact)}
                  >
                    <div className="relative">
                      <Avatar 
                        src={contact.avatar || 'https://joeschmoe.io/api/v1/random'} 
                        size={48} 
                      />
                      <div className="absolute -bottom-1 -right-1">
                        {getStatusBadge(contact.status)}
                      </div>
                    </div>
                    <div className="ml-3 overflow-hidden flex-1">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-gray-900">{contact.name}</div>
                        <div className="text-xs text-gray-400">
                          {contact.lastSeen || 'N/A'}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500 truncate">{contact.lastMessage}</div>
                        {contact.unread > 0 && (
                          <Badge count={contact.unread} style={{ backgroundColor: '#0001FB' }} />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main chat area */}
        <div className={`flex-1 flex flex-col bg-white shadow rounded-lg ${!showSidebar && isMobileView ? 'w-full' : ''}`}>
          {/* Chat header */}
          {activeChat ? (
            <>
              <div className="px-4 py-3 bg-white shadow-sm flex items-center justify-between border-b rounded-t-lg border-gray-200">
                <div className="flex items-center">
                  {isMobileView && !showSidebar && (
                    <Button 
                      type="text" 
                      icon={<IoIosArrowBack />} 
                      onClick={() => setShowSidebar(true)}
                      className="mr-2"
                    />
                  )}
                  <div className="relative">
                    <Avatar 
                      src={activeChat.avatar || 'https://joeschmoe.io/api/v1/random'} 
                      size={48} 
                    />
                    <div className="absolute -bottom-1 -right-1">
                      {getStatusBadge(activeChat.status)}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">{activeChat.name}</div>
                    <div className="text-xs text-gray-500">
                      {activeChat.typing ? (
                        <span className="text-primary">typing...</span>
                      ) : (
                        activeChat.status === 'online' ? 'Online' : `Last seen ${activeChat.lastSeen || 'N/A'}`
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Dropdown overlay={menu} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {activeChat.messages && activeChat.messages.length > 0 ? (
                  activeChat.messages.map((message, index) => (
                    <div key={message.id}>
                      {/* Date separator */}
                      {shouldShowDate(index, activeChat.messages) && (
                        <div className="flex justify-center my-4">
                          <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                            {formatMessageDate(message.time)}
                          </div>
                        </div>
                      )}
                      
                      {/* Message bubble */}
                      <div className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-xs md:max-w-md lg:max-w-lg ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                          {message.sender === 'contact' && (
                            <Avatar 
                              src={activeChat.avatar || 'https://joeschmoe.io/api/v1/random'} 
                              size={36} 
                              className="flex-shrink-0 mt-1" 
                            />
                          )}
                          
                          <div className={`mx-2 flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            {message.text && (
                              <div className={`px-4 py-2 rounded-2xl ${
                                message.sender === 'user' 
                                  ? 'bg-primary text-white rounded-tr-none' 
                                  : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                              }`}>
                                {message.text}
                              </div>
                            )}
                            
                            {/* Attachments rendering */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className={`mt-1 grid gap-2 ${
                                message.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                              }`}>
                                {message.attachments.slice(0, 4).map((file, idx) => (
                                  <div 
                                    key={idx} 
                                    className="rounded-lg overflow-hidden"
                                  >
                                    {file.type === 'image' ? (
                                      <img 
                                        src={file.url} 
                                        alt={file.name}
                                        className="w-full h-32 object-cover"
                                      />
                                    ) : (
                                      <div className="bg-gray-100 p-3 rounded-lg">
                                        <PaperClipOutlined className="mr-2" />
                                        <span className="text-sm">{file.name}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Message time */}
                            <div className="text-xs text-gray-500 mt-1">
                              {formatMessageTime(message.time)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    No messages yet. Start a conversation!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-3 bg-white border-t rounded-b-lg border-gray-200">
                {showEmojiPicker && (
                  <div className="absolute bottom-16 right-4 z-10">
                    <EmojiPicker 
                      onEmojiClick={(emojiData) => {
                        setMessageText(prev => prev + emojiData.emoji);
                        setShowEmojiPicker(false);
                      }}
                      width={300}
                      height={350}
                    />
                  </div>
                )}
                
                {/* Hidden file input */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  multiple
                />
                
                <div className="flex items-center">
                  <Button 
                    type="text" 
                    icon={<PaperClipOutlined />} 
                    onClick={() => fileInputRef.current.click()}
                    className="text-gray-500 hover:text-gray-700"
                  />
                  <Button 
                    type="text" 
                    icon={<SmileOutlined />} 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-gray-500 hover:text-gray-700"
                  />
                  
                  <Input
                    placeholder="Type a message..."
                    bordered={false}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onPressEnter={handleSendMessage}
                    className="flex-1 bg-gray-100 rounded-full px-4 mx-2"
                  />
                  
                  <Button 
                    type="primary" 
                    shape="circle" 
                    icon={<SendOutlined />} 
                    onClick={handleSendMessage}
                    className="bg-primary"
                    disabled={!messageText.trim()}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              {chatList.length > 0 ? 'Select a chat to start messaging' : 'No chats available'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}