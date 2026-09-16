'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import MobileDrawer from '@/components/layout/MobileDrawer';
import AddLeadModal from '@/components/leads/AddLeadModal';
import { AddLeadProvider } from '@/context/AddLeadContext';
import AddBlogModal from '@/components/blogs/AddBlogModal';
import { AddBlogProvider } from '@/context/AddBlogContext';
import EditBlogModal from '@/components/blogs/EditBlogModal';
import { EditBlogProvider } from '@/context/EditBlogContext';
import { BlogProvider } from '@/context/BlogContext';
import { CareerProvider } from '@/context/CareerContext';
import CareerEditorModal from '@/components/careers/CareerEditorModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auth gate: the dashboard is client-rendered, so guard it here. Until we've
  // confirmed a saved login (localStorage 'crm-auth'), show a spinner. If none
  // is found, send the user to /login — so opening the app cold lands on the
  // login page, not straight on the dashboard.
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    let ok = false;
    try {
      const raw = localStorage.getItem('crm-auth');
      // Require BOTH a saved user AND an API token. A stale crm-auth without a
      // token (e.g. from before the backend was wired) must re-login so the
      // token is issued — otherwise every data fetch 401s.
      ok = !!raw && !!JSON.parse(raw)?.userId && !!localStorage.getItem('crm-token');
    } catch {
      ok = false;
    }
    if (ok) setAuthed(true);
    else router.replace('/login');
  }, [router]);

  if (!authed) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50/80">
        <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AddLeadProvider>
      <BlogProvider>
      <CareerProvider>
      <AddBlogProvider>
        <EditBlogProvider>
          <div className="h-full flex bg-slate-50/80">
            <Sidebar />
            <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

            <div className="flex-1 min-w-0 flex flex-col lg:ml-64 min-h-screen">
              <Header onMenuToggle={() => setDrawerOpen(true)} />
              <main className="flex-1 p-5 lg:p-6 pb-24 lg:pb-8 animate-fade-in overflow-x-hidden">
                {children}
              </main>
            </div>

            <BottomNav />
            <AddLeadModal />
            <AddBlogModal />
            <EditBlogModal />
            <CareerEditorModal />
          </div>
        </EditBlogProvider>
      </AddBlogProvider>
      </CareerProvider>
      </BlogProvider>
    </AddLeadProvider>
  );
}
