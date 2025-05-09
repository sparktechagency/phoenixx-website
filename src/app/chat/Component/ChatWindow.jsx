'use client';
import { useGetAllChatQuery, useGetAllMassageQuery, useMessageSendMutation } from '@/features/chat/massage';
import { Avatar, Badge, Button, Form, Input, Upload } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { IoIosAttach, IoMdSend } from 'react-icons/io';
import { BsEmojiSmile } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { getImageUrl } from '../../../../utils/getImageUrl';
import { ThemeContext } from '../../ClientLayout';
import EmojiPicker from 'emoji-picker-react';

const ChatWindow = ({ id }) => {
  useGetAllMassageQuery(id);
  const { messages } = useSelector((state) => state.message);
  const [sendMessage, { isLoading }] = useMessageSendMutation();
  const loginUserId = localStorage.getItem("login_user_id");
  const [form] = Form.useForm();
  const messagesEndRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { data: chatList, isLoading: chatLoading } = useGetAllChatQuery("");
  const { isDarkMode } = useContext(ThemeContext);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  const users = chatList?.data?.find(chat => chat?.participants?.map(item => item === id));

  // Handle outside click for emoji picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showEmojiPicker && 
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current && 
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    }

    // Add event listener when emoji picker is shown
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCreateNewMessage = async (values) => {
    if (!values.message && (!values?.file?.fileList || values?.file?.fileList.length === 0)) {
      return; // Don't send empty messages
    }

    const formData = new FormData();

    if (values?.file?.fileList?.length > 0) {
      formData.append("image", values?.file?.fileList[0]?.originFileObj);
    }

    formData.append("text", values.message || "");

    try {
      const res = await sendMessage({ body: formData, id }).unwrap();
      console.log(res);
      // Reset form and image preview
      form.resetFields();
      setImagePreview(null);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const handleFileChange = ({ fileList }) => {
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }

    // Update the form
    form.setFieldsValue({ file: { fileList } });
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setFieldsValue({ file: { fileList: [] } });
  };

  const onEmojiClick = (emojiData) => {
    const currentMessage = form.getFieldValue('message') || '';
    form.setFieldsValue({ message: currentMessage + emojiData.emoji });
    inputRef.current.focus();
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <div className={`flex flex-col h-[80vh] ${isDarkMode ? 'bg-gray-900 text-white' : ''}`}>
      {/* Header */}
      <div className={`p-4 flex items-center gap-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {users?.participants?.map((participantId, index) => (
          <div key={participantId} className="relative">
            <Avatar
              src={getImageUrl(participantId?.profile)}
              size={40}
            />
            <Badge
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '6px',
                position: 'absolute',
                bottom: "5px",
                right: "-3px"
              }}
              dot
              color="green"
            />
          </div>
        ))}

        <h3 className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>
          {users?.participants?.length > 0
            ? users.participants.map(participantId => <h3>{participantId.userName}</h3>)
            : "Chat Participants"
          }
        </h3>
      </div>

      {/* Message container */}
      <div className={`flex-1  p-4 pb-0 overflow-y-auto message-container ${isDarkMode ? 'bg-gray-800' : 'bg-[#fffff]'}`}>
        <style jsx global>{`
          .message-container::-webkit-scrollbar {
            width: 6px;
          }
          .message-container::-webkit-scrollbar-track {
            background: ${isDarkMode ? '#2D3748' : '#F5F5F6'};
          }
          .message-container::-webkit-scrollbar-thumb {
            background-color: ${isDarkMode ? '#4A5568' : '#CBD5E0'};
          }
        `}</style>

        {messages.map((message, index) => {
          const isCurrentUser = message.sender?._id === loginUserId;
          return (
            <div key={message._id || index} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
              {!isCurrentUser && (
                <Avatar
                  src={getImageUrl(message.sender?.profile)}
                  size={32}
                  className="mr-2 self-start"
                  style={{ marginRight: "3px" }}
                />
              )}

              <div className={`max-w-xs p-3 rounded-lg ${isCurrentUser
                ? 'bg-[#F3F4F6] text-black'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-200'
                  : 'bg-white text-gray-800'
                }`}>
                {/* {!isCurrentUser && (
                  <p className="text-xs font-semibold mb-1">{message.sender?.userName}</p>
                )} */}

                <p>{message.text}</p>

                {message.image && (
                  <img
                    src={getImageUrl(message.image)}
                    alt="Message attachment"
                    className="rounded w-44 my-2 h-44 object-cover"
                  />
                )}
                <p className={`text-xs mt-1 ${isDarkMode ? 'opacity-50' : 'opacity-70'}`}>
                  {formatDate(message.createdAt)}
                </p>
              </div>

              {isCurrentUser && (
                <Avatar
                  src={getImageUrl(message.sender?.profile)}
                  size={32}
                  className="ml-2 self-end"
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <div className={`p-1 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* Image preview area */}
        {imagePreview && (
          <div className="mx-4 mt-2 relative">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className={`h-20 w-auto rounded object-cover border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
              />
              <Button
                type="text"
                className={`absolute top-1 right-1 rounded-full p-0 flex items-center justify-center h-6 w-6 shadow-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                onClick={removeImage}
                style={{ fontSize: '12px' }}
              >
                ✕
              </Button>
            </div>
          </div>
        )}

        <Form
          form={form}
          onFinish={handleCreateNewMessage}
          name="messageForm"
          className="flex w-full items-center px-2 py-1 gap-2 relative"
          style={{ marginTop:"10px" , marginBottom:"-15px" }}
        >
          <div className="flex items-center">
            <Form.Item name="file" valuePropName="file" className="mb-0 mr-1">
              <Upload
                beforeUpload={() => false}
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                onChange={handleFileChange}
              >
                <Button
                  type="text"
                  icon={<IoIosAttach color={isDarkMode ? "#9BA3AF" : "#9F9F9F"} size={24} />}
                  className="flex items-center justify-center"
                />
              </Upload>
            </Form.Item>
            
            <Form.Item className="mb-0 mr-1">
              <Button
                ref={emojiButtonRef}
                type="text"
                icon={<BsEmojiSmile color={isDarkMode ? "#9BA3AF" : "#9F9F9F"} size={20} />}
                onClick={toggleEmojiPicker}
              />
            </Form.Item>
          </div>

          {showEmojiPicker && (
            <div className="absolute bottom-16 left-16 z-10" ref={emojiPickerRef}>
              <EmojiPicker 
                onEmojiClick={onEmojiClick}
                width={300}
                height={350}
                theme={isDarkMode ? 'dark' : 'light'}
              />
            </div>
          )}

          <Form.Item name="message" className="flex-1 mb-0">
            <Input
              ref={inputRef}
              style={{
                backgroundColor: isDarkMode ? '#374151' : '#F5F5F6',
                borderRadius: '8px',
                color: isDarkMode ? 'white' : 'inherit',
              }}
              placeholder="Type something ..."
              className={isDarkMode ? 'dark-input' : ''}
              size="large"
            />
          </Form.Item>

          <Form.Item className="mb-0 ml-1">
            <Button
              htmlType="submit"
              type="primary"
              icon={<IoMdSend />}
              style={{ 
                backgroundColor: '#0047FF', 
                border: 'none',
              }}
              loading={isLoading}
            />
          </Form.Item>
        </Form>
      </div>

      {/* Add dark mode styles for Ant Design components */}
      {isDarkMode && (
        <style jsx global>{`
          .ant-input {
            background-color: #374151 !important;
            color: white !important;
            border-color: #4B5563 !important;
          }

          .ant-input::placeholder {
            color: #9CA3AF !important;
          }

          .ant-input-search-button {
            background-color: #0047FF !important;
          }

          .ant-btn-text:hover {
            background-color: rgba(255, 255, 255, 0.08) !important;
          }

          .ant-input-clear-icon {
            color: #9CA3AF !important;
          }

          .ant-input-affix-wrapper {
            background-color: #374151 !important;
            border-color: #4B5563 !important;
          }
        `}</style>
      )}
    </div>
  );
};

export default ChatWindow;