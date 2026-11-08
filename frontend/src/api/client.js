/**
 * API Client for SkillGap Backend Service.
 * Automatic failover between local FastAPI server and live Render cloud API.
 */

const CANDIDATE_HOSTS = [
  import.meta.env.VITE_API_BASE_URL,
  'http://127.0.0.1:8000',
  'http://localhost:8000',
  'https://eclatt-skill-gap-analyzer.onrender.com',
].filter(Boolean);

// Deduplicate hosts
const HOSTS = [...new Set(CANDIDATE_HOSTS)];
let activeHost = HOSTS[0];

async function request(endpoint, options = {}) {
  let lastError = null;
  const tryHosts = [activeHost, ...HOSTS.filter((h) => h !== activeHost)];

  for (const host of tryHosts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const url = `${host}${endpoint}`;

      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        signal: controller.signal,
        ...options,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorMsg = `Server error ${res.status}`;
        try {
          const errorData = await res.json();
          errorMsg = errorData.detail || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      // Cache the responsive host
      activeHost = host;
      return await res.json();
    } catch (err) {
      lastError = err;
      console.warn(`Host ${host} failed for ${endpoint}:`, err.message);
    }
  }

  throw lastError || new Error('All backend API endpoints are unreachable.');
}

export const api = {
  /** Active host getter */
  getActiveHost() {
    return activeHost;
  },

  /** Health check endpoint */
  async checkHealth() {
    return request('/health');
  },

  /** Retrieves roles metadata and canonical skills by category */
  async getRoles() {
    return request('/api/v1/roles');
  },

  /** Runs ECLAT skill gap analysis for given role and possessed skills */
  async analyze({ role, possessed_skills, experience_mode = 'entry', top_k = 6 }) {
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
