"use client";
import { useState, useEffect, useRef } from 'react';
import { Input, Avatar, Badge, Button, Dropdown, Menu, message as antMessage } from 'antd';
import { 
  SendOutlined, 
  SmileOutlined, 
  PaperClipOutlined, 
  MoreOutlined, 
  PhoneOutlined, 
  VideoCameraOutlined,
  SearchOutlined,
  AudioOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { IoIosArrowBack } from "react-icons/io";

dayjs.extend(relativeTime);

export default function ChatApp() {
  // State management
  const [contacts, setContacts] = useState([
    { 
      id: 1, 
      name: 'Dawn Teague', 
      status: 'online', 
      lastMessage: 'Hello, How are you?', 
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      unread: 3,
      lastSeen: '2 hr'
    },
    { 
      id: 2, 
      name: 'David Johnson', 
      status: 'online', 
      lastMessage: 'Here are some designs...', 
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      unread: 0
    },
    { 
      id: 3, 
      name: 'Andrew Gilbert', 
      status: 'away', 
      lastMessage: 'Meeting at 3pm', 
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      unread: 1,
      lastSeen: '30 min'
    }
  ]);

  const [activeChat, setActiveChat] = useState({
    id: 1,
    name: 'Dawn Teague',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    status: 'online',
    typing: false,
    messages: [
      { 
        id: 1, 
        sender: 'user', 
        text: 'Hi there! How are you?', 
        time: new Date(Date.now() - 3600000).toISOString(),
        status: 'read'
      },
      { 
        id: 2, 
        sender: 'contact', 
        text: "I'm good, thanks! How about you?", 
        time: new Date(Date.now() - 3500000).toISOString()
      }
    ]
  });

  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Effects
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowSidebar(true);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.messages]);

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

  const shouldShowDate = (index) => {
    if (index === 0) return true;
    const currentDate = dayjs(activeChat.messages[index].time).format('YYYY-MM-DD');
    const prevDate = dayjs(activeChat.messages[index - 1].time).format('YYYY-MM-DD');
    return currentDate !== prevDate;
  };

  // Message handlers
  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage = {
        id: activeChat.messages.length + 1,
        sender: 'user',
        text: messageText,
        time: new Date().toISOString(),
        status: 'sent'
      };
      
      setActiveChat(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage]
      }));
      
      setMessageText('');
      
      // Simulate typing indicator
      setActiveChat(prev => ({ ...prev, typing: true }));
      
      setTimeout(() => {
        setActiveChat(prev => ({ ...prev, typing: false }));
        
        // Simulate reply
        const replies = [
          "Got it!",
          "I'll check that right away.",
          "Thanks for letting me know.",
          "Working on it now."
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        setActiveChat(prev => ({
          ...prev,
          messages: [...prev.messages, {
            id: prev.messages.length + 2,
            sender: 'contact',
            text: randomReply,
            time: new Date().toISOString()
          }]
        }));
      }, 1000 + Math.random() * 2000);
    }
  };

  // File upload handler
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const attachments = Array.from(files).map(file => ({
        type: file.type.startsWith('image') ? 'image' : 'file',
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file)
      }));

      const newMessage = {
        id: activeChat.messages.length + 1,
        sender: 'user',
        text: '',
        time: new Date().toISOString(),
        status: 'sent',
        attachments
      };
      
      setActiveChat(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage]
      }));

      e.target.value = '';
      
      // Simulate file received response
      setTimeout(() => {
        setActiveChat(prev => ({
          ...prev,
          messages: [...prev.messages, {
            id: prev.messages.length + 2,
            sender: 'contact',
            text: files.length > 1 
              ? `Received ${files.length} files!` 
              : "Got the file, thanks!",
            time: new Date().toISOString()
          }]
        }));
      }, 1500);
    }
  };

  const handleContactClick = (contact) => {
    setActiveChat({
      id: contact.id,
      name: contact.name,
      avatar: contact.avatar,
      status: contact.status,
      lastSeen: contact.lastSeen,
      typing: false,
      messages: generateMessagesForContact(contact.id)
    });
    
    // Mark as read
    setContacts(prev => prev.map(c => 
      c.id === contact.id ? {...c, unread: 0} : c
    ));
    
    if (isMobileView) setShowSidebar(false);
  };

  const generateMessagesForContact = (contactId) => {
    // In a real app, this would fetch from API
    return [
      {
        id: 1,
        sender: 'user',
        text: 'Hi there! How are you doing?',
        time: new Date(Date.now() - 86400000).toISOString(),
        status: 'read'
      },
      {
        id: 2,
        sender: 'contact',
        text: "I'm good, thanks! How about you?",
        time: new Date(Date.now() - 86300000).toISOString()
      }
    ];
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<SearchOutlined />}>Search</Menu.Item>
      <Menu.Item key="2" icon={<PhoneOutlined />}>Call</Menu.Item>
      <Menu.Item key="3" icon={<VideoCameraOutlined />}>Video</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="4" danger>Delete chat</Menu.Item>
    </Menu>
  );

  return (
    <div className="flex sm:p-6 p-0 h-screen bg-gray-50">
      {/* Left sidebar - Contacts */}
      {(showSidebar || !isMobileView) && (
        <div className={`w-full md:w-80 bg-white shadow-sm border-r border-gray-200 flex flex-col ${isMobileView ? 'absolute z-10 h-full' : ''}`}>
          {/* User header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center">
              <Avatar src="https://randomuser.me/api/portraits/men/1.jpg" size="large" className="mr-3" />
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
            {contacts.map(contact => (
              <div 
                key={contact.id} 
                className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                  activeChat.id === contact.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleContactClick(contact)}
              >
                <div className="relative">
                  <Avatar src={contact.avatar} size={48} />
                  <div className="absolute -bottom-1 -right-1">
                    {getStatusBadge(contact.status)}
                  </div>
                </div>
                <div className="ml-3 overflow-hidden flex-1">
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-gray-900">{contact.name}</div>
                    <div className="text-xs text-gray-400">
                      {dayjs().subtract(2, 'hour').format('h:mm A')}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500 truncate">{contact.lastMessage}</div>
                    {contact.unread > 0 && (
                      <Badge count={contact.unread} style={{ backgroundColor: '#1890ff' }} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className={`flex-1 flex flex-col ${!showSidebar && isMobileView ? 'w-full' : ''}`}>
        {/* Chat header */}
        <div className="px-4 py-3 bg-white shadow-sm flex items-center justify-between border-b border-gray-200">
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
              <Avatar src={activeChat.avatar} size={48} />
              <div className="absolute -bottom-1 -right-1">
                {getStatusBadge(activeChat.status)}
              </div>
            </div>
            <div className="ml-3">
              <div className="font-semibold text-gray-900">{activeChat.name}</div>
              <div className="text-xs text-gray-500">
                {activeChat.typing ? (
                  <span className="text-blue-500">typing...</span>
                ) : (
                  activeChat.status === 'online' ? 'Online' : `Last seen ${activeChat.lastSeen}`
                )}
              </div>
            </div>
          </div>
          
          {/* <div className="flex items-center space-x-2">
            <Button 
              type="text" 
              icon={<PhoneOutlined />} 
              onClick={() => antMessage.info('Call started')}
            />
            <Button 
              type="text" 
              icon={<VideoCameraOutlined />} 
              onClick={() => antMessage.info('Video call started')}
            />
            <Dropdown overlay={menu} trigger={['click']}>
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </div> */}
        </div>

        {/* Messages area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {activeChat.messages.map((message, index) => (
            <div key={message.id}>
              {/* Date separator */}
              {shouldShowDate(index) && (
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
                    <Avatar src={activeChat.avatar} size={36} className="flex-shrink-0 mt-1" />
                  )}
                  
                  <div className={`mx-2 flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    {message.text && (
                      <div className={`px-4 py-2 rounded-2xl ${
                        message.sender === 'user' 
                          ? 'bg-blue-500 text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                      }`}>
                        {message.text}
                      </div>
                    )}
                    
                    {/* Attachments */}
                    {message.attachments && (
                      <div className={`mt-1 grid gap-2 ${
                        message.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                      }`}>
                        {message.attachments.slice(0, 4).map((file, idx) => (
                          <div 
                            key={idx} 
                            className={`rounded-lg overflow-hidden ${
                              message.attachments.length > 1 && idx === 3 ? 'relative' : ''
                            }`}
                          >
                            {file.type === 'image' ? (
                              <>
                                <img 
                                  src={file.url} 
                                  alt={file.name}
                                  className="w-full h-32 object-cover"
                                />
                                {message.attachments.length > 4 && idx === 3 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold">
                                    +{message.attachments.length - 4}
                                  </div>
                                )}
                              </>
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
                    
                    {/* Message status and time */}
                    <div className={`flex items-center mt-1 text-xs text-gray-500 ${
                      message.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}>
                      <span className="mx-1">{formatMessageTime(message.time)}</span>
                      {message.sender === 'user' && (
                        <span className="ml-1">
                          {message.status === 'read' ? (
                            <CheckCircleOutlined className="text-blue-500" />
                          ) : message.status === 'sent' ? (
                            <ClockCircleOutlined className="text-gray-400" />
                          ) : null}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-3 bg-white border-t border-gray-200">
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
            
            {messageText ? (
              <Button 
                type="primary" 
                shape="circle" 
                icon={<SendOutlined />} 
                onClick={handleSendMessage}
                className="bg-blue-500 hover:bg-blue-600"
              />
            ) : (
              <Button 
                type="text" 
                icon={<AudioOutlined />} 
                onClick={() => antMessage.info('Voice message recording would start')}
                className="text-gray-500 hover:text-gray-700"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}