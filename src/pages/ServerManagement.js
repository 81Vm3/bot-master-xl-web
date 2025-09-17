import React from 'react';
import { Card, Table, Button, Space, Tag, Typography, Modal, Form, Select, Progress, Toast, Spin } from '@douyinfe/semi-ui';
import { IconPlus, IconEdit, IconDelete, IconRefresh, IconServer } from '@douyinfe/semi-icons';
import serverService from '../services/serverService';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { Option } = Select;

const ServerManagement = () => {
  const { t } = useTranslation();
  const [servers, setServers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [refreshingServers, setRefreshingServers] = React.useState(new Set());
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingServer, setEditingServer] = React.useState(null);

  React.useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    setLoading(true);
    try {
      const response = await serverService.listServers();
      if (response.success && response.data && response.data.servers) {
        setServers(response.data.servers);
      }
    } catch (error) {
      Toast.error(t('messages.networkError') + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: t('servers.serverName'),
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <IconServer />
          <strong>{text || t('servers.unnamedServer')}</strong>
        </Space>
      ),
    },
    {
      title: t('servers.serverHost'),
      dataIndex: 'host',
      key: 'host',
    },
    {
      title: t('servers.port'),
      dataIndex: 'port',
      key: 'port',
    },
    {
      title: t('servers.status'),
      key: 'status',
      render: (_, record) => {
        const isOnline = record.players !== undefined && record.players >= 0;
        return (
          <Tag color={isOnline ? 'green' : 'red'}>
            {isOnline ? t('servers.online') : t('servers.offline')}
          </Tag>
        );
      },
    },
    {
      title: t('servers.players'),
      key: 'players',
      render: (_, record) => (
        <span>{record.players || 0}/{record.max_players || 0}</span>
      ),
    },
    {
      title: t('servers.gamemode'),
      dataIndex: 'gamemode',
      key: 'gamemode',
    },
    {
      title: t('common.language'),
      dataIndex: 'language',
      key: 'language',
    },
    {
      title: t('servers.ping'),
      dataIndex: 'ping',
      key: 'ping',
      render: (ping) => ping ? `${ping}ms` : 'N/A',
    },
    {
      title: t('servers.lastUpdate'),
      dataIndex: 'last_update',
      key: 'last_update',
    },
    {
      title: t('servers.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          {/* <Button
            theme="borderless"
            icon={<IconRefresh />}
            loading={refreshingServers.has(record.id)}
            onClick={() => handleRefresh(record.id)}
            title={t('servers.refreshServer')}
          /> */}
          <Button
            theme="borderless"
            type="danger"
            icon={<IconDelete />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const handleRefresh = async (server_id) => {
    // Add server to refreshing set
    setRefreshingServers(prev => new Set([...prev, server_id]));
    
    try {
      console.log('Starting refresh for server:', server_id);
      const response = await serverService.queryServer(server_id);
      console.log('Got response:', response);
      
      if (response && response.success) {
        Toast.success(response.message || 'Server query initiated successfully');
        // Optionally refresh the server list after a short delay to show updated data
        setTimeout(() => {
          fetchServers();
        }, 2000);
      } else if (response) {
        Toast.error(response.message || 'Failed to query server');
      } else {
        Toast.error('Unexpected response format');
      }
    } catch (error) {
      console.error('HandleRefresh caught error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        Toast.error('Network error: Unable to connect to server');
      } else {
        Toast.error('Failed to refresh server: ' + error.message);
      }
    } finally {
      // Remove server from refreshing set
      setRefreshingServers(prev => {
        const newSet = new Set(prev);
        newSet.delete(server_id);
        return newSet;
      });
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: t('servers.deleteServer'),
      content: t('messages.confirmDelete'),
      onOk: async () => {
        try {
          await serverService.deleteServer(id);
          await fetchServers();
          Toast.success(t('servers.serverDeleted'));
        } catch (error) {
          Toast.error(t('servers.failedToDelete') + ': ' + error.message);
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      await serverService.addServer(values.host, parseInt(values.port));
      await fetchServers();
      Toast.success(t('servers.serverAdded'));
      setModalVisible(false);
      setEditingServer(null);
    } catch (error) {
      Toast.error(t('servers.failedToAdd') + ': ' + error.message);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingServer(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title heading={2}>{t('servers.title')}</Title>
        <Button 
          type="primary" 
          icon={<IconPlus />}
          onClick={() => setModalVisible(true)}
        >
          {t('servers.addNewServer')}
        </Button>
      </div>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={servers}
            pagination={{ pageSize: 10 }}
            rowKey="id"
          />
        </Spin>
      </Card>

      <Modal
        title={t('servers.addNewServer')}
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={500}
      >
        <Form
          onSubmit={handleSubmit}
          layout="vertical"
        >
          <Form.Input
            field="host"
            label={t('servers.host')}
            placeholder={t('servers.enterServerHost')}
            rules={[{ required: true, message: t('servers.hostRequired') }]}
          />
          
          <Form.Input
            field="port"
            label={t('servers.port')}
            placeholder={t('servers.enterServerPort')}
            rules={[
              { required: true, message: t('servers.portRequired') },
              { pattern: /^\d+$/, message: t('servers.portNumber') }
            ]}
          />

          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={handleModalClose}>{t('common.cancel')}</Button>
              <Button type="primary" htmlType="submit">
                {t('servers.addServer')}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ServerManagement;