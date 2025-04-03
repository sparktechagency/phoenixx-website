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
  FileTextOutlined,
  LockOutlined,
  CommentOutlined,
  SettingOutlined,
  MoonOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const { Header } = Layout;
const { Search } = Input;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function Navbar() {
  const screens = useBreakpoint();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const router = useRouter();

  const items = [
    {
      key: 'profile-header',
      label: (
        <Flex gap="small" align="center" className="p-2 cursor-pointer">
          <Avatar size={40} src="/images/profile.jpg" />
          <Space direction="vertical" size={0}>
            <Text strong>George Clooney</Text>
            <Text type="secondary">@george_clooney</Text>
          </Space>
        </Flex>
      ),
      onClick: () => router.push("/profile"),
    },
    {
      type: 'divider',
    },
    {
      key: 'about',
      icon: <UserOutlined />,
      label: 'About us',
      onClick: () => router.push('/about')
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Help & Support',
      onClick: () => router.push('/help&support')
    },
    {
      key: 'terms',
      icon: <FileTextOutlined />,
      label: 'Terms & Conditions',
      onClick: () => router.push('/terms-conditions')
    },
    {
      key: 'privacy',
      icon: <LockOutlined />,
      label: 'Privacy Policy',
      onClick: () => router.push('/privacy-policy')
    },
    {
      key: 'feedback',
      icon: <CommentOutlined />,
      label: 'Feedback',
      onClick: () => router.push('/feedback')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => router.push('/settings')
    },
    {
      key: 'darkmode',
      icon: <MoonOutlined />,
      label: 'Switch to Dark Mode',
    },
    {
      type: 'divider',
    },
    {
      key: 'signout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      danger: true,
      onClick: () => router.push('/auth/login')
    },
  ];

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
  };

  return (
    <>
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
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            )}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Image src={'/images/logo.png'} width={!screens.md ? 70 : 178 } height={10} alt='...' />
            </Link>
          </Flex>
        )}
        
        {/* Middle - Search Bar */}
        {screens.md ? (
          <div style={{ 
            width: '40%', 
            minWidth: '200px',
            display: 'flex',
            alignItems: 'center',
            height: '100%'
          }}>
            <Search
              placeholder="Search topics"
              prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
              style={{ borderRadius: '999px', width: '100%' }}
            />
          </div>
        ) : showMobileSearch && (
          <div style={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            padding: '0 8px'
          }}>
            <Search
              placeholder="Search topics"
              prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
              style={{ borderRadius: '999px', width: '100%' }}
              autoFocus
            />
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={toggleMobileSearch}
              style={{ marginLeft: 8 }}
            />
          </div>
        )}
        
        {/* Right Side Actions */}
        {!showMobileSearch && (
          <Flex align="center" gap="middle" style={{ height: '100%' }}>
            {screens.md ? (
              <>
                <Button 
                  onClick={() => router.push('/new')}
                  type="primary" 
                  icon={<PlusOutlined />} 
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {screens.lg ? 'New Post' : ''}
                </Button>
                
                <Badge count={5}>
                  <Button 
                    type="text" 
                    icon={<MessageOutlined />} 
                    shape="circle" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor:"#E5E4E2" }}
                  />
                </Badge>
                
                <Badge count={3}>
                  <Button 
                    type="text" 
                    icon={<BellOutlined />} 
                    shape="circle" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor:"#E5E4E2" }}
                  />
                </Badge>
              </>
            ) : (
              <Button 
                type="text" 
                icon={<SearchOutlined />} 
                onClick={toggleMobileSearch}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            )}
            
            <Dropdown
              menu={{ items }}
              trigger={['click']}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <Avatar 
                src="/images/profile.jpg" 
                size={40} 
                style={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }} 
              />
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
              onClick: () => router.push('/new')
            },
            {
              key: 'messages',
              icon: <MessageOutlined />,
              label: 'Messages',
            },
            {
              key: 'notifications',
              icon: <BellOutlined />,
              label: 'Notifications',
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