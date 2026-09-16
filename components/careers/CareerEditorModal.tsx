'use client';

import { useState, useEffect } from 'react';
import { X, Briefcase, CheckCircle } from 'lucide-react';
import { useCareers } from '@/context/CareerContext';
import type { CareerType } from '@/lib/types';

interface FormState {
  title: string;
  department: string;
  type: CareerType;
  location: string;
  experience: string;
  description: string;
  tagsCsv: string;
  status: 'open' | 'closed';
}

const INITIAL: FormState = {
  title: '', department: '', type: 'Full-time', location: 'Bangalore',
  experience: '', description: '', tagsCsv: '', status: 'open',
};

const TYPES: CareerType[] = ['Full-time', 'Part-time', 'Internship', 'Contract'];

const inp = (err?: string) =>
  `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 ${err ? 'border-red-300 focus:ring-red-400' : 'border-gray-200'}`;

export default function CareerEditorModal() {
  const { open, editing, closeEditor, addCareer, updateCareer } = useCareers();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Sync form with editing context whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        title: editing.title,
        department: editing.department || '',
        type: editing.type || 'Full-time',
        location: editing.location || 'Bangalore',
        experience: editing.experience || '',
        description: editing.description || '',
        tagsCsv: (editing.tags || []).join(', '),
        status: editing.status || 'open',
      });
    } else {
      setForm(INITIAL);
    }
    setError('');
    setDone(false);
  }, [open, editing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeEditor(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, closeEditor]);

  if (!open) return null;

  const set = <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value as FormState[K] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    const payload = {
      title: form.title.trim(),
      department: form.department.trim(),
      type: form.type,
      location: form.location.trim(),
      experience: form.experience.trim(),
      description: form.description.trim(),
      tags: form.tagsCsv.split(',').map((t) => t.trim()).filter(Boolean),
      status: form.status,
    };
    const saved = editing
      ? await updateCareer(editing.id, payload)
      : await addCareer(payload);
    setLoading(false);
    if (saved) setDone(true);
    else setError('Could not save. Please try again.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeEditor} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {editing ? 'Edit Role' : 'Add New Role'}
              </h2>
              <p className="text-xs text-gray-400 truncate max-w-xs">
                {editing?.title || 'Fill in the role details below'}
              </p>
            </div>
          </div>
          <button onClick={closeEditor} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {done ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{editing ? 'Role Updated!' : 'Role Created!'}</h3>
              <button
                onClick={closeEditor}
                className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form id="career-editor-form" onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="e.g. Customer Support Associate" value={form.title} onChange={set('title')} className={inp()} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Department</label>
                  <input type="text" placeholder="e.g. Operations" value={form.department} onChange={set('department')} className={inp()} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
                  <select value={form.type} onChange={set('type')} className={inp()}>
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Location</label>
                  <input type="text" placeholder="e.g. Bangalore, KA" value={form.location} onChange={set('location')} className={inp()} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Experience</label>
                  <input type="text" placeholder="e.g. 1-3 years" value={form.experience} onChange={set('experience')} className={inp()} />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                  <input type="text" placeholder="e.g. Documentation, KYC, Government Portals" value={form.tagsCsv} onChange={set('tagsCsv')} className={inp()} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                  <select value={form.status} onChange={set('status')} className={inp()}>
                    <option value="open">Open (visible on website)</option>
                    <option value="closed">Closed (hidden)</option>
                  </select>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                <textarea
                  placeholder="What will the candidate do? Short paragraph shown on the role card."
                  value={form.description}
                  onChange={set('description')}
                  rows={5}
                  className={`${inp()} resize-y`}
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <button
              type="button"
              onClick={closeEditor}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="career-editor-form"
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-200"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Briefcase className="w-4 h-4" />
              }
              {loading ? 'Saving...' : editing ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
