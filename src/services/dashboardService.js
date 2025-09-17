const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:7070');

class DashboardService {
  async getRuntime() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/runtime`, {
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
      console.error('Error fetching runtime data:', error);
      throw error;
    }
  }

  async getBotStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/bot_stats`, {
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
      console.error('Error fetching bot stats:', error);
      throw error;
    }
  }

  async getServerStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/server_stats`, {
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
      console.error('Error fetching server stats:', error);
      throw error;
    }
  }
}

export default new DashboardService();