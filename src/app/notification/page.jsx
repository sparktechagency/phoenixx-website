"use client";

import { useState } from 'react';
import { Layout, List, Badge, Tabs, Button, Avatar, Dropdown, Menu } from 'antd';
import {
  BellOutlined,
  MessageOutlined,
  CheckOutlined,
  DeleteOutlined,
  MoreOutlined,
} from '@ant-design/icons';

const { Content } = Layout;
const { TabPane } = Tabs;

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New message from John',
      description: 'Hey, can we schedule a meeting for tomorrow?',
      time: '10 min ago',
      read: false,
      type: 'message',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
      id: '2',
      title: 'System update',
      description: 'A new version of the app is available',
      time: '2 hours ago',
      read: false,
      type: 'system',
    },
    {
      id: '3',
      title: 'Payment received',
      description: 'Your invoice #12345 has been paid',
      time: '1 day ago',
      read: true,
      type: 'alert',
    },
    {
      id: '4',
      title: 'New follower',
      description: 'Sarah started following you',
      time: '2 days ago',
      read: true,
      type: 'message',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
  ]);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((item) => item.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((item) => ({ ...item, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageOutlined className="text-blue-500" />;
      case 'system':
        return <BellOutlined className="text-green-500" />;
      case 'alert':
        return <BellOutlined className="text-red-500" />;
      default:
        return <BellOutlined />;
    }
  };

  const menu = (id) => (
    <Menu>
      <Menu.Item
        icon={<CheckOutlined />}
        onClick={() => markAsRead(id)}
      >
        Mark as read
      </Menu.Item>
      <Menu.Item
        icon={<DeleteOutlined />}
        onClick={() => deleteNotification(id)}
        danger
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-2 md:p-2">
        <div className="bg-white p-2 md:p-2 rounded-lg shadow-sm overflow-hidden">
          {/* Header with actions */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-lg sm:text-xl font-semibold">Notifications</h1>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                icon={<CheckOutlined />}
                onClick={markAllAsRead}
                className="text-gray-600 flex-1 sm:flex-none"
                size="small"
              >
                <span className="hidden sm:inline">Mark all as read</span>
                <span className="sm:hidden">Mark all</span>
              </Button>
              <Button
                icon={<DeleteOutlined />}
                onClick={clearAll}
                danger
                size="small"
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Clear all</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs 
            defaultActiveKey="all"
            className="px-4"
            tabBarStyle={{ marginBottom: 0 }}
            size="small"
          >
            <TabPane
              tab={
                <span className="flex items-center">
                  All
                  <Badge
                    count={notifications.filter((n) => !n.read).length}
                    className="ml-1"
                    size="small"
                  />
                </span>
              }
              key="all"
            >
              <List
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={(item) => (
                  <List.Item
                    className={`px-4  py-3 hover:bg-gray-50 transition-colors ${
                      !item.read ? 'bg-blue-50' : ''
                    }`}
                    actions={[
                      <Dropdown
                        overlay={menu(item.id)}
                        trigger={['click']}
                        placement="bottomRight"
                        key="actions"
                      >
                        <Button
                          type="text"
                          icon={<MoreOutlined />}
                          size="small"
                          className="opacity-70 hover:opacity-100"
                        />
                      </Dropdown>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        item.avatar ? (
                          <Avatar src={item.avatar} size="default" />
                        ) : (
                          <Avatar 
                            icon={getNotificationIcon(item.type)} 
                            size="default"
                            className="flex items-center justify-center"
                          />
                        )
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
            </TabPane>
            <TabPane
              tab={
                <span className="flex items-center">
                  Unread
                  <Badge
                    count={notifications.filter((n) => !n.read).length}
                    className="ml-1"
                    size="small"
                  />
                </span>
              }
              key="unread"
            >
              <List
                itemLayout="horizontal"
                dataSource={notifications.filter((item) => !item.read)}
                renderItem={(item) => (
                  <List.Item
                    className="px-4 py-3 hover:bg-gray-50 transition-colors bg-blue-50"
                    actions={[
                      <Dropdown
                        overlay={menu(item.id)}
                        trigger={['click']}
                        placement="bottomRight"
                        key="actions"
                      >
                        <Button
                          type="text"
                          icon={<MoreOutlined />}
                          size="small"
                          className="opacity-70 hover:opacity-100"
                        />
                      </Dropdown>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        item.avatar ? (
                          <Avatar src={item.avatar} size="default" />
                        ) : (
                          <Avatar 
                            icon={getNotificationIcon(item.type)} 
                            size="default"
                            className="flex items-center justify-center"
                          />
                        )
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
            </TabPane>
          </Tabs>

          {/* Empty state */}
          {notifications.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <BellOutlined className="text-3xl mb-2" />
              <p className="text-lg">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
}