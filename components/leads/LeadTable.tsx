'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Trash2, Download, CheckCircle } from 'lucide-react';
import { Lead } from '@/lib/types';
import { formatDate } from '@/lib/format';
import * as api from '@/lib/api';
import { useAddLead } from '@/context/AddLeadContext';
import { useAuthUser } from '@/lib/useAuthUser';
import Pagination from '../Pagination';

const PAGE_SIZE = 10;

interface Props {
  leads: Lead[];
}

export default function LeadTable({ leads }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { deleteLead, updateLead, reloadStats } = useAddLead();
  const auth = useAuthUser();
  const mayDelete = auth.role === 'admin';
  const isAdmin = auth.role === 'admin';

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<number | null>(null);

  // Team member names for the assign dropdown.
  const [users, setUsers] = useState<string[]>([]);
  useEffect(() => {
    try {
      const cached = localStorage.getItem('crm-users');
      if (cached) setUsers(JSON.parse(cached).map((u: { name: string }) => u.name).filter(Boolean));
    } catch { /* ignore */ }
    api.listUsers()
      .then((list) => {
        try { localStorage.setItem('crm-users', JSON.stringify(list)); } catch { /* ignore */ }
        setUsers(list.map((u) => u.name).filter(Boolean));
      })
      .catch(() => { /* keep cached */ });
  }, []);

  // Always include the lead's current assignee even if not in the users list.
  const assignOptions = (current?: string) =>
    current && !users.includes(current) ? [current, ...users] : users;

  const initialPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const [page, setPage] = useState(initialPage);

  // Keep `page` in the URL so browser-back from a lead detail returns here.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const urlPage = Math.max(1, Number(params.get('page')) || 1);
    if (urlPage === page) return;
    if (page <= 1) params.delete('page');
    else params.set('page', String(page));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [page, pathname, router, searchParams]);

  useEffect(() => {
    const p = Math.max(1, Number(searchParams.get('page')) || 1);
    setPage((prev) => (prev === p ? prev : p));
  }, [searchParams]);

  const toggleSelect = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const toggleSelectAll = (rows: Lead[]) => {
    const ids = rows.map((l) => l.id);
    const allSelected = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const n = new Set(prev);
      ids.forEach((id) => (allSelected ? n.delete(id) : n.add(id)));
      return n;
    });
  };

  const confirmDeleteSelected = async () => {
    const ids = [...selected];
    setSelected(new Set());
    setConfirmDeleteOpen(false);
    const BATCH = 10;
    for (let i = 0; i < ids.length; i += BATCH) {
      await Promise.all(ids.slice(i, i + BATCH).map((id) => deleteLead(id)));
    }
    reloadStats();
    setDeleteSuccess(ids.length);
  };

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      !q ||
      l.name.toLowerCase().includes(q) ||
      (l.mobileNumber || '').includes(q) ||
      (l.email || '').toLowerCase().includes(q) ||
      (l.company || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const firstFilterRender = useRef(true);
  useEffect(() => {
    if (firstFilterRender.current) { firstFilterRender.current = false; return; }
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setPage((p) => Math.min(p, Math.max(1, totalPages))); }, [totalPages]);

  const exportCsv = () => {
    const headers = ['Date', 'Name', 'Email', 'Phone', 'Company', 'Team size', 'Assigned'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [headers.join(',')];
    for (const l of filtered) {
      lines.push([
        l.date, l.name, l.email, l.mobileNumber, l.company, l.teamSize, l.assignedTo || '',
      ].map(esc).join(','));
    }
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openLead = (id: string) => {
    const qs = searchParams.toString();
    const from = qs ? `${pathname}?${qs}` : pathname;
    router.push(`/leads/view?id=${id}&from=${encodeURIComponent(from)}`);
  };

  const AssignSelect = ({ lead }: { lead: Lead }) => {
    if (!isAdmin) {
      return (
        <span className="text-xs font-semibold text-gray-700">
          {lead.assignedTo || <span className="text-gray-400">Unassigned</span>}
        </span>
      );
    }
    return (
      <select
        value={lead.assignedTo || ''}
        onChange={(e) => updateLead(lead.id, { assignedTo: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        className="text-xs font-medium rounded-lg border border-gray-200 bg-white pl-2.5 pr-6 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-gray-700 max-w-[10rem]"
      >
        <option value="">Unassigned</option>
        {assignOptions(lead.assignedTo).map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all"
          />
        </div>
        <button
          onClick={exportCsv}
          title="Export these leads to CSV"
          className="w-full sm:w-auto justify-center flex items-center gap-1.5 px-3 py-2.5 border border-emerald-600 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          <Download className="w-4 h-4 text-white" />
          Export
        </button>
      </div>

      {/* Bulk action bar */}
      {mayDelete && selected.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 border-b border-emerald-100">
          <span className="text-sm font-semibold text-emerald-700">{selected.size} lead{selected.size > 1 ? 's' : ''} selected</span>
          <button
            onClick={() => setConfirmDeleteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Count */}
      <div className="px-4 py-2.5 bg-gray-50/50 border-b border-gray-50">
        <p className="text-xs text-gray-500 font-medium">
          Showing {filtered.length} of {leads.length} leads
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              {mayDelete && (
                <th className="pl-4 pr-2 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && filtered.every((l) => selected.has(l.id))}
                    ref={(el) => { if (el) el.indeterminate = filtered.some((l) => selected.has(l.id)) && !filtered.every((l) => selected.has(l.id)); }}
                    onChange={() => toggleSelectAll(filtered)}
                    className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                  />
                </th>
              )}
              <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Date</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Company</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden xl:table-cell">Team size</th>
              <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Assigned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={mayDelete ? 8 : 7} className="px-4 py-12 text-center text-gray-400 text-sm">
                  No leads found.
                </td>
              </tr>
            ) : (
              pageItems.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => openLead(lead.id)}
                  className={`hover:bg-emerald-50/30 transition-colors cursor-pointer ${selected.has(lead.id) ? 'bg-emerald-50/50' : ''}`}
                >
                  {mayDelete && (
                    <td className="pl-4 pr-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="px-3 py-3 text-xs text-gray-700 font-medium whitespace-nowrap hidden lg:table-cell">{formatDate(lead.date)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-600 text-[10px] font-bold">{(lead.name || '?')[0]}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 truncate">{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-700 truncate max-w-[12rem]">{lead.email || '—'}</td>
                  <td className="px-3 py-3 text-xs text-gray-900 font-semibold whitespace-nowrap">{lead.mobileNumber || '—'}</td>
                  <td className="px-3 py-3 text-xs text-gray-700 truncate max-w-[10rem]">{lead.company || '—'}</td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap hidden xl:table-cell">{lead.teamSize || '—'}</td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <AssignSelect lead={lead} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">No leads found.</div>
        ) : (
          pageItems.map((lead) => (
            <div
              key={lead.id}
              onClick={() => openLead(lead.id)}
              className="block px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-600 font-bold">{(lead.name || '?')[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{lead.name}</p>
                    <p className="text-sm font-semibold text-gray-800">{lead.mobileNumber || '—'}</p>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                  <AssignSelect lead={lead} />
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600 space-y-0.5">
                {lead.email && <p className="truncate">✉️ {lead.email}</p>}
                {lead.company && <p className="truncate">🏢 {lead.company}{lead.teamSize ? ` · ${lead.teamSize}` : ''}</p>}
                <p className="text-gray-400 font-medium">{formatDate(lead.date)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />


      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDeleteOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete {selected.size} lead{selected.size > 1 ? 's' : ''}?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setConfirmDeleteOpen(false)} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={confirmDeleteSelected} className="px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteSuccess !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteSuccess(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {deleteSuccess} lead{deleteSuccess > 1 ? 's' : ''} deleted successfully
            </h3>
            <p className="text-sm text-gray-500 mb-6">The list has been updated.</p>
            <button onClick={() => setDeleteSuccess(null)} className="px-6 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
