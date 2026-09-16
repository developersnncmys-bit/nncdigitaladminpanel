'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Lead } from '@/lib/types';
import * as api from '@/lib/api';
import { useAuthUser } from '@/lib/useAuthUser';

interface AddLeadContextType {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
  leads: Lead[];
  loading: boolean;
  // Authoritative counts from the server. Null until first fetched.
  stats: api.LeadStats | null;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addNote: (id: string, text: string, author?: string) => void;
  refresh: () => void;
  reloadStats: () => void;
}

const AddLeadContext = createContext<AddLeadContextType>({
  open: false,
  openModal: () => {},
  closeModal: () => {},
  leads: [],
  loading: true,
  stats: null,
  addLead: () => {},
  updateLead: () => {},
  deleteLead: () => {},
  addNote: () => {},
  refresh: () => {},
  reloadStats: () => {},
});

export function AddLeadProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthUser();
  const [open, setOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<api.LeadStats | null>(null);

  // Mirror of leads.length so the poll can detect new leads without re-creating
  // the interval on every list change.
  const countRef = useRef(0);
  useEffect(() => { countRef.current = leads.length; }, [leads]);

  const refresh = useCallback(async () => {
    try {
      const list = await api.listLeads();
      setLeads(list);
      countRef.current = list.length;
    } catch {
      // Silent — keep showing the leads we already have.
    } finally {
      setLoading(false);
    }
  }, []);

  // Cheap, authoritative counts. Also the new-lead detector: if the total
  // changed, re-fetch the list once.
  const loadStats = useCallback(async () => {
    try {
      const s = await api.getLeadStats();
      if (s.total !== countRef.current) await refresh();
      setStats(s);
    } catch {
      // ignore transient errors (cold start / offline)
    }
  }, [refresh]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { loadStats(); }, [loadStats]);

  // Poll the cheap stats every 10s (drives counts + new-lead chime).
  useEffect(() => {
    const id = setInterval(() => { loadStats(); }, 10_000);
    return () => clearInterval(id);
  }, [loadStats]);

  // Re-check on tab focus (background tabs throttle timers).
  useEffect(() => {
    const onVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadStats();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisible);
      return () => document.removeEventListener('visibilitychange', onVisible);
    }
  }, [loadStats]);

  const addLead = async (lead: Lead) => {
    try {
      const created = await api.createLead(lead);
      setLeads((prev) => [created, ...prev]);
    } catch (err) {
      console.error('Failed to add lead:', err);
    }
  };

  // Optimistic update, then reconcile with the saved document.
  const updateLead = async (id: string, updates: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    try {
      const saved = await api.updateLead(id, updates);
      setLeads((prev) => prev.map((l) => (l.id === id ? saved : l)));
    } catch (err) {
      console.error('Failed to update lead:', err);
      refresh();
    }
  };

  const deleteLead = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    try {
      await api.deleteLead(id);
    } catch (err) {
      console.error('Failed to delete lead:', err);
      refresh();
    }
  };

  const addNote = async (id: string, text: string, author = 'Admin') => {
    try {
      const saved = await api.addLeadNote(id, text, author);
      setLeads((prev) => prev.map((l) => (l.id === id ? saved : l)));
    } catch (err) {
      console.error('Failed to add note:', err);
      refresh();
    }
  };

  // Until auth loads, show nothing (avoids a flash before the token is ready).
  const visibleLeads = auth.role ? leads : [];

  return (
    <AddLeadContext.Provider value={{
      open,
      openModal: () => setOpen(true),
      closeModal: () => setOpen(false),
      leads: visibleLeads,
      loading,
      stats,
      addLead,
      updateLead,
      deleteLead,
      addNote,
      refresh,
      reloadStats: loadStats,
    }}>
      {children}
    </AddLeadContext.Provider>
  );
}

export const useAddLead = () => useContext(AddLeadContext);
