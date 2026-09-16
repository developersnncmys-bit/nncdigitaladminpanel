'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, Trash2, MessageCircle, MessageSquare, Send,
} from 'lucide-react';
import type { Lead, LeadStatus } from '@/lib/types';
import { STATUS_CONFIG, LEAD_STATUSES } from '@/lib/constants';
import { formatDate, formatTime } from '@/lib/format';
import * as api from '@/lib/api';
import { useAddLead } from '@/context/AddLeadContext';
import { useAuthUser } from '@/lib/useAuthUser';

export default function LeadViewPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const leadId = searchParams.get('id') || '';
  const from = searchParams.get('from') || '/leads/new';

  const { leads, updateLead, deleteLead, addNote } = useAddLead();
  const auth = useAuthUser();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
  const [followDate, setFollowDate] = useState('');
  const noteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const found = leads.find((l) => l.id === leadId);
    if (found) { setLead(found); setLoading(false); return; }
    let active = true;
    api.getLead(leadId)
      .then((l) => { if (active) setLead(l); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [leadId, leads]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">Lead not found.</p>
        <button onClick={() => router.push('/leads/new')} className="mt-4 text-emerald-600 font-semibold text-sm">← Back to leads</button>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[lead.status];
  const NEEDS_DATE: LeadStatus[] = ['followup', 'today', 'overdue'];

  const openStatusChange = (status: LeadStatus) => {
    const today = new Date().toISOString().slice(0, 10);
    setFollowDate(lead.followUpDate || (status === 'today' ? today : ''));
    setPendingStatus(status);
  };

  const applyStatusChange = () => {
    if (!pendingStatus) return;
    const updates: Partial<Lead> = { status: pendingStatus };
    if (NEEDS_DATE.includes(pendingStatus)) updates.followUpDate = followDate;
    updateLead(lead.id, updates);
    const target = pendingStatus;
    setPendingStatus(null);
    router.push(`/leads/${target}`);
  };

  const submitNote = () => {
    const text = note.trim();
    if (!text) return;
    addNote(lead.id, text, auth.name || 'Admin');
    setLead({ ...lead, notes: [...(lead.notes || []), { id: crypto.randomUUID(), text, author: auth.name || 'Admin', createdAt: new Date().toISOString() }] });
    setNote('');
  };

  const doDelete = () => {
    deleteLead(lead.id);
    router.push('/leads/new');
  };

  const phoneDigits = (lead.mobileNumber || '').replace(/\D/g, '');
  const initials = (lead.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const Stat = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">{label}</p>
      <p className="text-sm font-bold text-white mt-1 truncate">{value || '—'}</p>
    </div>
  );

  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <div className="px-3.5 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl bg-gray-50 min-h-[42px] break-words">{value || '—'}</div>
    </div>
  );

  return (
    <div className="w-full space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => router.push(from)} className="flex items-center gap-2 font-semibold text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-700 truncate">{lead.name}</span>
      </div>

      {/* Dark header card */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold">{initials}</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold truncate">{lead.name}</h1>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mt-0.5">
                {lead.leadType === 'website' ? 'Website lead' : 'Manual lead'}
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-sm text-white/80">
                {lead.mobileNumber && <a href={`tel:${lead.mobileNumber}`} className="inline-flex items-center gap-1.5 hover:text-white"><Phone className="w-3.5 h-3.5" /> {lead.mobileNumber}</a>}
                {lead.email && <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 hover:text-white"><Mail className="w-3.5 h-3.5" /> {lead.email}</a>}
              </div>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.color} flex-shrink-0`}>{cfg.label}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <Stat label="Company" value={lead.company} />
          <Stat label="Team size" value={lead.teamSize} />
          <Stat label="Source" value={lead.source || ''} />
          <Stat label="Date" value={`${formatDate(lead.date)} · ${formatTime(lead.createdAt)}`} />
        </div>
      </div>

      {/* Lead Information */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900">Lead Information</h2>
        <p className="text-xs text-gray-400 mb-5">Details submitted with this lead</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoField label="Date" value={formatDate(lead.date)} />
          <InfoField label="Time" value={formatTime(lead.createdAt)} />
          <InfoField label="Full Name" value={lead.name} />
          <InfoField label="Work Email" value={lead.email} />
          <InfoField label="Phone" value={lead.mobileNumber} />
          <InfoField label="Company" value={lead.company} />
          <InfoField label="Team Size" value={lead.teamSize} />
          <InfoField label="Source" value={lead.source || ''} />
          <InfoField label="Status" value={cfg.label} />
          {lead.followUpDate && <InfoField label="Follow-up Date" value={formatDate(lead.followUpDate)} />}
        </div>
      </div>

      {/* Action bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2">
        {lead.mobileNumber && (
          <a href={`tel:${lead.mobileNumber}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-colors">
            <Phone className="w-4 h-4" /> Call
          </a>
        )}
        {phoneDigits && (
          <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        )}
        <button onClick={() => noteRef.current?.focus()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors">
          <MessageSquare className="w-4 h-4" /> Comment
        </button>

        <span className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

        {/* Status change buttons — Overdue is set automatically, not manually. */}
        {LEAD_STATUSES.filter((s) => s !== lead.status && s !== 'overdue').map((s) => {
          const c = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => openStatusChange(s)}
              className={`text-xs font-semibold px-3.5 py-2.5 rounded-xl border transition-all ${c.bg} ${c.color} ${c.border} hover:brightness-95`}
            >
              {c.label}
            </button>
          );
        })}

        {auth.role === 'admin' && (
          <button onClick={() => setConfirmDelete(true)} className="ml-auto inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Activity / notes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-gray-500" />
          <h2 className="font-bold text-gray-900">Activity</h2>
        </div>
        <div className="flex items-center gap-2 mb-5">
          <input
            ref={noteRef}
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitNote(); }}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button onClick={submitNote} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <Send className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        {(lead.notes || []).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...(lead.notes || [])].reverse().map((n) => (
              <div key={n.id} className="flex gap-3">
                <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 text-[10px] font-bold">{(n.author || 'A')[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-800">{n.text}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{n.author} · {formatDate(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status-change confirmation popup */}
      {pendingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPendingStatus(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${STATUS_CONFIG[pendingStatus].bg}`}>
              <span className={`w-3 h-3 rounded-full ${STATUS_CONFIG[pendingStatus].dot}`} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Change status?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Move this lead to <span className={`font-semibold ${STATUS_CONFIG[pendingStatus].color}`}>{STATUS_CONFIG[pendingStatus].label}</span>?
            </p>
            {NEEDS_DATE.includes(pendingStatus) && (
              <div className="mb-5 text-left">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Follow-up date</label>
                <input
                  type="date"
                  value={followDate}
                  onChange={(e) => setFollowDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
            <div className="flex justify-center gap-3">
              <button onClick={() => setPendingStatus(null)} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button
                onClick={applyStatusChange}
                disabled={NEEDS_DATE.includes(pendingStatus) && !followDate}
                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete this lead?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setConfirmDelete(false)} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={doDelete} className="px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
