const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:7070');

class BotService {
  async listBots() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bot/list`, {
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
      console.error('Error fetching bots:', error);
      throw error;
    }
  }

  async createBot(name, server_id = 0, invulnerable = false, system_prompt = '', password = '', llm_provider_id = -1) {
    try {
      const requestBody = { 
        name, 
        server_id, 
        invulnerable, 
        system_prompt,
        password
      };

      if (llm_provider_id > 0) {
        requestBody.llm_provider_id = llm_provider_id;
      }

      const response = await fetch(`${API_BASE_URL}/api/bot/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating bot:', error);
      throw error;
    }
  }

  async deleteBot(uuid) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bot/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting bot:', error);
      throw error;
    }
  }

  async setPassword(uuid, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bot/set_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting bot password:', error);
      throw error;
    }
  }

  async reconnectBot(uuid) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bot/reconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error reconnecting bot:', error);
      throw error;
    }
  }

  async enableLLMSession(uuid, provider_id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bot/enable_llm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid, provider_id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error enabling LLM session:', error);
      throw error;
    }
  }

  async disableLLMSession(uuid) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bot/disable_llm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error disabling LLM session:', error);
      throw error;
    }
  }

  async updateSystemPrompt(uuid, system_prompt) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bot/update_prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid, system_prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating system prompt:', error);
      throw error;
    }
  }
}

export default new BotService();