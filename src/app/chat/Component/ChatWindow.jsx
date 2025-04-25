'use client';
import { useGetAllMassageQuery, useMessageSendMutation } from '@/features/chat/massage';
import { Avatar, Badge, Button, Form, Input, Spin, Upload } from 'antd';
import { IoIosAttach } from 'react-icons/io';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '@/redux/features/messageSlice';

const ChatWindow = ({ id }) => {
    useGetAllMassageQuery(id);
    const { messages } = useSelector((state) => state.message)
    const [sendMessage, { isLoading }] = useMessageSendMutation();
    const loginUserId = localStorage.getItem("login_user_id")



    const handleCreateNewMessage = async (values) => {
        const formData = new FormData();

        if (values?.file?.fileList?.length > 0) {
            formData.append("image", values?.file?.fileList[0]?.originFileObj);
        }

        formData.append("text", JSON.stringify(values.message));

        try {
            const res = await sendMessage({ body: formData, id }).unwrap();
            console.log(res);
            // Optionally reset form
            form.resetFields();
        } catch (error) {
            console.error(error);
        }
    };

    const [form] = Form.useForm();

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


    return (
        <div className="">
            {/* Header remains static */}
            <div className="p-4 bg-white flex items-center gap-4">
                <Badge
                    style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '6px',
                    }}
                    offset={[-5, 40]}
                    dot
                    color="green"
                >
                    {/* Avatar icon placeholder */}
                </Badge>
                <h3 className="font-medium">Participant Name</h3>
            </div>

            {/* Message container with independent scrolling */}
            <div
                className="flex-1 bg-[#F5F5F6] p-4 h-[60vh] overflow-y-auto custom-scrollbar"
            >


                {
                    messages.map((message, index) => {
                        return (<div key={index} className={`flex ${message.sender?._id === loginUserId ? 'justify-end' : 'justify-start'} mb-4`}>
                            <div className={`max-w-xs p-3 rounded-lg ${message.sender === 'user' ? 'bg-orange-500 text-white' : 'bg-white border text-title'}`}>
                                <h1>{message?.sender.userName}</h1>
                                <p>{message.text}</p>
                                {message.image && (
                                    <img
                                        src={message.image}
                                        alt="Message attachment"
                                        className="rounded w-44 my-2 h-44 object-cover"
                                    />
                                )}
                                <p className="text-xs mt-1">{formatDate(message.createdAt)}</p>
                            </div>
                        </div>)
                    })
                }

            </div>

            {/* Input form remains static at bottom */}
            <Form
                form={form}
                onFinish={handleCreateNewMessage}
                name="basic"
                wrapperCol={{ span: 24 }}
                autoComplete="off"
                className="p-4 border-t flex w-full items-center gap-2"
            >
                <Form.Item name="file" valuePropName="fileList" getValueFromEvent={(e) => {
                    if (Array.isArray(e)) {
                        return e;
                    }
                    return e?.fileList;
                }}>
                    <Upload beforeUpload={() => false} accept="image/*" maxCount={1}>
                        <Button shape="circle" icon={<IoIosAttach color="#9F9F9F" size={24} />} />
                    </Upload>
                </Form.Item>
                <Form.Item style={{ width: '100%' }} name="message">
                    <Input.Search
                        style={{
                            backgroundColor: '#F5F5F6',
                            borderRadius: '8px',
                            width: '100%',
                        }}
                        variant="borderless"
                        placeholder="Type a message"
                        allowClear
                        enterButton={
                            <Button htmlType='submit' style={{ width: '100%' }} type="primary">
                                {isLoading ? "sending..." : "Send"}
                            </Button>
                        }
                        size="large"
                    />
                </Form.Item>
            </Form>
        </div>
    );
};

export default ChatWindow;