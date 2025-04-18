"use client"

import React, { useState, useEffect } from 'react';
import { Collapse } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import CustomBanner from '@/components/CustomBanner';
import { useGetfaqCategoryQuery, useGetfaqQuery } from '@/features/faqs/faqsApi';

const FaqPage = () => {
    // Fetch data from API
    const { data: faqData, isLoading: faqLoading } = useGetfaqQuery();
    const { data: faqCategoryData, isLoading: categoryLoading } = useGetfaqCategoryQuery();

    // Extract categories and faqs from API response
    const categories = faqCategoryData?.data || [];
    const faqs = faqData?.data?.data || [];

    // Set initial active category (use first category from API or "All" if none)
    const [activeCategory, setActiveCategory] = useState(null);

    // Initialize active category once data is loaded
    useEffect(() => {
        if (categories && categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0]._id);
        }
    }, [categories, activeCategory]);

    // Filter FAQs based on active category
    const filteredFaqs = activeCategory
        ? faqs.filter(faq => faq.category === activeCategory)
        : faqs;

    // Handle category click
    const handleCategoryClick = (categoryId) => {
        setActiveCategory(categoryId);
    };

    // Show loading state while data is being fetched
    if (faqLoading || categoryLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading FAQ data...</p>
                </div>
            </div>
        );
    }

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
                            {/* <h3 className="font-semibold mb-4">Categories</h3> */}
                            <ul className="space-y-4">
                                {categories.map((category) => (
                                    <li
                                        key={category._id}
                                        className={`cursor-pointer font-medium ${
                                            activeCategory === category._id ? 'text-blue-600' : 'text-gray-700'
                                        }`}
                                        onClick={() => handleCategoryClick(category._id)}
                                    >
                                        {category.name}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* FAQs Content */}
                        <div className="md:col-span-3">
                            {filteredFaqs.length > 0 ? (
                                <Collapse
                                    bordered={false}
                                    expandIcon={({ isActive }) => 
                                        isActive ? 
                                            <MinusOutlined className="text-blue-600" /> : 
                                            <PlusOutlined className="text-blue-600" />
                                    }
                                    className="bg-transparent"
                                    expandIconPosition="end"
                                >
                                    {filteredFaqs.map((faq) => (
                                        <Collapse.Panel
                                            key={faq._id}
                                            header={<div className="text-base font-medium">{faq.question}</div>}
                                            className="mb-4 bg-white rounded-md border border-gray-200"
                                        >
                                            <p className="text-gray-600">{faq.answer}</p>
                                        </Collapse.Panel>
                                    ))}
                                </Collapse>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No FAQs found in this category.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaqPage;