/**
 * API Client for SkillGap Backend Service.
 * Connects to FastAPI on localhost or Render production URL.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      let errorMsg = `Server error ${res.status}`;
      try {
        const errorData = await res.json();
        errorMsg = errorData.detail || errorMsg;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  /** Health check endpoint (used to detect Render cold-start wake-up) */
  async checkHealth() {
    return request('/health');
  },

  /** Retrieves roles metadata and canonical skills by category */
  async getRoles() {
    return request('/api/v1/roles');
  },

  /** Runs ECLAT skill gap analysis for given role and possessed skills */
  async analyze({ role, possessed_skills, experience_mode = 'entry', top_k = 5 }) {
    return request('/api/v1/analyze', {
      method: 'POST',
      body: JSON.stringify({
        role,
        possessed_skills,
        experience_mode,
        top_k,
      }),
    });
  },

  /** Retrieves Leave-One-Out Hit-Rate@K validation benchmark metrics */
  async getMetrics() {
    return request('/api/v1/metrics');
  },
};
