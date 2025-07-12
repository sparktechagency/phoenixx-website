"use client";
import BlogPostForm from '@/app/new/page';
import { Modal } from 'antd';
import { useEffect } from 'react';

const EditPostModal = ({ visible, onClose, postData, refetchPosts , myCommentPostRefetch }) => {
  // Disable body scroll when modal is open
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  const handleUpdateSuccess = () => {
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      title="Edit Post"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={900}
      destroyOnClose={true}
      centered
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: '0px',
          // Custom scrollbar styles
          scrollbarWidth: 'thin',
          scrollbarColor: '#888 #f1f1f1',
        },
        mask: {
          backdropFilter: 'blur(2px)',
        }
      }}
      style={{
        top: 20,
      }}
      maskClosable={false}
    >
      <style jsx global>{`
        /* Webkit browsers (Chrome, Safari, Edge) */
        .ant-modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .ant-modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .ant-modal-body::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
          transition: background 0.2s ease;
        }

        .ant-modal-body::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Ensure modal content doesn't cause horizontal scroll */
        .ant-modal-body {
          overflow-x: hidden;
        }
      `}</style>

      {postData && (
        <BlogPostForm
          initialValues={postData}
          isEditing={true}
          onSuccess={handleUpdateSuccess}
          postId={postData?.id || postData?._id}
          refetchPosts={refetchPosts}
          myCommentPostRefetch={myCommentPostRefetch}
        />
      )}
    </Modal>
  );
};

export default EditPostModal;