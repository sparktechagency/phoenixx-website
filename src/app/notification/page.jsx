"use client";

import { useState, useEffect } from 'react';
import { Layout, List, Badge, Tabs, Button, Avatar, Dropdown, Menu, Spin, Pagination } from 'antd';
import {
  BellOutlined,
  MessageOutlined,
  CheckOutlined,
  DeleteOutlined,
  MoreOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useDeleteAllMutation, useDeleteSingleMutation, useGetAllNotificationQuery, useMarkAllAsReadMutation, useMarkSingleReadMutation } from '@/features/notification/noticationApi';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';


const { Content } = Layout;

// Custom loading icon
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

export default function NotificationPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch notifications data with pagination
  const { data, isLoading: allNotificationLoading, refetch } = useGetAllNotificationQuery({
    page: currentPage
  });

  const { notifications } = useSelector((state) => state);

  // Total pages from meta data
  const total = notifications?.notification?.meta?.total || 1;
  const limit = notifications?.notification?.meta?.limit || 1

  // Reset to page 1 when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refetch();
  };

  // API mutations
  const [markSingleAsRead, { isLoading: markReadLoading }] = useMarkSingleReadMutation();
  const [markAllAsRead, { isLoading: allmarkLoading }] = useMarkAllAsReadMutation();
  const [deleteSingle, { isLoading: singleDeleteLoading }] = useDeleteSingleMutation();
  const [deleteAll, { isLoading: deleteAllLoading }] = useDeleteAllMutation();

  // Track which notification is being processed
  const [processingNotificationId, setProcessingNotificationId] = useState(null);

  const handleMarkAsRead = async (id) => {
    try {
      setProcessingNotificationId(id);
      await markSingleAsRead(id).unwrap();
      toast.success("Marked notification as read");
      refetch();
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error("Failed to mark notification as read");
    } finally {
      setProcessingNotificationId(null);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      setProcessingNotificationId(id);
      await deleteSingle(id).unwrap();
      toast.success("Deleted notification");
      refetch();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error("Failed to delete notification");
    } finally {
      setProcessingNotificationId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("Marked all notifications as read");
      refetch();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleClearAll = async () => {
    try {
      await deleteAll().unwrap();
      toast.success("Deleted all notifications");
      refetch();
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      toast.error("Failed to clear all notifications");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageOutlined className="text-blue-500" />;
      case 'system':
        return <BellOutlined className="text-green-500" />;
      case 'alert':
        return <BellOutlined className="text-red-500" />;
      case 'info':
        return <InfoCircleOutlined className="text-blue-500" />;
      default:
        return <BellOutlined />;
    }
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const menu = (id, read) => (
    <Menu>
      {!read && (
        <Menu.Item
          key="mark-read"
          icon={<CheckOutlined />}
          onClick={() => handleMarkAsRead(id)}
          disabled={processingNotificationId === id}
        >
          Mark as read
        </Menu.Item>
      )}
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleDeleteNotification(id)}
        danger
        disabled={processingNotificationId === id}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  // Transform the notification data to match the expected format
  const transformedNotifications = notifications?.notification?.data?.map(notification => ({
    id: notification._id,
    title: notification.type.charAt(0).toUpperCase() + notification.type.slice(1),
    description: notification.message,
    read: notification.read,
    type: notification.type,
    time: formatNotificationTime(notification.createdAt)
  })) || [];

  const filteredNotifications = activeTab === 'unread'
    ? transformedNotifications.filter(item => !item.read)
    : transformedNotifications;

  const unreadCount = transformedNotifications.filter(item => !item.read).length;

  // Define tab items using the new API
  const tabItems = [
    {
      key: 'all',
      label: (
        <span className="flex items-center">
          All
          <Badge
            count={unreadCount}
            className="ml-1"
            size="small"
          />
        </span>
      ),
      children: (
        <>
          <List
            itemLayout="horizontal"
            dataSource={filteredNotifications}
            renderItem={(item) => (
              <List.Item
                className={`px-4 py-3 hover:bg-gray-50 transition-colors ${!item.read ? 'bg-blue-50' : ''}`}
                actions={[
                  <Dropdown
                    key="dropdown"
                    overlay={menu(item.id, item.read)}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      icon={processingNotificationId === item.id ? <LoadingOutlined /> : <MoreOutlined />}
                      size="small"
                      className="opacity-70 hover:opacity-100"
                      disabled={processingNotificationId === item.id}
                    />
                  </Dropdown>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getNotificationIcon(item.type)}
                      size="default"
                      className="flex items-center justify-center"
                    />
                  }
                  title={
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className={!item.read ? 'font-semibold' : ''}>
                        {item.title}
                      </span>
                      <span className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-0">
                        {item.time}
                      </span>
                    </div>
                  }
                  description={
                    <span className="text-gray-600 text-sm">
                      {item.description}
                    </span>
                  }
                />
              </List.Item>
            )}
          />

        </>
      )
    },
    {
      key: 'unread',
      label: (
        <span className="flex items-center">
          Unread
          <Badge
            count={unreadCount}
            className="ml-1"
            size="small"
          />
        </span>
      ),
      children: (
        <>
          <List
            itemLayout="horizontal"
            dataSource={filteredNotifications}
            renderItem={(item) => (
              <List.Item
                className="px-4 py-3 hover:bg-gray-50 transition-colors bg-blue-50"
                actions={[
                  <Dropdown
                    key="dropdown"
                    overlay={menu(item.id, item.read)}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      icon={processingNotificationId === item.id ? <LoadingOutlined /> : <MoreOutlined />}
                      size="small"
                      className="opacity-70 hover:opacity-100"
                      disabled={processingNotificationId === item.id}
                    />
                  </Dropdown>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getNotificationIcon(item.type)}
                      size="default"
                      className="flex items-center justify-center"
                    />
                  }
                  title={
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-semibold">{item.title}</span>
                      <span className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-0">
                        {item.time}
                      </span>
                    </div>
                  }
                  description={
                    <span className="text-gray-600 text-sm">
                      {item.description}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        </>
      )
    }
  ];

  return (
    <>
      <Layout className="min-h-screen bg-gray-50 md:p-6 p-0">
        <Content className="p-2 md:p-2 lg:w-8/12 w-full mx-auto">
          <div className="bg-white p-2 md:p-2 rounded-lg shadow-sm overflow-hidden">
            {/* Header with actions */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-lg sm:text-xl font-semibold">Notifications</h1>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  icon={allmarkLoading ? <LoadingOutlined /> : <CheckOutlined />}
                  onClick={handleMarkAllAsRead}
                  className="text-gray-600 flex-1 sm:flex-none"
                  size="small"
                  disabled={unreadCount === 0 || allmarkLoading}
                  loading={allmarkLoading}
                >
                  <span className="hidden sm:inline">Mark all as read</span>
                  <span className="sm:hidden">Mark all</span>
                </Button>
                <Button
                  icon={deleteAllLoading ? <LoadingOutlined /> : <DeleteOutlined />}
                  onClick={handleClearAll}
                  danger
                  size="small"
                  className="flex-1 sm:flex-none"
                  disabled={transformedNotifications.length === 0 || deleteAllLoading}
                  loading={deleteAllLoading}
                >
                  <span className="hidden sm:inline">Clear all</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </div>
            </div>

            {/* Tabs using the items prop instead of TabPane children */}
            <Tabs
              defaultActiveKey="all"
              className="px-4"
              tabBarStyle={{ marginBottom: 0 }}
              size="small"
              onChange={(key) => setActiveTab(key)}
              items={tabItems}
            />

            {/* Loading state */}
            {allNotificationLoading && (
              <div className="p-8 text-center">
                <Spin indicator={antIcon} />
                <p className="mt-2 text-gray-500">Loading notifications...</p>
              </div>
            )}

            {/* Empty state */}
            {!allNotificationLoading && filteredNotifications.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg pl-2">No notifications</p>
              </div>
            )}
          </div>
        </Content>
      </Layout>

      <div className='flex justify-center pb-10'>
        <Pagination
          current={currentPage}
          pageSize={limit}
          total={total}
          onChange={handlePageChange}
          className="mb-4"
        />
      </div>
    </>
  );
}