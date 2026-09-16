import type { Lead, User, Blog, Career } from './types';

// ── Backend API client ───────────────────────────────────────────────────
// Talks to the NNC Digital Node/Express backend (see /backend). The base URL
// comes from NEXT_PUBLIC_API_URL and falls back to the local dev server.
const BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://nncdigitalbackend.vercel.app/api').replace(/\/$/, '');

const TOKEN_KEY = 'crm-token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable — ignore
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | undefined>;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query } = opts;

  let url = `${BASE}${path}`;
  if (query) {
    const qs = Object.entries(query)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
      .join('&');
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // non-JSON error body — keep the default message
    }
    // A 401 on a request that carried a token means the session expired or was
    // revoked. Clear it and bounce to login (but not for the login call itself,
    // which sends no token and legitimately 401s on wrong credentials).
    if (res.status === 401 && token && typeof window !== 'undefined') {
      setToken(null);
      try {
        localStorage.removeItem('crm-auth');
      } catch {
        // ignore
      }
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/* ── Leads ─────────────────────────────────────────────── */

export async function listLeads(): Promise<Lead[]> {
  return request<Lead[]>('/leads');
}

export async function getLead(id: string): Promise<Lead> {
  return request<Lead>(`/leads/${id}`);
}

export interface LeadStats {
  new: number; overdue: number; today: number; followup: number;
  inprocess: number; converted: number; dead: number; total: number;
}

export async function getLeadStats(assignedTo?: string): Promise<LeadStats> {
  return request<LeadStats>('/leads/stats', { query: { assignedTo } });
}

export async function createLead(payload: Partial<Lead>): Promise<Lead> {
  return request<Lead>('/leads', { method: 'POST', body: payload });
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  return request<Lead>(`/leads/${id}`, { method: 'PUT', body: updates });
}

export async function deleteLead(id: string): Promise<void> {
  await request<{ message: string }>(`/leads/${id}`, { method: 'DELETE' });
}

export async function addLeadNote(id: string, text: string, author = 'Admin'): Promise<Lead> {
  return request<Lead>(`/leads/${id}/notes`, { method: 'POST', body: { text, author } });
}

/* ── Users ─────────────────────────────────────────────── */

export async function listUsers(): Promise<User[]> {
  return request<User[]>('/users');
}

export async function createUser(payload: Partial<User>): Promise<User> {
  return request<User>('/users', { method: 'POST', body: payload });
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  return request<User>(`/users/${id}`, { method: 'PUT', body: updates });
}

export async function deleteUser(id: string): Promise<void> {
  await request<{ message: string }>(`/users/${id}`, { method: 'DELETE' });
}

export async function login(username: string, password: string): Promise<User> {
  const { token, user } = await request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: { username, password },
  });
  setToken(token);
  return user;
}

export function logout() {
  setToken(null);
}

/* ── Blogs ─────────────────────────────────────────────── */

export async function listBlogs(): Promise<Blog[]> {
  return request<Blog[]>('/blogs');
}

export async function createBlog(payload: Partial<Blog>): Promise<Blog> {
  return request<Blog>('/blogs', { method: 'POST', body: payload });
}

export async function updateBlog(id: string, updates: Partial<Blog>): Promise<Blog> {
  return request<Blog>(`/blogs/${id}`, { method: 'PUT', body: updates });
}

export async function deleteBlog(id: string): Promise<void> {
  await request<{ message: string }>(`/blogs/${id}`, { method: 'DELETE' });
}

/* ── Careers ────────────────────────────────────────────── */

export async function listCareers(): Promise<Career[]> {
  return request<Career[]>('/careers');
}

export async function createCareer(payload: Partial<Career>): Promise<Career> {
  return request<Career>('/careers', { method: 'POST', body: payload });
}

export async function updateCareer(id: string, updates: Partial<Career>): Promise<Career> {
  return request<Career>(`/careers/${id}`, { method: 'PUT', body: updates });
}

export async function deleteCareer(id: string): Promise<void> {
  await request<{ message: string }>(`/careers/${id}`, { method: 'DELETE' });
}
