import { Lead, User, Blog, AuthUser } from './types';

// UI-only build: no sample data.
export const MOCK_AUTH_USER: AuthUser = {
  id: '',
  name: 'Admin',
  email: '',
  role: 'admin',
};

export const MOCK_USERS: User[] = [];

export const MOCK_LEADS: Lead[] = [];

export const MOCK_BLOGS: Blog[] = [];

export function getLeadsByStatus(status: string): Lead[] {
  return MOCK_LEADS.filter((l) => l.status === status);
}

export function getLeadById(id: string): Lead | undefined {
  return MOCK_LEADS.find((l) => l.id === id);
}

export function getDashboardStats() {
  return { new: 0, overdue: 0, today: 0, followup: 0, inprocess: 0, converted: 0, dead: 0, total: 0 };
}
