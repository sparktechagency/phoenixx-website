// pages/feedback.js
"use client"
import React from 'react';
import { Form, Input, Button, Card } from 'antd';
import CustomBanner from '@/components/CustomBanner';

const { TextArea } = Input;

export default function FeedBack() {
  const [form] = Form?.useForm();

  const onFinish = (values) => {
    console.log('Feedback submitted:', values);
    // Here you would typically send the data to your API
    form.resetFields();
  };

  return (
    <div>
        <CustomBanner routeName={"Feedback"} /> 
        <div className="flex justify-center items-center p-4">
      <Card className="w-full max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-800">We Value Your Feedback!</h1>
          <p className="text-gray-600 mt-2">
            Your opinion helps us make Mehor Forum better. Share your thoughts and suggestions to help us improve the
            platform and serve you better. We'd love to hear about your experience on the forum. Whether you have
            suggestions, ideas, or anything you think we could improve, please let us know!
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label={<span className="text-gray-700 font-medium">What did you like about Mehor Forum?</span>}
            name="likes"
            rules={[
              { 
                required: true, 
                message: 'Please share what you liked about the forum' 
              },
              {
                max: 500,
                message: 'Feedback cannot exceed 500 characters'
              }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Share your feedback here!" 
              className="rounded-md"
              showCount 
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700 font-medium">What can we improve?</span>}
            name="improvements"
            rules={[
              { 
                required: true, 
                message: 'Please share your suggestions for improvement' 
              },
              {
                max: 500,
                message: 'Feedback cannot exceed 500 characters'
              }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Your feedback is crucial in helping us enhance the platform. Let us know if there's anything we can do to make your experience better!" 
              className="rounded-md"
              showCount 
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700 font-medium">Any new features you'd like to see?</span>}
            name="newFeatures"
            rules={[
              {
                max: 300,
                message: 'Suggestion cannot exceed 300 characters'
              }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Is there a feature you'd like us to add to make the forum more useful for you?" 
              className="rounded-md"
              showCount 
              maxLength={300}
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700 font-medium">Additional Comments</span>}
            name="additionalComments"
            rules={[
              {
                max: 300,
                message: 'Comments cannot exceed 300 characters'
              }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Is there anything else you'd like to share with us?" 
              className="rounded-md"
              showCount 
              maxLength={300}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              className="bg-blue-600 hover:bg-blue-700 w-full h-10 rounded-md"
            >
              Submit Your Feedback
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
    </div>
  );
}