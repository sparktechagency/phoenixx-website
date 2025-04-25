"use client";
import {
  Layout,
  Input,
  Button,
  Dropdown,
  Avatar,
  Badge,
  Flex,
  Space,
  Typography,
  Grid,
  Drawer,
  Menu
} from 'antd';
import {
  PlusOutlined,
  BellOutlined,
  MessageOutlined,
  SearchOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  CommentOutlined,
  SettingOutlined,
  MoonOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Message, Notification } from '../../utils/svgImage';
import { useGetProfileQuery } from '@/features/profile/profileApi';
import { baseURL } from '../../utils/BaseURL';
import SocketComponent from './SocketCompo';

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function Navbar() {
  const screens = useBreakpoint();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data, isLoading } = useGetProfileQuery();

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
        <Flex gap="small" align="center" className="p-2 cursor-pointer hover:bg-gray-50">
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
      className: 'hover:bg-gray-50'
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Help & Support',
      onClick: () => handleNavigation('/help&support'),
      className: 'hover:bg-gray-50'
    },
    {
      key: 'feedback',
      icon: <CommentOutlined />,
      label: 'Feedback',
      onClick: () => handleNavigation('/feedback'),
      className: 'hover:bg-gray-50'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => handleNavigation('/settings'),
      className: 'hover:bg-gray-50'
    },
    {
      key: 'darkmode',
      icon: <MoonOutlined />,
      label: 'Switch to Dark Mode',
      className: 'hover:bg-gray-50'
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
      className: 'hover:bg-gray-50'
    },
  ];

  // Function to handle search
  const handleSearch = (value) => {
    const trimmedValue = value?.trim();
    if (trimmedValue) {
      // Update URL with search parameter
      router.push(`/?search=${encodeURIComponent(trimmedValue)}`);
    } else {
      // If search is empty, remove the search parameter
      router.push('/');
    }
  };

  // Function to handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Update the search query state
    setSearchQuery(value);

    // When input is cleared, remove the search parameter
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
    // Remove search parameter from URL
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

  const searchFieldStyles = {
    input: {
      backgroundColor: 'transparent',
      border: 'none',
      padding: '10px 16px',
      boxShadow: 'none',
      height: '100%',
    },
    searchIcon: {
      color: '#6b7280',
      fontSize: '16px',
      marginRight: '8px',
    }
  };

  const iconButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e5e7eb',
    padding: '8px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f9fafb'
  };

  // Desktop search component
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
          backgroundColor: '#f3f2fa',
          borderRadius: '10px',
          border: '1px solid #D8D8D8',
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

  // Mobile search component
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
          background: '#f3f2fa',
          borderRadius: '10px'
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
      <Header style={{
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: screens.xs ? '0 12px' : '0 24px',
        height: '75px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
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
                  padding: '0 12px'
                }}
              />
            )}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Image
                src={'/images/logo.png'}
                width={!screens.md ? 70 : 178}
                height={10}
                alt='logo'
                style={{ objectFit: 'contain', height: 'auto' }}
              />
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
                    icon={<Message />}
                    style={iconButtonStyles}
                  />
                </Badge>

                <Badge style={{ backgroundColor: "#2930FF", marginTop: "5px", marginRight: "5px" }} count={3}>
                  <Button
                    onClick={() => handleNavigation("/notification")}
                    type="text"
                    icon={<Notification />}
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
                  padding: '0 12px'
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
      >
        <Menu
          mode="inline"
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
                onClick: item.onClick || (() => { })
              }))
          ]}
        />
      </Drawer>
    </>
  );
}