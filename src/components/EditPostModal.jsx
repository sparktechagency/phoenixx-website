// EditPostModal.jsx
"use client";
import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import BlogPostForm from '@/app/new/page';


const EditPostModal = ({ visible, onClose, postData }) => {
  // Initialize form data from postData
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (visible && postData) {
      // Transform postData into the format expected by BlogPostForm
      // This mapping depends on your exact data structure
      const formattedData = {
        title: postData.title || '',
        category: postData.category || null,
        subcategory: postData.subcategory || null,
        description: postData.content || '',
        fileList: postData.image ? [{
          uid: '-1',
          name: 'post-image.jpg',
          status: 'done',
          url: postData.image,
        }] : []
      };
      
      setInitialData(formattedData);
    }
  }, [visible, postData]);

  const handleUpdateSuccess = () => {
    // Handle successful update
    onClose();
  };

  return (
    <Modal
      title="Edit Post"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose={true}
      centered
    >
      {initialData && (
        <BlogPostForm 
          initialValues={initialData}
          isEditing={true}
          onSuccess={handleUpdateSuccess}
          postId={postData?.id || postData?._id}
        />
      )}
    </Modal>
  );
};

export default EditPostModal;