import React from 'react';
import { Form, Input, Button, notification } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useChangePasswordMutation } from '@/features/auth/authApi';

const ChangePasswordForm = () => {
  const [form] = Form.useForm();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const onFinish = async (values) => {
    try {
      const response = await changePassword(values).unwrap();
      // Show success notification
      // notification.success({
      //   message: 'Success',
      //   description: 'Password changed successfully!',
      //   placement: 'topRight',
      // });

      alert("successfully change password")
      form.resetFields(); // Reset form after successful submission
    } catch (error) {
      // Show error notification
      notification.error({
        message: 'Error',
        description: error?.data?.message || 'Failed to change password. Please try again.',
        placement: 'topRight',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true, message: 'Please input your Current password!' }]}
        >
          <Input.Password
            placeholder="••••••••••"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            className="h-12"
          />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, message: 'Please input your new password!' }]}
        >
          <Input.Password
            placeholder="••••••••••"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            className="h-12"
          />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="••••••••••"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            className="h-12"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-medium"
            loading={isLoading}
            disabled={isLoading}
          >
            Update
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChangePasswordForm;