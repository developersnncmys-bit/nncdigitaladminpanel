'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Blog } from '@/lib/types';
import * as api from '@/lib/api';

interface BlogContextType {
  blogs: Blog[];
  loading: boolean;
  addBlog: (blog: Partial<Blog>) => Promise<Blog | null>;
  updateBlog: (id: string, updates: Partial<Blog>) => Promise<Blog | null>;
  deleteBlog: (id: string) => void;
  refresh: () => void;
}

const BlogContext = createContext<BlogContextType>({
  blogs: [],
  loading: true,
  addBlog: async () => null,
  updateBlog: async () => null,
  deleteBlog: () => {},
  refresh: () => {},
});

export function BlogProvider({ children }: { children: React.ReactNode }) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setBlogs(await api.listBlogs());
    } catch (err) {
      console.error('Failed to load blogs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addBlog = async (blog: Partial<Blog>) => {
    try {
      const created = await api.createBlog(blog);
      setBlogs((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('Failed to add blog:', err);
      return null;
    }
  };

  const updateBlog = async (id: string, updates: Partial<Blog>) => {
    try {
      const saved = await api.updateBlog(id, updates);
      setBlogs((prev) => prev.map((b) => (b.id === id ? saved : b)));
      return saved;
    } catch (err) {
      console.error('Failed to update blog:', err);
      return null;
    }
  };

  const deleteBlog = async (id: string) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    try {
      await api.deleteBlog(id);
    } catch (err) {
      console.error('Failed to delete blog:', err);
      refresh();
    }
  };

  return (
    <BlogContext.Provider value={{ blogs, loading, addBlog, updateBlog, deleteBlog, refresh }}>
      {children}
    </BlogContext.Provider>
  );
}

export const useBlogs = () => useContext(BlogContext);
