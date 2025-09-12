import React from 'react';
import { Card, Row, Col, Typography, Space, Button, Spin, Toast } from '@douyinfe/semi-ui';
import { IconUser, IconServer, IconComponent, IconActivity } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import dashboardService from '../services/dashboardService';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(true);
  const [runtimeData, setRuntimeData] = React.useState(null);
  const [botStats, setBotStats] = React.useState(null);
  const [serverStats, setServerStats] = React.useState(null);
  const [currentUptime, setCurrentUptime] = React.useState(null);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  React.useEffect(() => {
    let interval;
    console.log('Runtime data in useEffect:', runtimeData); // Debug log
    
    if (runtimeData) {
      // Try different possible fields for start time or uptime
      let baseUptimeSeconds = null;
      
      if (runtimeData.uptime) {
        baseUptimeSeconds = runtimeData.uptime;
      } else if (runtimeData.start_time) {
        const startTime = new Date(runtimeData.start_time).getTime();
        baseUptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
      } else if (runtimeData.uptime_seconds) {
        baseUptimeSeconds = runtimeData.uptime_seconds;
      }
      
      console.log('Base uptime seconds:', baseUptimeSeconds); // Debug log
      
      if (baseUptimeSeconds !== null) {
        const startTime = Date.now() - (baseUptimeSeconds * 1000);
        
        interval = setInterval(() => {
          const now = Date.now();
          const uptimeMs = now - startTime;
          const seconds = Math.floor(uptimeMs / 1000);
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          const days = Math.floor(hours / 24);
          
          const uptimeString = (() => {
            const parts = [];
            if (days > 0) parts.push(`${days}d`);
            if (hours % 24 > 0) parts.push(`${hours % 24}h`);
            if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
            if (seconds % 60 > 0 || parts.length === 0) parts.push(`${seconds % 60}s`);
            return parts.join(' ');
          })();
          
          setCurrentUptime({
            uptime_string: uptimeString,
            formatted: { days }
          });
        }, 1000);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [runtimeData]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [runtime, bots, servers] = await Promise.all([
        dashboardService.getRuntime(),
        dashboardService.getBotStats(),
        dashboardService.getServerStats()
      ]);

      if (runtime.success) {
        console.log('Runtime data:', runtime.data); // Debug log
        setRuntimeData(runtime.data);
      }
      if (bots.success) {
        setBotStats(bots.data);
      }
      if (servers.success) {
        setServerStats(servers.data);
      }
    } catch (error) {
      Toast.error('Failed to load dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const stats = [
    {
      title: t('dashboard.totalBots'),
      value: botStats?.total || 0,
      icon: <IconComponent size="large" />,
      color: '#4facfe',
      subtitle: t('dashboard.botStats', { connected: botStats?.connected || 0, disconnected: botStats?.disconnected || 0 }),
    },
    {
      title: t('dashboard.activeServers'),
      value: serverStats?.total || 0,
      icon: <IconServer size="large" />,
      color: '#f093fb',
      subtitle: t('dashboard.serverStats', { online: serverStats?.online || 0, offline: serverStats?.offline || 0 }),
    },
    {
      title: t('dashboard.systemUptime'),
      value: currentUptime?.uptime_string || runtimeData?.uptime_string || t('common.loading'),
      icon: <IconActivity size="large" />,
      color: '#43e97b',
      subtitle: t('dashboard.runningFor', { days: currentUptime?.formatted?.days || runtimeData?.formatted?.days || 0 }),
    },
  ];


  return (
    <Spin spinning={loading}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title heading={2}>
            {t('dashboard.title')}
          </Title>
          <Button 
            icon={<IconActivity />}
            onClick={fetchDashboardData}
          >
            {t('common.refresh')}
          </Button>
        </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <Col span={8} key={index}>
            <Card
              style={{
                background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`,
                border: `1px solid ${stat.color}30`,
              }}
            >
              <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                <div>
                  <Text type="secondary" size="small">
                    {stat.title}
                  </Text>
                  <Title heading={3} style={{ margin: '4px 0', color: stat.color }}>
                    {stat.value}
                  </Title>
                  <Text type="secondary" size="small">
                    {stat.subtitle}
                  </Text>
                </div>
                <div style={{ color: stat.color }}>
                  {stat.icon}
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>


      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title={t('dashboard.quickActions')}>
            <Space wrap>
              <Button type="primary" icon={<IconComponent />}>
                {t('bots.addBot')}
              </Button>
              <Button icon={<IconServer />}>
                {t('servers.addServer')}
              </Button>
              <Button type="tertiary">
                {t('dashboard.viewLogs')}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
    </Spin>
  );
};

export default Dashboard;