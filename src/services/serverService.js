const API_BASE_URL = process.env.REACT_APP_API_URL;

class ServerService {
  async listServers() {
    try {
      const response = await fetch(`${API_BASE_URL}/server/list`, {
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
      console.error('Error fetching servers:', error);
      throw error;
    }
  }

  async addServer(host, port) {
    try {
      const response = await fetch(`${API_BASE_URL}/server/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ host, port }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding server:', error);
      throw error;
    }
  }

  async deleteServer(dbid) {
    try {
      const response = await fetch(`${API_BASE_URL}/server/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dbid }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting server:', error);
      throw error;
    }
  }
}

export default new ServerService();