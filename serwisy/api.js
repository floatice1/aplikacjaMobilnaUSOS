const API_BASE_URL = 'http://192.168.0.101:8080';

export const api = {
  async get(resource) {
    const response = await fetch(`${API_BASE_URL}/${resource}`);
    return handleResponse(response);
  },

  async post(resource, data) {
    const response = await fetch(`${API_BASE_URL}/${resource}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(resource) {
    const response = await fetch(`${API_BASE_URL}/${resource}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(response);
  },

  async put(resource, data) {
    const response = await fetch(`${API_BASE_URL}/${resource}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

};

function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}