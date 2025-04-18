import { useState, useEffect } from 'react';
import { Modal, Radio, Input, Form, Button, Alert } from 'antd';
import { ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useReportMutation } from '@/features/report/reportApi';

const { TextArea } = Input;

const ReportPostModal = ({ isOpen, onClose, postId }) => {
  const [form] = Form.useForm();
  const [selectedReason, setSelectedReason] = useState('');
  const [report, { isLoading }] = useReportMutation();
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && postId) {
      form.setFieldsValue({
        reportedUrl: `/posts/${postId}`,
      });
      // Reset success states when modal opens
      setSuccessMessage('');
      setIsSuccess(false);
    }
  }, [isOpen, postId, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const reason = {
        reason: values.reportReason,
        description: values.message,
        postId: postId
      };

      const response = await report(reason).unwrap();
      
      // Set success states
      setSuccessMessage(response?.message || 'Report Send successfully!');
      setIsSuccess(true);
      
      // Reset form
      form.resetFields();
      
      // Close modal after 3 seconds to give user time to read message
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error) {
      setSuccessMessage('Failed to submit report. Please try again later.');
      setIsSuccess(false);
      console.error('Report submission failed:', error);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setSuccessMessage('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <ExclamationCircleOutlined className="text-red-500 text-2xl" />
          <span className="text-2xl font-bold text-gray-800">Report Content</span>
        </div>
      }
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={650}
      destroyOnClose
      centered
      className="report-modal"
    >
      {/* Success/Error message inside the modal */}
      {successMessage && (
        <Alert
          message={successMessage}
          type={isSuccess ? 'success' : 'error'}
          showIcon
          className="mb-4"
        />
      )}

      {!isSuccess && (
        <>
          <div className="mb-6 text-gray-600 leading-6">
            <Alert
              message={
                <span className="text-sm">
                  Help us maintain a safe community by reporting content that violates our{' '}
                  <a href="#" className="text-blue-600 hover:underline font-medium">Community Guidelines</a>.
                  All reports are confidential.
                </span>
              }
              type="info"
              showIcon
              icon={<InfoCircleOutlined className="text-blue-500" />}
              className="mb-4"
            />
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              reportReason: '',
              message: ''
            }}
          >
            <Form.Item
              name="reportReason"
              label={<span className="font-medium text-gray-700">Reason for reporting</span>}
              rules={[{ required: true, message: 'Please select a reason for reporting' }]}
            >
              <Radio.Group 
                className="flex flex-col gap-4"
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                <Radio value="rude" className="block">
                  <span className="font-medium">Rude or vulgar content</span>
                </Radio>
                <Radio value="harassment" className="block">
                  <span className="font-medium">Harassment or hate speech</span>
                </Radio>
                <Radio value="spam" className="block">
                  <span className="font-medium">Spam or copyright issue</span>
                </Radio>
                <Radio value="inappropriate" className="block">
                  <span className="font-medium">Inappropriate content</span>
                </Radio>
                <Radio value="other" className="block">
                  <span className="font-medium">Other issue</span>
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label={<span className="font-medium text-gray-700">Additional details</span>}
              name="message"
              extra={
                <span className="text-gray-500 text-sm">
                  Please provide specific details to help us investigate.
                </span>
              }
            >
              <TextArea
                rows={5}
                placeholder="Describe the issue in detail..."
                className="border-gray-300 hover:border-blue-400 focus:border-blue-500"
                showCount
                maxLength={500}
              />
            </Form.Item>

            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={handleClose} className="px-6 h-10">
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={isLoading}
                className="px-6 h-10 bg-blue-600 hover:bg-blue-700 font-medium"
              >
                Submit Report
              </Button>
            </div>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default ReportPostModal;