"use client";
import { useGetProfileQuery } from '@/features/profile/profileApi';
import { useTheme } from '@/hooks/useTheme';
import {
  BellOutlined,
  CloseOutlined,
  CommentOutlined,
  LogoutOutlined,
  MenuOutlined,
  MessageOutlined,
  MoonOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  SettingOutlined,
  SunOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Input,
  Layout,
  Menu,
  Space,
  Typography
} from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { baseURL } from '../../utils/BaseURL';
import { Message, Notification } from '../../utils/svgImage';
import { useGetAllNotificationQuery } from '../features/notification/noticationApi';
import { useLogoQuery } from '../features/report/reportApi';
import SocketComponent from './SocketCompo';

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function Navbar() {
  const screens = useBreakpoint();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isLoading: allNotificationLoading, refetch } = useGetAllNotificationQuery({});
  const { notifications } = useSelector((state) => state);

  const { data, isLoading } = useGetProfileQuery();
  const { data: logo } = useLogoQuery();

  // Initialize search query from URL
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      // Remove quotes if they exist in the query
      const cleanQuery = query.replace(/^"|"$/g, '');
      setSearchQuery(cleanQuery);
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  const handleNavigation = (path) => {
    router.push(path);
    setDrawerVisible(false);
  };

  const items = [
    {
      key: 'profile-header',
      label: (
        <Flex gap="small" align="center" className={`p-2 cursor-pointer ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
          <Avatar
            src={data?.data?.profile ? `${baseURL}${data?.data?.profile}` : "/icons/user.png"}
            size={44}
          />
          <Space direction="vertical" size={0}>
            <Text strong>{data?.data?.name || ""}</Text>
            <Text type={data?.data?.name ? undefined : "secondary"}>
              {data?.data?.userName ? `@${data?.data?.userName}` : ""}
            </Text>
          </Space>
        </Flex>
      ),
      onClick: () => handleNavigation("/profile"),
    },
    {
      type: 'divider',
    },
    {
      key: 'about',
      icon: <UserOutlined />,
      label: 'About us',
      onClick: () => handleNavigation('/about'),
      className: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Help & Support',
      onClick: () => handleNavigation('/help&support'),
      className: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
    },
    {
      key: 'feedback',
      icon: <CommentOutlined />,
      label: 'Feedback',
      onClick: () => handleNavigation('/feedback'),
      className: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => handleNavigation('/settings'),
      className: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
    },
    {
      key: 'darkmode',
      icon: isDarkMode ? <SunOutlined /> : <MoonOutlined />,
      label: `${isDarkMode ? "Switch to light mode" : "Switch to dark mode"}`,
      className: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50',
      onClick: toggleTheme,
    },
    {
      type: 'divider',
    },
    {
      key: 'signout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      danger: true,
      onClick: () => {
        handleNavigation('/auth/login');
        localStorage.clear();
      },
      className: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
    },
  ];

  // Function to handle search
  const handleSearch = (value) => {
    const trimmedValue = value?.trim();
    if (trimmedValue) {
      router.push(`/?search=${encodeURIComponent(trimmedValue)}`);
    } else {
      router.push('/');
    }
  };

  // Function to handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value) {
      router.push('/');
    }
  };

  // Function to handle when Enter key is pressed
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  // Function to clear the search input
  const handleClear = () => {
    setSearchQuery('');
    router.push('/');
  };

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    if (!showMobileSearch) {
      setSearchQuery('');
      router.push('/');
    }
  };

  // Apply theme to search fields
  const searchFieldStyles = {
    input: {
      backgroundColor: 'transparent',
      border: 'none',
      padding: '10px 16px',
      boxShadow: 'none',
      height: '100%',
    },
    searchIcon: {
      color: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : '#6b7280',
      fontSize: '16px',
      marginRight: '8px',
    }
  };

  // Apply theme to icon buttons
  const iconButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${isDarkMode ? '#424242' : '#e5e7eb'}`,
    padding: '8px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: isDarkMode ? '#1f1f1f' : '#f9fafb'
  };

  // Desktop search component with theme styling
  const renderDesktopSearch = () => (
    <div style={{
      width: '35%',
      paddingLeft: "100px",
      minWidth: '200px',
    }}>
      <Flex
        align="center"
        style={{
          width: '100%',
          height: '40px',
          backgroundColor: isDarkMode ? '#1f1f1f' : '#f3f2fa',
          borderRadius: '10px',
          border: `1px solid ${isDarkMode ? '#424242' : '#D8D8D8'}`,
          overflow: 'hidden'
        }}
      >
        <Input
          value={searchQuery}
          placeholder="Search topics"
          prefix={<SearchOutlined style={searchFieldStyles.searchIcon} />}
          style={{
            ...searchFieldStyles.input,
            width: '100%',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'inherit',
          }}
          onChange={handleInputChange}
          onPressEnter={handleKeyDown}
          allowClear={{
            clearIcon: <CloseOutlined onClick={handleClear} />
          }}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => handleSearch(searchQuery)}
          style={{
            height: '100%',
            width: '50px',
            borderRadius: '0 10px 10px 0',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </Flex>
    </div>
  );

  // Mobile search component with theme styling
  const renderMobileSearch = () => (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      padding: '0 8px',
    }}>
      <Input
        value={searchQuery}
        placeholder="Search topics"
        prefix={<SearchOutlined style={searchFieldStyles.searchIcon} />}
        style={{
          ...searchFieldStyles.input,
          width: '100%',
          background: isDarkMode ? '#1f1f1f' : '#f3f2fa',
          borderRadius: '10px',
          color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'inherit',
        }}
        autoFocus
        onChange={handleInputChange}
        onPressEnter={handleKeyDown}
        allowClear={{
          clearIcon: <CloseOutlined onClick={handleClear} />
        }}
        suffix={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={toggleMobileSearch}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        }
      />
    </div>
  );

  return (
    <>
      <SocketComponent />
      <Header 
        className="theme-transition"
        style={{
          background: isDarkMode ? 'var(--secondary-bg)' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: screens.xs ? '0 12px' : '0 24px',
          height: '75px',
          boxShadow: isDarkMode ? '0 1px 2px 0 rgba(0, 0, 0, 0.15)' : '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          color: isDarkMode ? 'var(--text-color)' : 'inherit',
          borderBottom: `1px solid ${isDarkMode ? '#333' : 'transparent'}`
        }}
      >
        {/* Left Side - Logo and Menu Button */}
        {!showMobileSearch && (
          <Flex align="center" style={{ height: '100%' }}>
            {!screens.md && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={showDrawer}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  padding: '0 12px',
                  color: isDarkMode ? 'var(--text-color)' : 'inherit'
                }}
              />
            )}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              {logo?.data?.logo && <Image
                src={`${baseURL}${logo?.data?.logo}`}
                width={!screens.md ? 70 : 120}
                height={10}
                alt='logo'
                style={{ 
                  objectFit: 'contain', 
                  height: 'auto',
                  filter: isDarkMode ? 'brightness(0.9) contrast(1.1)' : 'none'
                }}
              />}
            </Link>
          </Flex>
        )}

        {/* Middle - Search Bar */}
        {screens.md ? renderDesktopSearch() : (showMobileSearch && renderMobileSearch())}

        {/* Right Side Actions */}
        {!showMobileSearch && (
          <Flex align="center" gap="middle" style={{ height: '100%' }}>
            {screens.md ? (
              <>
                <Button
                  onClick={() => handleNavigation('/new')}
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '40px'
                  }}
                >
                  {screens.lg ? 'New Post' : ''}
                </Button>

                <Badge style={{ backgroundColor: "#2930FF", marginTop: "5px", marginRight: "5px" }} count={5}>
                  <Button
                    onClick={() => handleNavigation("/chat")}
                    type="text"
                    icon={<Message isDarkMode={isDarkMode} />}
                    style={iconButtonStyles}
                  />
                </Badge>

                <Badge style={{ backgroundColor: "#2930FF", marginTop: "5px", marginRight: "5px" }} count={notifications?.unreadCount}>
                  <Button
                    onClick={() => handleNavigation("/notification")}
                    type="text"
                    icon={<Notification isDarkMode={isDarkMode} />}
                    style={iconButtonStyles}
                  />
                </Badge>
              </>
            ) : (
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={toggleMobileSearch}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  padding: '0 12px',
                  color: isDarkMode ? 'var(--text-color)' : 'inherit'
                }}
              />
            )}

            <Dropdown
              menu={{ items }}
              trigger={['click']}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 8px' }}>
                <Avatar
                  src={data?.data?.profile ? `${baseURL}${data?.data?.profile}` : "/icons/user.png"}
                  size={44}
                  style={{
                    cursor: 'pointer',
                    border: isDarkMode ? '1px solid #333' : 'none'
                  }}
                />
              </div>
            </Dropdown>
          </Flex>
        )}
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="left"
        closable={true}
        onClose={onClose}
        open={drawerVisible}
        width={250}
        className="theme-transition"
      >
        <Menu
          mode="inline"
          theme={isDarkMode ? "dark" : "light"}
          items={[
            {
              key: 'new-post',
              icon: <PlusOutlined />,
              label: 'New Post',
              onClick: () => handleNavigation("/new")
            },
            {
              key: 'messages',
              icon: <MessageOutlined />,
              label: 'Messages',
              onClick: () => handleNavigation('/chat')
            },
            {
              key: 'notifications',
              icon: <BellOutlined />,
              label: 'Notifications',
              onClick: () => handleNavigation('/notification')
            },
            {
              type: 'divider',
            },
            ...items
              .filter(item => item.key !== 'profile-header')
              .map(item => ({
                ...item,
                onClick: item.onClick || (() => {})
              }))
          ]}
        />
      </Drawer>
    </>
  );
}