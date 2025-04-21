"use client";
import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import BlogPostForm from '@/app/new/page';

const EditPostModal = ({ visible, onClose, postData }) => {
  const [initialData, setInitialData] = useState(null);


  useEffect(() => {
    if (visible && postData) {
      const formattedData = {
        title: postData.title || '',
        category: postData.category?._id || postData.category || null,
        subcategory: postData.subCategory?._id || postData.subCategory || null,
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