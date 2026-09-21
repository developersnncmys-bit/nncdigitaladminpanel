'use client';

import { useState, useEffect } from 'react';
import { X, UserPlus, CheckCircle } from 'lucide-react';
import { useAddLead } from '@/context/AddLeadContext';
import { LEAD_SOURCES } from '@/lib/constants';
import { INDIAN_STATES, districtsOf } from '@/lib/geo';
import type { Lead } from '@/lib/types';

interface FormData {
  name: string;
  email: string;
  mobileNumber: string;
  company: string;
  teamSize: string;
  state: string;
  district: string;
  source: string;
}

const INITIAL: FormData = { name: '', email: '', mobileNumber: '', company: '', teamSize: '', state: '', district: '', source: '' };

const TEAM_SIZES = ['1–5', '6–20', '21–50', '51–200', '200+'];

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 ${
    err ? 'border-red-300 focus:ring-red-400' : 'border-gray-200'
  }`;

export default function AddLeadModal() {
  const { open, closeModal, addLead } = useAddLead();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const set = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.mobileNumber.trim() && !form.email.trim()) e.mobileNumber = 'Enter a phone or email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const newLead: Lead = {
      id: crypto.randomUUID(),
      slNo: 0,
      name: form.name,
      email: form.email,
      mobileNumber: form.mobileNumber,
      company: form.company,
      teamSize: form.teamSize,
      state: form.state,
      district: form.district,
      status: 'new',
      notes: [],
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      leadType: 'manual',
      source: form.source || 'Manual',
    };
    await addLead(newLead);
    setLoading(false);
    setSuccess(true);
  };

  const handleClose = () => {
    closeModal();
    setTimeout(() => { setForm(INITIAL); setErrors({}); setSuccess(false); }, 300);
  };

  const handleAddAnother = () => { setForm(INITIAL); setErrors({}); setSuccess(false); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Add New Lead</h2>
              <p className="text-xs text-gray-400">Fill in the details below</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Lead Added Successfully!</h3>
              <p className="text-sm text-gray-400">The lead has been added to your list.</p>
              <div className="flex gap-3 mt-1">
                <button onClick={handleAddAnother} className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">Add Another</button>
                <button onClick={handleClose} className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">Close</button>
              </div>
            </div>
          ) : (
            <form id="add-lead-form" onSubmit={handleSubmit} className="space-y-3">
              <Field label="Full Name" required error={errors.name}>
                <input type="text" placeholder="Priya Sharma" value={form.name} onChange={set('name')} className={inputCls(errors.name)} />
              </Field>
              <Field label="Work Email" error={errors.email}>
                <input type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} className={inputCls(errors.email)} />
              </Field>
              <Field label="Phone" error={errors.mobileNumber}>
                <input type="tel" placeholder="98765 43210" value={form.mobileNumber} onChange={set('mobileNumber')} className={inputCls(errors.mobileNumber)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Company">
                  <input type="text" placeholder="Acme Pvt. Ltd." value={form.company} onChange={set('company')} className={inputCls()} />
                </Field>
                <Field label="Team size">
                  <select value={form.teamSize} onChange={set('teamSize')} className={inputCls()}>
                    <option value="">Select</option>
                    {TEAM_SIZES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="State">
                  <select
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value, district: '' }))}
                    className={inputCls()}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                </Field>
                <Field label="District">
                  <select value={form.district} onChange={set('district')} disabled={!form.state} className={inputCls()}>
                    <option value="">{form.state ? 'Select district' : 'Select a state first'}</option>
                    {districtsOf(form.state).map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Source">
                <select value={form.source} onChange={set('source')} className={inputCls()}>
                  <option value="">Select source</option>
                  {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </form>
          )}
        </div>

        {!success && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <button type="button" onClick={handleClose} className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="submit" form="add-lead-form" disabled={loading} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-200">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
