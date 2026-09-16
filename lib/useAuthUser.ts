'use client';

import { useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const EMPTY: AuthUser = { id: '', name: '', email: '', role: '' };

// Reads the logged-in user saved at login (localStorage 'crm-auth'). Starts
// empty and fills in after mount to avoid a server/client hydration mismatch.
export function useAuthUser(): AuthUser {
  const [user, setUser] = useState<AuthUser>(EMPTY);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('crm-auth');
      if (raw) {
        const p = JSON.parse(raw);
        setUser({
          id: p.userId ?? '',
          name: p.name ?? '',
          email: p.email ?? '',
          role: p.role ?? '',
        });
      }
    } catch {
      // ignore malformed auth payload
    }
  }, []);

  return user;
}
