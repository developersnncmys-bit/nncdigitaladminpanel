'use client';

import { createContext, useContext, useState } from 'react';

interface AddBlogContextType {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const AddBlogContext = createContext<AddBlogContextType>({
  open: false,
  openModal: () => {},
  closeModal: () => {},
});

export function AddBlogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AddBlogContext.Provider value={{ open, openModal: () => setOpen(true), closeModal: () => setOpen(false) }}>
      {children}
    </AddBlogContext.Provider>
  );
}

export const useAddBlog = () => useContext(AddBlogContext);
