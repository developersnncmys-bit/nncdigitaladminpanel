'use client';

import { createContext, useContext, useState } from 'react';
import { Blog } from '@/lib/types';

interface EditBlogContextType {
  blog: Blog | null;
  openModal: (blog: Blog) => void;
  closeModal: () => void;
}

const EditBlogContext = createContext<EditBlogContextType>({
  blog: null,
  openModal: () => {},
  closeModal: () => {},
});

export function EditBlogProvider({ children }: { children: React.ReactNode }) {
  const [blog, setBlog] = useState<Blog | null>(null);
  return (
    <EditBlogContext.Provider value={{ blog, openModal: (b) => setBlog(b), closeModal: () => setBlog(null) }}>
      {children}
    </EditBlogContext.Provider>
  );
}

export const useEditBlog = () => useContext(EditBlogContext);
