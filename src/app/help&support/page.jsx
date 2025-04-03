"use client"

import React, { useState } from 'react';
import { Collapse } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import CustomBanner from '@/components/CustomBanner';


const page = () => {
    const categories = [
        {
            name: 'General',
            active: true
        },
        {
            name: 'Account Management',
            active: true
        },
        {
            name: 'Posting & Engagement',
            active: false
        },
        {
            name: 'Community Guidelines',
            active: false
        },
        {
            name: 'Technical Support',
            active: false
        }
    ];

    const faqs = [
        {
            key: '1',
            question: 'What is Mehor Forum?',
            answer: 'Mehor Forum is a community platform for apparel designers, enthusiasts, and professionals. It\'s a place to discuss trends, share design ideas, ask questions, and collaborate with others passionate about fashion and apparel.'
        },
        {
            key: '2',
            question: 'How do I get started on Mehor Forum?',
            answer: 'To get started, create an account, set up your profile, and start exploring discussions that interest you. You can join existing conversations or start new ones about topics you`re passionate about.'
        },
        {
            key: '3',
            question: 'How do I update my profile?',
            answer: 'To update your profile, log in to your account, click on your profile picture in the top right corner, and select "Edit Profile" from the dropdown menu. From there, you can update your information, upload a new profile picture, and more.'
        },
        {
            key: '4',
            question: 'How can I reset my password?',
            answer: 'To reset your password, click on the "Forgot Password" link on the login page. Enter the email address associated with your account, and we\'ll send you instructions on how to create a new password.'
        }
    ];

    const [activeCategory, setActiveCategory] = useState('General');

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
    };

    return (
        <div>
            <CustomBanner routeName={"Help & Support"} />
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold mb-2">Any Question? We can help you.</h1>
                        <p className="text-gray-600">Can't find an answer? email with contact Mehor@example.com</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Categories Sidebar */}
                        <div className="md:col-span-1">
                            <ul className="space-y-4">
                                {categories.map((category) => (
                                    <li
                                        key={category.name}
                                        className={`cursor-pointer font-medium ${activeCategory === category.name ? 'text-blue-600' : 'text-gray-700'}`}
                                        onClick={() => handleCategoryClick(category.name)}
                                    >
                                        {category.name}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* FAQs Content */}
                        <div className="md:col-span-3">
                            <Collapse
                                bordered={false}
                                expandIcon={({ isActive }) => isActive ? <MinusOutlined className="text-blue-600" /> : <PlusOutlined className="text-blue-600" />}
                                className="bg-transparent"
                                expandIconPosition="end"
                            >
                                {faqs.map((faq) => (
                                    <Collapse.Panel
                                        key={faq.key}
                                        header={<div className="text-base font-medium">{faq.question}</div>}
                                        className="mb-4 bg-white rounded-md border border-gray-200"
                                    >
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </Collapse.Panel>
                                ))}
                            </Collapse>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default page;