/**
 * API helper — centralized fetch wrapper for the backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const { method = 'GET', body, headers = {} } = options;

  const config = {
    method,
    headers: {
      ...headers,
    },
  };

  if (body && !(body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    config.body = body;
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Make sure the backend is running on port 5000.');
    }
    throw error;
  }
}

export const api = {
  // Health
  health: () => request('/health'),

  // Profiles
  getProfiles: () => request('/profiles'),
  getProfile: (type) => request(`/profiles/${type}`),
  uploadResume: (formData) => request('/profiles/upload', { method: 'POST', body: formData }),
  updateProfile: (type, data) => request(`/profiles/${type}`, { method: 'PUT', body: data }),

  // Jobs
  searchJobs: (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jobs/search?${query}`);
  },
  getJob: (id, profileType) => request(`/jobs/${id}?profileType=${profileType}`),
  refreshJobs: () => request('/jobs/refresh', { method: 'POST' }),

  // Applications
  getApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/applications?${query}`);
  },
  saveApplication: (data) => request('/applications', { method: 'POST', body: data }),
  updateApplication: (id, data) => request(`/applications/${id}`, { method: 'PUT', body: data }),
  deleteApplication: (id) => request(`/applications/${id}`, { method: 'DELETE' }),
  checkApplication: (jobId) => request(`/applications/check/${jobId}`),

  // Sources Directory
  getSources: () => request('/sources'),
};
