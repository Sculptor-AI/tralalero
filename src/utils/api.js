// API client for Cloudflare Workers backend

const API_BASE = '/api';

// Token management
let authToken = localStorage.getItem('auth_token');

export function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken() {
  return authToken;
}

// Generic fetch wrapper
async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth API
export const auth = {
  async signup(name, email, password) {
    const data = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async login(email, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  async me() {
    return await apiFetch('/auth/me');
  },

  async updateProfile(updates) {
    return await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// Boards API
export const boards = {
  async list() {
    return await apiFetch('/boards');
  },

  async get(boardId) {
    return await apiFetch(`/boards/${boardId}`);
  },

  async create(name, icon, color) {
    return await apiFetch('/boards', {
      method: 'POST',
      body: JSON.stringify({ name, icon, color }),
    });
  },

  async update(boardId, updates) {
    return await apiFetch(`/boards/${boardId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(boardId) {
    return await apiFetch(`/boards/${boardId}`, {
      method: 'DELETE',
    });
  },

  async reorderColumns(boardId, columnOrder) {
    return await apiFetch(`/boards/${boardId}/columns`, {
      method: 'PUT',
      body: JSON.stringify({ columnOrder }),
    });
  },
};

// Columns API
export const columns = {
  async create(boardId, title) {
    return await apiFetch(`/boards/${boardId}/columns`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async update(columnId, updates) {
    return await apiFetch(`/columns/${columnId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(columnId) {
    return await apiFetch(`/columns/${columnId}`, {
      method: 'DELETE',
    });
  },
};

// Cards API
export const cards = {
  async create(columnId, cardData) {
    return await apiFetch(`/columns/${columnId}/cards`, {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  },

  async get(cardId) {
    return await apiFetch(`/cards/${cardId}`);
  },

  async update(cardId, updates) {
    return await apiFetch(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(cardId) {
    return await apiFetch(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  },

  async move(cardId, sourceColumnId, targetColumnId, newPosition) {
    return await apiFetch('/cards/move', {
      method: 'POST',
      body: JSON.stringify({ cardId, sourceColumnId, targetColumnId, newPosition }),
    });
  },
};

export default { auth, boards, columns, cards };
