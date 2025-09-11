import React from 'react';
import { Card, Table, Button, Space, Tag, Typography, Modal, Form, Select, Toast, Spin, InputNumber } from '@douyinfe/semi-ui';
import { IconPlus, IconEdit, IconDelete, IconPlay, IconStop, IconRefresh, IconLock, IconCopy, IconSetting } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import botService from '../services/botService';
import serverService from '../services/serverService';
import llmProviderService from '../services/llmProviderService';

const { Title } = Typography;
const { Option } = Select;

const BotManagement = () => {
  const { t } = useTranslation();
  const [bots, setBots] = React.useState([]);
  const [servers, setServers] = React.useState([]);
  const [llmProviders, setLLMProviders] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [batchModalVisible, setBatchModalVisible] = React.useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = React.useState(false);
  const [llmModalVisible, setLLMModalVisible] = React.useState(false);
  const [promptModalVisible, setPromptModalVisible] = React.useState(false);
  const [editingBot, setEditingBot] = React.useState(null);
  const [selectedBot, setSelectedBot] = React.useState(null);

  React.useEffect(() => {
    fetchBots();
    fetchServers();
    fetchLLMProviders();
  }, []);

  const fetchBots = async () => {
    setLoading(true);
    try {
      const response = await botService.listBots();
      if (response.success && response.data) {
        setBots(response.data);
      }
    } catch (error) {
      Toast.error(t('messages.networkError') + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchServers = async () => {
    try {
      const response = await serverService.listServers();
      if (response.success && response.data && response.data.servers) {
        setServers(response.data.servers);
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error);
    }
  };

  const fetchLLMProviders = async () => {
    try {
      const response = await llmProviderService.listProviders();
      if (response.success && response.data) {
        setLLMProviders(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch LLM providers:', error);
    }
  };

  const columns = [
    {
      title: t('bots.botName'),
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'UUID',
      dataIndex: 'uuid',
      key: 'uuid',
      render: (uuid) => <code style={{ fontSize: '12px' }}>{uuid?.substring(0, 8)}...</code>,
    },
    {
      title: t('servers.server'),
      dataIndex: 'server_id',
      key: 'server_id',
      render: (server_id) => {
        if (server_id === 0) return 'No Server';
        const server = servers.find(s => s.id === server_id);
        return server ? `${server.host}:${server.port}` : `Server ID: ${server_id}`;
      },
    },
    {
      title: 'Invulnerable',
      dataIndex: 'invulnerable',
      key: 'invulnerable',
      render: (invulnerable) => (
        <Tag color={invulnerable ? 'green' : 'red'}>
          {invulnerable ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'LLM Session',
      key: 'llm_session',
      render: (_, record) => (
        <Tag color={record.has_llm_session ? 'green' : 'red'}>
          {record.has_llm_session ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: t('bots.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            theme="borderless"
            icon={<IconRefresh />}
            onClick={() => handleReconnect(record.uuid)}
            title="Reconnect Bot"
          />
          <Button
            theme="borderless"
            icon={<IconLock />}
            onClick={() => handleSetPassword(record)}
            title="Set Password"
          />
          <Button
            theme="borderless"
            icon={<IconSetting />}
            onClick={() => handleLLMSession(record)}
            title="Manage LLM Session"
            type={record.has_llm_session ? "warning" : "primary"}
          />
          <Button
            theme="borderless"
            icon={<IconEdit />}
            onClick={() => handleUpdatePrompt(record)}
            title="Update System Prompt"
          />
          <Button
            theme="borderless"
            type="danger"
            icon={<IconDelete />}
            onClick={() => handleDelete(record.uuid)}
          />
        </Space>
      ),
    },
  ];

  const handleReconnect = async (uuid) => {
    try {
      const response = await botService.reconnectBot(uuid);
      if (response.success) {
        Toast.success(response.message || 'Bot reconnected successfully');
        await fetchBots();
      } else {
        Toast.error(response.message || 'Failed to reconnect bot');
      }
    } catch (error) {
      Toast.error('Failed to reconnect bot: ' + error.message);
    }
  };

  const handleSetPassword = (bot) => {
    setSelectedBot(bot);
    setPasswordModalVisible(true);
  };

  const handlePasswordSubmit = async (values) => {
    if (!selectedBot) return;
    
    try {
      const response = await botService.setPassword(selectedBot.uuid, values.password);
      if (response.success) {
        Toast.success('Password updated successfully');
        setPasswordModalVisible(false);
        setSelectedBot(null);
      } else {
        Toast.error(response.message || 'Failed to update password');
      }
    } catch (error) {
      Toast.error('Failed to update password: ' + error.message);
    }
  };

  const handleLLMSession = (bot) => {
    setSelectedBot(bot);
    setLLMModalVisible(true);
  };

  const handleUpdatePrompt = (bot) => {
    setSelectedBot(bot);
    setPromptModalVisible(true);
  };

  const handleLLMSubmit = async (values) => {
    if (!selectedBot) return;
    
    try {
      if (selectedBot.has_llm_session) {
        // Disable LLM session
        const response = await botService.disableLLMSession(selectedBot.uuid);
        if (response.success) {
          Toast.success('LLM session disabled successfully');
          await fetchBots();
        } else {
          Toast.error(response.message || 'Failed to disable LLM session');
        }
      } else {
        // Enable LLM session
        const response = await botService.enableLLMSession(selectedBot.uuid, values.provider_id);
        if (response.success) {
          Toast.success('LLM session enabled successfully');
          await fetchBots();
        } else {
          Toast.error(response.message || 'Failed to enable LLM session');
        }
      }
      setLLMModalVisible(false);
      setSelectedBot(null);
    } catch (error) {
      Toast.error('Failed to manage LLM session: ' + error.message);
    }
  };

  const handlePromptSubmit = async (values) => {
    if (!selectedBot) return;
    
    try {
      const response = await botService.updateSystemPrompt(selectedBot.uuid, values.system_prompt);
      if (response.success) {
        Toast.success('System prompt updated successfully');
        setPromptModalVisible(false);
        setSelectedBot(null);
        await fetchBots();
      } else {
        Toast.error(response.message || 'Failed to update system prompt');
      }
    } catch (error) {
      Toast.error('Failed to update system prompt: ' + error.message);
    }
  };

  const handleEdit = (bot) => {
    setEditingBot(bot);
    setModalVisible(true);
  };

  const handleDelete = async (uuid) => {
    Modal.confirm({
      title: t('bots.deleteBot'),
      content: t('messages.confirmDelete'),
      onOk: async () => {
        try {
          const response = await botService.deleteBot(uuid);
          if (response.success) {
            await fetchBots();
            Toast.success(t('messages.deleteSuccess'));
          } else {
            Toast.error(response.message || 'Failed to delete bot');
          }
        } catch (error) {
          Toast.error('Failed to delete bot: ' + error.message);
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (editingBot) {
        // For now, we only support creating new bots via the API
        // Edit functionality would require an update endpoint
        Toast.warning('Edit functionality not yet implemented in backend');
        return;
      } else {
        const response = await botService.createBot(
          values.name,
          values.server_id || 0,
          values.invulnerable || false,
          values.system_prompt || ''
        );
        
        if (response.success) {
          await fetchBots();
          Toast.success(t('messages.saveSuccess'));
          setModalVisible(false);
          setEditingBot(null);
        } else {
          Toast.error(response.message || 'Failed to create bot');
        }
      }
    } catch (error) {
      Toast.error('Failed to save bot: ' + error.message);
    }
  };

  const generateRandomHex = (length = 4) => {
    return Math.floor(Math.random() * Math.pow(16, length)).toString(16).toUpperCase().padStart(length, '0');
  };

  const generateBinary = (index, totalCount) => {
    const binaryLength = Math.ceil(Math.log2(totalCount + 1));
    return index.toString(2).padStart(binaryLength, '0');
  };

  const fetchRealisticNames = async (count) => {
    try {
      const response = await fetch(`https://randommer.io/api/Name?nameType=fullname&quantity=${count}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': process.env.REACT_APP_RANDOMMER_API_KEY || 'demo-key'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch realistic names');
      }
      
      const names = await response.json();
      return names;
    } catch (error) {
      console.error('Error fetching realistic names:', error);
      // Fallback to default naming if API fails
      return Array.from({ length: count }, (_, i) => `User${i + 1}`);
    }
  };

  const generateBotName = async (namePolicy, baseName, index, totalCount, realisticNames = []) => {
    switch (namePolicy) {
      case 'random_hex':
        return `${baseName}_${generateRandomHex()}`;
      case 'binary':
        return `${baseName}_${generateBinary(index, totalCount)}`;
      case 'appended_id':
        return `${baseName}_${index}`;
      case 'realistic':
        return realisticNames[index - 1] || `${baseName}_${index}`;
      default:
        return `${baseName}_${index}`;
    }
  };

  const handleBatchSubmit = async (values) => {
    const { count, namePolicy, ...botConfig } = values;
    
    try {
      setLoading(true);
      let realisticNames = [];
      
      // Fetch realistic names if needed
      if (namePolicy === 'realistic') {
        realisticNames = await fetchRealisticNames(count);
      }
      
      const promises = [];
      
      for (let i = 1; i <= count; i++) {
        const botName = await generateBotName(namePolicy, botConfig.name, i, count, realisticNames);
        promises.push(
          botService.createBot(
            botName,
            botConfig.server_id || 0,
            botConfig.invulnerable || false,
            botConfig.system_prompt || ''
          )
        );
      }
      
      const results = await Promise.allSettled(promises);
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
      const failureCount = count - successCount;
      
      if (successCount > 0) {
        await fetchBots();
        Toast.success(`Successfully created ${successCount} bots`);
      }
      
      if (failureCount > 0) {
        Toast.error(`Failed to create ${failureCount} bots`);
      }
      
      setBatchModalVisible(false);
    } catch (error) {
      Toast.error('Failed to create bots: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingBot(null);
  };

  const handleBatchModalClose = () => {
    setBatchModalVisible(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title heading={2}>{t('bots.title')}</Title>
        <Space>
          <Button 
            icon={<IconCopy />}
            onClick={() => setBatchModalVisible(true)}
          >
            {t('bots.batchAdd')}
          </Button>
          <Button 
            type="primary" 
            icon={<IconPlus />}
            onClick={() => setModalVisible(true)}
          >
            {t('bots.addBot')}
          </Button>
        </Space>
      </div>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={bots}
            pagination={{ pageSize: 10 }}
            rowKey="uuid"
          />
        </Spin>
      </Card>

      <Modal
        title={editingBot ? t('bots.editBot') : t('bots.addBot')}
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={500}
      >
        <Form
          onSubmit={handleSubmit}
          initValues={editingBot || {}}
          layout="vertical"
        >
          <Form.Input
            field="name"
            label={t('bots.botName')}
            placeholder={t('bots.enterBotName')}
            rules={[{ required: true, message: t('bots.botNameRequired') }]}
          />
          
          <Form.Select
            field="server_id"
            label={t('servers.server')}
            placeholder={t('bots.selectServer')}
            style={{ width: '100%' }}
            rules={[{ required: true, message: t('bots.serverRequired') }]}
          >
            {servers.map(server => (
              <Option key={server.id} value={server.id}>
                {server.host}:{server.port} ({server.name || t('servers.unnamedServer')})
              </Option>
            ))}
          </Form.Select>

          <Form.Switch
            field="invulnerable"
            label={t('bots.invulnerable')}
          />

          <Form.TextArea
            field="system_prompt"
            label={t('bots.systemPrompt')}
            placeholder={t('bots.enterSystemPrompt')}
            rows={4}
          />

          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={handleModalClose}>{t('common.cancel')}</Button>
              <Button type="primary" htmlType="submit">
                {editingBot ? t('common.update') : t('common.create')} {t('bots.bot')}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal
        title={t('bots.setBotPassword')}
        visible={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          setSelectedBot(null);
        }}
        footer={null}
        width={400}
      >
        <Form
          onSubmit={handlePasswordSubmit}
          layout="vertical"
        >
          <Form.Input
            field="password"
            label={t('bots.password')}
            placeholder={t('bots.enterNewPassword')}
            type="password"
            rules={[{ required: true, message: t('bots.passwordRequired') }]}
          />

          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={() => {
                setPasswordModalVisible(false);
                setSelectedBot(null);
              }}>
                {t('common.cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {t('bots.setPassword')}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal
        title={t('bots.batchAddBots')}
        visible={batchModalVisible}
        onCancel={handleBatchModalClose}
        footer={null}
        width={600}
      >
        <Form
          onSubmit={handleBatchSubmit}
          initValues={{ count: 1, namePolicy: 'appended_id' }}
          layout="vertical"
        >
          <Form.InputNumber
            field="count"
            label={t('bots.numberOfBots')}
            placeholder={t('bots.enterNumberOfBots')}
            min={1}
            max={100}
            rules={[{ required: true, message: t('bots.numberOfBotsRequired') }]}
          />

          <Form.Select
            field="namePolicy"
            label={t('bots.namePolicy')}
            placeholder={t('bots.selectNamePolicy')}
            style={{ width: '100%' }}
            rules={[{ required: true, message: t('bots.namePolicyRequired') }]}
          >
            <Option value="appended_id">{t('bots.namePolicies.appended_id')}</Option>
            <Option value="random_hex">{t('bots.namePolicies.random_hex')}</Option>
            <Option value="binary">{t('bots.namePolicies.binary')}</Option>
            <Option value="realistic">{t('bots.namePolicies.realistic')}</Option>
          </Form.Select>

          <Form.Input
            field="name"
            label={t('bots.baseBotName')}
            placeholder={t('bots.enterBaseBotName')}
            rules={[{ required: true, message: t('bots.baseBotNameRequired') }]}
          />
          
          <Form.Select
            field="server_id"
            label={t('servers.server')}
            placeholder={t('bots.selectServer')}
            style={{ width: '100%' }}
            rules={[{ required: true, message: t('bots.serverRequired') }]}
          >
            {servers.map(server => (
              <Option key={server.id} value={server.id}>
                {server.host}:{server.port} ({server.name || t('servers.unnamedServer')})
              </Option>
            ))}
          </Form.Select>

          <Form.Switch
            field="invulnerable"
            label={t('bots.invulnerable')}
          />

          <Form.TextArea
            field="system_prompt"
            label={t('bots.systemPrompt')}
            placeholder={t('bots.enterSystemPromptForAll')}
            rows={4}
          />

          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={handleBatchModalClose}>{t('common.cancel')}</Button>
              <Button type="primary" htmlType="submit">
                {t('bots.createBots')}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal
        title={t('bots.manageLLMSession')}
        visible={llmModalVisible}
        onCancel={() => {
          setLLMModalVisible(false);
          setSelectedBot(null);
        }}
        footer={null}
        width={500}
      >
        {selectedBot && (
          <div>
            <p><strong>{t('bots.bot')}:</strong> {selectedBot.name}</p>
            <p><strong>{t('bots.currentStatus')}:</strong> 
              <Tag color={selectedBot.has_llm_session ? 'green' : 'red'} style={{ marginLeft: '8px' }}>
                {selectedBot.has_llm_session ? t('bots.llmSessionActive') : t('bots.llmSessionInactive')}
              </Tag>
            </p>
            
            {selectedBot.has_llm_session ? (
              <div>
                <p>{t('bots.disableLLMSessionPrompt')}</p>
                <Button 
                  type="danger" 
                  onClick={() => handleLLMSubmit({})}
                  style={{ marginTop: '16px' }}
                >
                  {t('bots.disableLLMSession')}
                </Button>
              </div>
            ) : (
              <Form
                onSubmit={handleLLMSubmit}
                layout="vertical"
                style={{ marginTop: '16px' }}
              >
                <Form.Select
                  field="provider_id"
                  label={t('llm.provider')}
                  placeholder={t('bots.selectLLMProvider')}
                  style={{ width: '100%' }}
                  rules={[{ required: true, message: t('bots.llmProviderRequired') }]}
                >
                  {llmProviders.map(provider => (
                    <Option key={provider.id} value={provider.id}>
                      {provider.name} ({provider.model})
                    </Option>
                  ))}
                </Form.Select>

                <div style={{ textAlign: 'right', marginTop: '24px' }}>
                  <Space>
                    <Button onClick={() => {
                      setLLMModalVisible(false);
                      setSelectedBot(null);
                    }}>
                      {t('common.cancel')}
                    </Button>
                    <Button type="primary" htmlType="submit">
                      {t('bots.enableLLMSession')}
                    </Button>
                  </Space>
                </div>
              </Form>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={t('bots.updateSystemPrompt')}
        visible={promptModalVisible}
        onCancel={() => {
          setPromptModalVisible(false);
          setSelectedBot(null);
        }}
        footer={null}
        width={600}
      >
        {selectedBot && (
          <Form
            onSubmit={handlePromptSubmit}
            initValues={{ system_prompt: selectedBot.system_prompt }}
            layout="vertical"
          >
            <p><strong>{t('bots.bot')}:</strong> {selectedBot.name}</p>
            
            <Form.TextArea
              field="system_prompt"
              label={t('bots.systemPrompt')}
              placeholder={t('bots.enterSystemPromptForBot')}
              rows={6}
              rules={[{ required: true, message: t('bots.systemPromptRequired') }]}
            />

            <div style={{ textAlign: 'right', marginTop: '24px' }}>
              <Space>
                <Button onClick={() => {
                  setPromptModalVisible(false);
                  setSelectedBot(null);
                }}>
                  {t('common.cancel')}
                </Button>
                <Button type="primary" htmlType="submit">
                  {t('bots.updateSystemPrompt')}
                </Button>
              </Space>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default BotManagement;