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
  Menu,
  List,
  AutoComplete
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
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';
import { Message, Notification } from '../../utils/svgImage';

const { Header } = Layout;
const { Search } = Input;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function Navbar() {
  const screens = useBreakpoint();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  // Handle navigation with drawer closing
  const handleNavigation = (path) => {
    router.push(path);
    setDrawerVisible(false); // Close drawer when navigation happens
  };

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
      onClick: () => handleNavigation("/profile"),
    },
    {
      type: 'divider',
    },
    {
      key: 'about',
      icon: <UserOutlined />,
      label: 'About us',
      onClick: () => handleNavigation('/about')
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Help & Support',
      onClick: () => handleNavigation('/help&support')
    },
    {
      key: 'feedback',
      icon: <CommentOutlined />,
      label: 'Feedback',
      onClick: () => handleNavigation('/feedback')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => handleNavigation('/settings')
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
      onClick: () => handleNavigation('/auth/login')
    },
  ];

  // Debounced function to fetch search suggestions
  const fetchSuggestions = debounce(async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    
    // In a real app, replace this with your actual API call
    // Example: const response = await fetch(`/api/search/suggestions?q=${query}`);
    // const data = await response.json();
    
    // Mock data for demonstration
    const mockSuggestions = [
      { value: `${query} tutorial` },
      { value: `${query} for beginners` },
      { value: `how to ${query}` },
      { value: `best ${query} techniques` },
      { value: `${query} advanced` },
    ];
    
    setSuggestions(mockSuggestions);
  }, 300);

  useEffect(() => {
    fetchSuggestions(searchQuery);
    
    return () => {
      fetchSuggestions.cancel();
    };
  }, [searchQuery]);

  const handleSearch = (value) => {
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value)}`);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (value) => {
    handleSearch(value);
  };

  const handleInputChange = (value) => {
    setSearchQuery(value);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Custom search field styles to match the reference image
  const searchFieldStyles = {
    input: {
      backgroundColor: '#f3f2fa', // Light purple/lavender background
      borderRadius: '10px',
      border: '1px solid #D8D8D8',
      padding: '10px 16px',
      boxShadow: 'none',
    },
    searchIcon: {
      color: '#6b7280', // Medium gray color for the icon
      fontSize: '16px',
      marginRight: '8px',
    }
  };

  // Consistent button styles for notification and message icons
  const iconButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #808080',
    padding: '15px',
    width: '30px',
    height: '30px',
    borderRadius: '50%'
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
        
        {/* Middle - Search Bar - Updated styling to match reference */}
        {screens.md ? (
          <div style={{ 
            width: '35%', 
            paddingLeft:"100px",
            minWidth: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent:"center",
            height: '100%',
            position: 'relative',
          }} ref={searchRef}>
            <AutoComplete
              options={suggestions}
              onSelect={handleSelect}
              onSearch={handleInputChange}
              onKeyDown={handleKeyDown}
              value={searchQuery}
              style={{ width: '100%' }}
              open={showSuggestions && suggestions.length > 0}
              onDropdownVisibleChange={(open) => setShowSuggestions(open)}
              popupMatchSelectWidth={true}
              dropdownStyle={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                padding: '8px 0'
              }}
            >
              <Input
                placeholder="Search topics"
                prefix={<SearchOutlined style={searchFieldStyles.searchIcon} />}
                style={searchFieldStyles.input}
                onPressEnter={() => handleSearch(searchQuery)}
                allowClear
              />
            </AutoComplete>
          </div>
        ) : showMobileSearch && (
          <div style={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            padding: '0 8px',
            position: 'relative'
          }} ref={searchRef}>
            <AutoComplete
              options={suggestions}
              onSelect={handleSelect}
              onSearch={handleInputChange}
              onKeyDown={handleKeyDown}
              value={searchQuery}
              style={{ width: '100%' }}
              open={showSuggestions && suggestions.length > 0}
              onDropdownVisibleChange={(open) => setShowSuggestions(open)}
              dropdownMatchSelectWidth={true}
              dropdownStyle={{
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                padding: '8px 0'
              }}
            >
              <Input
                placeholder="Search topics"
                prefix={<SearchOutlined style={searchFieldStyles.searchIcon} />}
                style={{...searchFieldStyles.input, width: '100%'}}
                autoFocus
                onPressEnter={() => handleSearch(searchQuery)}
                allowClear
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
            </AutoComplete>
          </div>
        )}
        
        {/* Right Side Actions */}
        {!showMobileSearch && (
          <Flex align="center" gap="middle" style={{ height: '100%' }}>
            {screens.md ? (
              <>
                <Button 
                  onClick={() => handleNavigation('/new')}
                  type="primary" 
                  icon={<PlusOutlined />} 
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {screens.lg ? 'New Post' : ''}
                </Button>
                
                <Badge style={{backgroundColor:"#2930FF"}} count={5}>
                  <Button 
                    onClick={() => handleNavigation("/chat")}
                    type="text" 
                    icon={<Message />} 
                    shape="circle" 
                    style={iconButtonStyles}
                  />
                </Badge>
                
                <Badge style={{backgroundColor:"#2930FF"}} count={3}>
                  <Button 
                    onClick={() => handleNavigation("/notification")}
                    type="text" 
                    icon={<Notification />} 
                    shape="circle" 
                    style={iconButtonStyles}
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