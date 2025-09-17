const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:7070');

class ServerService {
  async listServers() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/server/list`, {
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
      const response = await fetch(`${API_BASE_URL}/api/server/add`, {
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
      const response = await fetch(`${API_BASE_URL}/api/server/delete`, {
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
  async queryServer(server_id) {
    try {
      console.log('Making queryServer request for server_id:', server_id);
      
      const response = await fetch(`${API_BASE_URL}/api/server/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ server_id }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response type:', response.type);
      console.log('Response url:', response.url);

      // Check if this is somehow getting the OPTIONS response instead of POST
      if (response.status === 204) {
        console.warn('Got 204 response - this might be the OPTIONS preflight response being returned incorrectly');
        throw new Error('Received OPTIONS preflight response instead of actual API response');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Error querying server:', error);
      throw error;
    }
  }
}

export default new ServerService();