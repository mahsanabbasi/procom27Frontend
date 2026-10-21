// Centralized API client for PROCOM'27

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export function getToken() {
  return localStorage.getItem('procom_access_token');
}

export function setToken(token) {
  localStorage.setItem('procom_access_token', token);
}

export function removeToken() {
  localStorage.removeItem('procom_access_token');
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await res.json().catch(() => ({
      success: res.ok,
      message: res.statusText,
    }));

    if (!res.ok) {
      if (res.status === 401) {
        if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
          removeToken();
        }
      }
      return {
        success: false,
        message: data.message || `Request failed with status ${res.status}`,
        errors: data.errors,
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Network connection failed. Backend server may be offline.',
    };
  }
}

export const api = {
  // Auth
  register: (payload) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        'cf-turnstile-response': payload['cf-turnstile-response'] || 'test-token',
      }),
    }),

  login: (payload) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: () => apiRequest('/auth/me'),

  // Competitions
  getCompetitions: (category) =>
    apiRequest(`/competitions${category ? `?category=${category}` : ''}`),

  getCompetitionBySlug: (slug) => apiRequest(`/competitions/${slug}`),

  // Teams
  createTeam: (payload) =>
    apiRequest('/teams', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  joinTeam: (joinCode) =>
    apiRequest('/teams/join', {
      method: 'POST',
      body: JSON.stringify({ joinCode }),
    }),

  getMyTeams: () => apiRequest('/teams/my-teams'),

  // Applications to join a PROCOM'27 organising team (module recruitment),
  // as opposed to forming a competition team.
  applyToTeam: (teamSlug, payload) =>
    apiRequest(`/teams/${teamSlug}/applications`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Portal
  getDashboard: () => apiRequest('/portal/dashboard'),

  updateProfile: (data) =>
    apiRequest('/portal/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword, newPassword) =>
    apiRequest('/portal/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Payments
  getUploadSlipUrl: (contentType = 'image/jpeg') =>
    apiRequest(`/payments/presigned-slip-url?contentType=${encodeURIComponent(contentType)}`),

  submitPayment: (payload) =>
    apiRequest('/payments/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Ambassadors
  registerAmbassador: (requestedCode) =>
    apiRequest('/ambassadors/register', {
      method: 'POST',
      body: JSON.stringify({ requestedCode }),
    }),

  getAmbassadorProfile: () => apiRequest('/ambassadors/me'),

  getAmbassadorLeaderboard: (limit = 20) =>
    apiRequest(`/ambassadors/leaderboard?limit=${limit}`),

  // Tickets
  getMyTicket: () => apiRequest('/tickets/my-ticket'),

  // Job Fair
  getJobs: () => apiRequest('/jobfair/jobs'),

  submitResume: (payload) =>
    apiRequest('/jobfair/submit-resume', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Scoring
  getLeaderboard: (competitionId, round = 1) =>
    apiRequest(`/scoring/leaderboard/${competitionId}?round=${round}`),
};
