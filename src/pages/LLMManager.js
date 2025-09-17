import React from 'react';
import { Card, Table, Button, Space, Typography, Modal, Form, Toast, Spin } from '@douyinfe/semi-ui';
import { IconPlus, IconEdit, IconDelete, IconRefresh, IconSetting } from '@douyinfe/semi-icons';
import llmProviderService from '../services/llmProviderService';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const LLMManager = () => {
  const { t } = useTranslation();
  const [providers, setProviders] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingProvider, setEditingProvider] = React.useState(null);

  React.useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await llmProviderService.listProviders();
      if (response.success && response.data) {
        // Map backend field names to frontend field names
        const mappedProviders = Array.isArray(response.data) ? response.data.map(provider => ({
          ...provider,
          api_endpoint: provider.base_url // Map base_url to api_endpoint for frontend
        })) : [];
        setProviders(mappedProviders);
      }
    } catch (error) {
      Toast.error(t('messages.networkError') + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: t('llm.providerName'),
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <IconSetting />
          <strong>{text || t('llm.unnamedProvider')}</strong>
        </Space>
      ),
    },
    {
      title: t('llm.apiEndpoint'),
      dataIndex: 'api_endpoint',
      key: 'api_endpoint',
      render: (text) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {text}
        </span>
      ),
    },
    {
      title: t('llm.model'),
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: t('llm.apiKey'),
      dataIndex: 'api_key',
      key: 'api_key',
      render: (apiKey) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {apiKey ? '************' + apiKey.slice(-4) : t('llm.notSet')}
        </span>
      ),
    },
    {
      title: t('llm.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => {
        if (!date) return 'N/A';
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
      },
    },
    {
      title: t('llm.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            theme="borderless"
            icon={<IconEdit />}
            onClick={() => handleEdit(record)}
          />
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

  const handleRefresh = async () => {
    await fetchProviders();
    Toast.success(t('llm.providerRefreshed'));
  };

  const handleEdit = (provider = null) => {
    setEditingProvider(provider);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: t('llm.deleteProvider'),
      content: t('messages.confirmDelete'),
      onOk: async () => {
        try {
          await llmProviderService.deleteProvider(id);
          await fetchProviders();
          Toast.success(t('llm.providerDeleted'));
        } catch (error) {
          Toast.error(t('llm.failedToDelete') + ': ' + error.message);
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (editingProvider) {
        await llmProviderService.updateProvider(editingProvider.id, values);
        Toast.success('LLM provider updated successfully');
      } else {
        await llmProviderService.createProvider(values);
        Toast.success('LLM provider created successfully');
      }
      await fetchProviders();
      setModalVisible(false);
      setEditingProvider(null);
    } catch (error) {
      Toast.error(`Failed to ${editingProvider ? 'update' : 'create'} LLM provider: ` + error.message);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingProvider(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title heading={2}>{t('llm.title')}</Title>
        <Space>
          <Button 
            icon={<IconRefresh />}
            onClick={handleRefresh}
          >
            {t('common.refresh')}
          </Button>
          <Button 
            type="primary" 
            icon={<IconPlus />}
            onClick={() => handleEdit()}
          >
            {t('llm.addProvider')}
          </Button>
        </Space>
      </div>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={providers}
            pagination={{ pageSize: 10 }}
            rowKey="id"
          />
        </Spin>
      </Card>

      <Modal
        title={editingProvider ? t('llm.editProvider') : t('llm.addProvider')}
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <Form
          onSubmit={handleSubmit}
          initValues={editingProvider || {}}
          layout="vertical"
        >
          <Form.Input
            field="name"
            label={t('llm.providerName')}
            placeholder={t('llm.enterProviderName')}
            rules={[{ required: true, message: t('llm.providerNameRequired') }]}
          />
          
          <Form.Input
            field="api_endpoint"
            label={t('llm.apiEndpoint')}
            placeholder={t('llm.enterEndpoint')}
            rules={[
              { required: true, message: t('llm.endpointRequired') },
              { type: 'url', message: t('llm.invalidUrl') }
            ]}
          />

          <Form.Input
            field="model"
            label={t('llm.model')}
            placeholder={t('llm.enterModel')}
            rules={[{ required: true, message: t('llm.modelRequired') }]}
          />

          <Form.Input
            field="api_key"
            label={t('llm.apiKey')}
            placeholder={t('llm.enterApiKey')}
            mode="password"
          />


          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={handleModalClose}>{t('common.cancel')}</Button>
              <Button type="primary" htmlType="submit">
                {editingProvider ? t('common.update') : t('common.create')} {t('llm.provider')}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default LLMManager;