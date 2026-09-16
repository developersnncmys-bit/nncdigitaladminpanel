'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Career } from '@/lib/types';
import * as api from '@/lib/api';

interface CareerContextType {
  careers: Career[];
  loading: boolean;
  editing: Career | null;
  open: boolean;
  openCreate: () => void;
  openEdit: (career: Career) => void;
  closeEditor: () => void;
  addCareer: (career: Partial<Career>) => Promise<Career | null>;
  updateCareer: (id: string, updates: Partial<Career>) => Promise<Career | null>;
  deleteCareer: (id: string) => void;
  refresh: () => void;
}

const CareerContext = createContext<CareerContextType>({
  careers: [],
  loading: true,
  editing: null,
  open: false,
  openCreate: () => {},
  openEdit: () => {},
  closeEditor: () => {},
  addCareer: async () => null,
  updateCareer: async () => null,
  deleteCareer: () => {},
  refresh: () => {},
});

export function CareerProvider({ children }: { children: React.ReactNode }) {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Career | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setCareers(await api.listCareers());
    } catch (err) {
      console.error('Failed to load careers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (career: Career) => { setEditing(career); setOpen(true); };
  const closeEditor = () => { setOpen(false); setEditing(null); };

  const addCareer = async (career: Partial<Career>) => {
    try {
      const created = await api.createCareer(career);
      setCareers((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('Failed to add career:', err);
      return null;
    }
  };

  const updateCareer = async (id: string, updates: Partial<Career>) => {
    try {
      const saved = await api.updateCareer(id, updates);
      setCareers((prev) => prev.map((c) => (c.id === id ? saved : c)));
      return saved;
    } catch (err) {
      console.error('Failed to update career:', err);
      return null;
    }
  };

  const deleteCareer = async (id: string) => {
    setCareers((prev) => prev.filter((c) => c.id !== id));
    try {
      await api.deleteCareer(id);
    } catch (err) {
      console.error('Failed to delete career:', err);
      refresh();
    }
  };

  return (
    <CareerContext.Provider value={{
      careers, loading, editing, open,
      openCreate, openEdit, closeEditor,
      addCareer, updateCareer, deleteCareer, refresh,
    }}>
      {children}
    </CareerContext.Provider>
  );
}

export const useCareers = () => useContext(CareerContext);
