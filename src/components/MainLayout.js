import React from 'react';
import { Layout, Nav, Button, Space, Typography, Dropdown } from '@douyinfe/semi-ui';
import { 
  IconSemiLogo, 
  IconHome, 
  IconServer, 
  IconComponent,
  IconSetting,
  IconMoon,
  IconSun,
  IconLanguage,
} from '@douyinfe/semi-icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const navItems = [
    {
      itemKey: '/dashboard',
      text: t('nav.dashboard'),
      icon: <IconHome />,
    },
    {
      itemKey: '/bots',
      text: t('nav.botManagement'),
      icon: <IconComponent />,
    },
    {
      itemKey: '/servers',
      text: t('nav.serverManagement'),
      icon: <IconServer />,
    },
    {
      itemKey: '/llm',
      text: t('nav.llmProviders'),
      icon: <IconSetting />,
    },
  ];

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        style={{
          backgroundColor: 'var(--semi-color-bg-1)',
          borderRight: '1px solid var(--semi-color-border)',
        }}
        breakpoint="lg"
        collapsedWidth={60}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid var(--semi-color-border)',
          textAlign: 'center'
        }}>
          <Space align="center">
            <IconSemiLogo size="large" style={{ color: '#667eea' }} />
            {!collapsed && (
              <Title heading={4} style={{ margin: 0, color: '#667eea' }}>
                {t('app.title')}
              </Title>
            )}
          </Space>
        </div>
        
        <Nav
          selectedKeys={[location.pathname]}
          onSelect={({ itemKey }) => navigate(itemKey)}
          items={navItems}
          style={{ marginTop: '20px' }}
          mode="vertical"
          openKeys={[]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            backgroundColor: 'var(--semi-color-bg-1)',
            borderBottom: '1px solid var(--semi-color-border)',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div />
          
          <Space>
            <Dropdown
              trigger="click"
              position="bottomRight"
              menu={[
                {
                  node: 'item',
                  name: t('language.english'),
                  onClick: () => changeLanguage('en'),
                },
                {
                  node: 'item',
                  name: t('language.chinese'),
                  onClick: () => changeLanguage('zh'),
                },
              ]}
            >
              <Button
                theme="borderless"
                icon={<IconLanguage />}
              />
            </Dropdown>
            <Button
              theme="borderless"
              icon={darkMode ? <IconSun /> : <IconMoon />}
              onClick={() => setDarkMode(!darkMode)}
            />
          </Space>
        </Header>

        <Content
          style={{
            padding: '24px',
            backgroundColor: 'var(--semi-color-bg-0)',
            overflow: 'hidden',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;