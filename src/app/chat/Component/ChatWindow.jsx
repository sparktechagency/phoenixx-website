'use client';
import { useGetAllChatQuery, useGetAllMassageQuery, useMessageSendMutation } from '@/features/chat/massage';
import { Avatar, Badge, Button, Form, Input, Upload } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { IoIosAttach } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { baseURL } from '../../../../utils/BaseURL';
import { getImageUrl } from '../../../../utils/getImageUrl';

const ChatWindow = ({ id }) => {
  useGetAllMassageQuery(id);
  const { messages } = useSelector((state) => state.message);
  const [sendMessage, { isLoading }] = useMessageSendMutation();
  const loginUserId = localStorage.getItem("login_user_id");
  const [form] = Form.useForm();
  const messagesEndRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { data: chatList, isLoading: chatLoading } = useGetAllChatQuery("");
  // console.log(chatList?.data?.participants)

  const users = chatList?.data?.find(chat => chat?.participants?.map(item => item === id));

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

  // Handle file selection to show preview
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

  // Function to remove the image preview
  const removeImage = () => {
    setImagePreview(null);
    form.setFieldsValue({ file: { fileList: [] } });
  };

  return (
    <div className="flex flex-col h-[80vh]">
      {/* Header */}
      <div className="p-4 bg-white flex items-center gap-4 border-b border-gray-200">
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

        <h3 className="font-medium">
          {users?.participants?.length > 0
            ? users.participants.map(participantId => <h3>{participantId.userName}</h3>)
            : "Chat Participants"
          }
        </h3>
      </div>

      {/* Message container */}
      <div className="flex-1 bg-[#F5F5F6] p-4 pb-0 overflow-y-auto message-container">
        <style jsx global>{`
                    .message-container::-webkit-scrollbar {
                        width: 6px;
                    }
                    .message-container::-webkit-scrollbar-track {
                        background: #F5F5F6;
                    }
                    .message-container::-webkit-scrollbar-thumb {
                        background-color: #CBD5E0;
                    }
                `}</style>

        {messages.map((message, index) => {
          const isCurrentUser = message.sender?._id === loginUserId;
          return (
            <div key={message._id || index} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
              {/* Avatar for other users (top-aligned) */}
              {!isCurrentUser && (
                <Avatar
                  src={`${baseURL}${message.sender?.profile}` || "/images/default-avatar.jpg"}
                  size={32}
                  className="mr-2 self-start"
                  style={{ marginRight: "3px" }}
                />
              )}

              {/* Message bubble */}
              <div className={`max-w-xs p-3 rounded-lg ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}>
                {!isCurrentUser && (
                  <p className="text-xs font-semibold mb-1">{message.sender?.userName}</p>
                )}

                <p>{message.text}</p>

                {message.image && (
                  <img
                    src={`${baseURL}${message.image}`}
                    alt="Message attachment"
                    className="rounded w-44 my-2 h-44 object-cover"
                  />
                )}
                <p className="text-xs mt-1 opacity-70">{formatDate(message.createdAt)}</p>
              </div>

              {/* Avatar for current user (bottom-aligned) */}
              {isCurrentUser && (
                <Avatar
                  src={`${baseURL}${message.sender?.profile}` || "/images/default-avatar.jpg"}
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
      <div className="bg-white p-1 border-t border-gray-200">
        {/* Image preview area */}
        {imagePreview && (
          <div className="mx-4 mt-2 relative">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 w-auto rounded object-cover border border-gray-200"
              />
              <Button
                type="text"
                className="absolute -top-2 -right-2 bg-white rounded-full p-0 flex items-center justify-center h-6 w-6 shadow-md"
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
          className="flex w-full items-center gap-2"
        >
          <Form.Item name="file" valuePropName="file" className="flex items-center" >
            <Upload
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
              showUploadList={false}
              className="flex items-center"
              onChange={handleFileChange}
            >
              <Button
                type="text"
                icon={<IoIosAttach color="#9F9F9F" size={24} />}
                className="flex items-center justify-center"
                style={{ marginTop: imagePreview ? "0" : "25px" }}
              />
            </Upload>
          </Form.Item>
          <Form.Item style={{ width: '100%', margin: 0 }} name="message">
            <Input.Search
              style={{
                backgroundColor: '#F5F5F6',
                borderRadius: '8px',
                width: '100%',
              }}
              placeholder="Type something ..."
              allowClear
              enterButton={
                <Button
                  htmlType='submit'
                  type="primary"
                  style={{ backgroundColor: '#0047FF', border: 'none' }}
                >
                  {isLoading ? "Sending..." : "Send"}
                </Button>
              }
              size="large"
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ChatWindow;
