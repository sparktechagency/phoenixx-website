"use client";

import { useDeleteAllMutation, useDeleteSingleMutation, useGetAllNotificationQuery, useMarkAllAsReadMutation, useMarkSingleReadMutation } from '@/features/notification/noticationApi';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  MessageOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Dropdown, Layout, List, Menu, Pagination, Spin, Tabs } from 'antd';
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { ThemeContext } from '../ClientLayout';


const { Content } = Layout;

// Custom loading icon
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

export default function NotificationPage() {
  useAuth();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { isDarkMode } = useContext(ThemeContext);

  // Fetch notifications data with pagination
  const { isLoading: allNotificationLoading, refetch } = useGetAllNotificationQuery({
    page: currentPage
  }, {
    refetchOnMountOrArgChange: true
  });

  const { notifications } = useSelector((state) => state);

  // Total pages from meta data
  const total = notifications?.meta?.total || 0;
  const limit = notifications?.meta?.limit || 10;

  // Reset to page 1 when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleClearAll = async () => {
    try {
      await deleteAll().unwrap();
      toast.success("Deleted all notifications");
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      toast.error("Failed to clear all notifications");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageOutlined className={isDarkMode ? "text-blue-400" : "text-blue-500"} />;
      case 'system':
        return <BellOutlined className={isDarkMode ? "text-green-400" : "text-green-500"} />;
      case 'alert':
        return <BellOutlined className={isDarkMode ? "text-red-400" : "text-red-500"} />;
      case 'info':
        return <InfoCircleOutlined className={isDarkMode ? "text-blue-400" : "text-blue-500"} />;
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
    <Menu
      className={isDarkMode ? "bg-gray-800 text-gray-200" : ""}
    >
      {!read && (
        <Menu.Item
          key="mark-read"
          icon={<CheckOutlined />}
          onClick={() => handleMarkAsRead(id)}
          disabled={processingNotificationId === id}
          className={isDarkMode ? "hover:bg-gray-700" : ""}
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
        className={isDarkMode ? "hover:bg-gray-700 text-red-400" : ""}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  // Get API notifications
  const apiNotifications = notifications?.notification || [];

  // Transform the notification data to match the expected format
  const transformedNotifications = apiNotifications?.map(notification => ({
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

  // Define dynamic classes based on dark mode
  const layoutClass = isDarkMode ? "bg-gray-900" : "bg-gray-50";
  const contentClass = isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white";
  const borderClass = isDarkMode ? "border-gray-700" : "border-gray-200";
  const textClass = isDarkMode ? "text-gray-200" : "text-gray-600";
  const textHeaderClass = isDarkMode ? "text-gray-100" : "text-gray-800";
  const textMutedClass = isDarkMode ? "text-gray-400" : "text-gray-500";
  const itemHoverBgClass = isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";
  const unreadBgClass = isDarkMode ? "bg-gray-700" : "bg-blue-50";

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
                className={`px-4  py-3 ${itemHoverBgClass} transition-colors ${!item.read ? unreadBgClass : ''}`}
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
                      className={`opacity-70 hover:opacity-100 ${isDarkMode ? "text-gray-300" : ""}`}
                      disabled={processingNotificationId === item.id}
                    />
                  </Dropdown>
                ]}
              >
                <List.Item.Meta
                  style={{marginLeft: '10px'}}
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
                      <span className={`${textMutedClass} text-xs sm:text-sm  sm:mt-0`}>
                        {item.time}
                      </span>
                    </div>
                  }
                  description={
                    <span className={`${textClass} text-sm`}>
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
                className={`px-4 py-3 ${itemHoverBgClass} transition-colors ${unreadBgClass}`}
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
                      className={`opacity-70 hover:opacity-100 ${isDarkMode ? "text-gray-300" : ""}`}
                      disabled={processingNotificationId === item.id}
                    />
                  </Dropdown>
                ]}
              >
                <List.Item.Meta
                  style={{marginLeft: '10px'}}
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
                      <span className={`${textMutedClass} text-xs sm:text-sm mt-1 sm:mt-0`}>
                        {item.time}
                      </span>
                    </div>
                  }
                  description={
                    <span className={`${textClass} text-sm`}>
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
      <Layout className={`min-h-screen ${layoutClass} md:p-6 p-0`}>
        <Content className=" p-2 md:p-2 lg:w-8/12 w-full mx-auto">
          <div className={`${contentClass} p-2 md:p-2 rounded-lg shadow-sm overflow-hidden`}>
            {/* Header with actions */}
            <div className={`p-4 border-b ${borderClass} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
              <h1 className={`text-lg sm:text-xl font-semibold ${textHeaderClass}`}>Notifications</h1>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  icon={allmarkLoading ? <LoadingOutlined /> : <CheckOutlined />}
                  onClick={handleMarkAllAsRead}
                  className={`${isDarkMode ? "text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600" : "text-gray-600"} flex-1 sm:flex-none`}
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
                  className={`flex-1 sm:flex-none ${isDarkMode ? "bg-red-900/70 border-red-800 hover:bg-red-800" : ""}`}
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
              className={`px-4 ${isDarkMode ? "ant-tabs-dark" : ""}`}
              tabBarStyle={{ marginBottom: 0 }}
              size="small"
              onChange={(key) => setActiveTab(key)}
              items={tabItems}
            />

            {/* Loading state */}
            {allNotificationLoading && (
              <div className="p-8 text-center">
                <Spin indicator={antIcon} />
                <p className={`mt-2 ${textMutedClass}`}>Loading notifications...</p>
              </div>
            )}

            {/* Empty state */}
            {!allNotificationLoading && filteredNotifications.length === 0 && (
              <div className="p-8 text-center">
                <p className={`text-lg pl-2 ${textMutedClass}`}>No notifications</p>
              </div>
            )}
          </div>
        </Content>
      </Layout>

      <div className={`flex justify-center pb-10 ${layoutClass}`}>
        {total > limit && (
          <Pagination
            current={currentPage}
            pageSize={limit}
            total={total}
            onChange={handlePageChange}
            className={`mb-4 ${isDarkMode ? "pagination-dark" : ""}`}
          />
        )}
      </div>

      {/* Add this CSS to style ant-design components in dark mode */}
      {isDarkMode && (
        <style jsx global>{`
          .ant-tabs-dark .ant-tabs-nav {
            color: #e5e7eb;
          }
          .ant-tabs-dark .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #60a5fa;
          }
          .ant-tabs-dark .ant-tabs-ink-bar {
            background: #60a5fa;
          }
          .pagination-dark .ant-pagination-item a {
            color: #e5e7eb;
          }
          .pagination-dark .ant-pagination-item-active {
            background-color: #374151;
            border-color: #4b5563;
          }
          .pagination-dark .ant-pagination-item-active a {
            color: #fff;
          }
          .pagination-dark .ant-pagination-prev button,
          .pagination-dark .ant-pagination-next button {
            color: #e5e7eb;
          }
        `}</style>
      )}
    </>
  );
}
