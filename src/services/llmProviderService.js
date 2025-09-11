const API_BASE_URL = process.env.REACT_APP_API_URL;

class LLMProviderService {
  async listProviders() {
    try {
      const response = await fetch(`${API_BASE_URL}/llm/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching LLM providers:', error);
      throw error;
    }
  }

  async createProvider(providerData) {
    try {
      // Map frontend field names to backend field names
      const backendData = {
        name: providerData.name,
        base_url: providerData.api_endpoint,
        api_key: providerData.api_key || "",
        model: providerData.model
      };

      const response = await fetch(`${API_BASE_URL}/llm/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating LLM provider:', error);
      throw error;
    }
  }

  async updateProvider(id, providerData) {
    try {
      // Map frontend field names to backend field names
      const backendData = { id };
      if (providerData.name) backendData.name = providerData.name;
      if (providerData.api_endpoint) backendData.base_url = providerData.api_endpoint;
      if (providerData.api_key !== undefined) backendData.api_key = providerData.api_key;
      if (providerData.model) backendData.model = providerData.model;

      const response = await fetch(`${API_BASE_URL}/llm/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating LLM provider:', error);
      throw error;
    }
  }

  async deleteProvider(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/llm/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting LLM provider:', error);
      throw error;
    }
  }

  async getProvider(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/llm/get?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching LLM provider:', error);
      throw error;
    }
  }
}

export default new LLMProviderService();