'use client';

import Link from 'next/link';
import { Briefcase, Plus, Edit3, Trash2, ArrowLeft, MapPin, Clock } from 'lucide-react';
import { useCareers } from '@/context/CareerContext';

export default function CareersAdminPage() {
  const { careers, loading, openCreate, openEdit, deleteCareer } = useCareers();

  const open = careers.filter((c) => c.status === 'open').length;
  const closed = careers.length - open;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="p-2 rounded-xl border border-gray-200 hover:bg-white transition-colors"
            title="Back to Settings"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-sm shadow-violet-200">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Careers</h1>
            <p className="text-sm text-gray-400">Roles shown on the website Careers page</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-200"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Role</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Total Roles', value: careers.length, from: 'from-violet-500', to: 'to-violet-600' },
          { label: 'Open',        value: open,            from: 'from-emerald-500', to: 'to-emerald-600' },
          { label: 'Closed',      value: closed,          from: 'from-gray-400', to: 'to-gray-500' },
        ].map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.from} ${s.to} rounded-2xl p-3 sm:p-5 text-white shadow-sm`}>
            <p className="text-2xl sm:text-3xl font-bold">{s.value}</p>
            <p className="text-white/80 text-[10px] sm:text-xs font-semibold uppercase tracking-wide mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-sm font-bold text-gray-900">Open Roles</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${careers.length} role${careers.length === 1 ? '' : 's'}`}
          </p>
        </div>

        <div className="divide-y divide-gray-50">
          {careers.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-400">
              {loading ? 'Loading roles…' : 'No roles yet — click "Add Role" to create one.'}
            </p>
          ) : careers.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-3 px-5 py-4 hover:bg-gray-50/60 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    c.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {c.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-1.5 text-xs text-gray-500">
                  {c.department && <span className="font-medium text-gray-600">{c.department}</span>}
                  {c.type       && <span>{c.type}</span>}
                  {c.location   && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</span>}
                  {c.experience && <span className="flex items-center gap-1"><Clock  className="w-3 h-3" />{c.experience}</span>}
                </div>
                {c.tags && c.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.tags.map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(c)}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (confirm(`Delete "${c.title}"?`)) deleteCareer(c.id); }}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
