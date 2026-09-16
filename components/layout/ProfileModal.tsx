'use client';

import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, UserCircle, CheckCircle } from 'lucide-react';
import { MOCK_AUTH_USER, MOCK_USERS } from '@/lib/mockData';
import type { User } from '@/lib/types';

interface Props {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: Props) {
  const authUser = MOCK_AUTH_USER;
  const initials = authUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  useEffect(() => {
    const stored = localStorage.getItem('crm-users');
    const users: User[] = stored ? JSON.parse(stored) : MOCK_USERS;
    const me = users.find((u) => u.id === authUser.id) ?? users[0];
    setForm({ name: me.name, username: me.username, email: me.email, phone: me.phone || '', password: '' });
  }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.username.trim()) e.username = 'Required';
    else if (/\s/.test(form.username)) e.username = 'No spaces allowed';
    if (form.password && form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const stored = localStorage.getItem('crm-users');
    const users: User[] = stored ? JSON.parse(stored) : MOCK_USERS;
    const updated = users.map((u) =>
      u.id === authUser.id
        ? {
            ...u,
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            username: form.username.trim(),
            ...(form.password ? { password: form.password } : {}),
          }
        : u
    );
    localStorage.setItem('crm-users', JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1500);
  };

  const inp = (err?: string) =>
    `w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 ${err ? 'border-red-300' : 'border-gray-200'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">My Profile</h2>
              <p className="text-xs text-gray-400">Update your account & login credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center shadow-md shadow-emerald-200">
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-0.5 rounded-full capitalize">
              {authUser.role}
            </span>
          </div>

          <div className="border-t border-gray-50" />

          {/* Profile fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={set('name')} className={inp(errors.name)} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className={inp(errors.email)} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="Enter mobile number" className={inp()} />
            </div>
          </div>

          <div className="border-t border-gray-50 pt-4 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Login Credentials</p>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Username
                <span className="text-xs text-gray-400 font-normal ml-1">— used to sign in</span>
              </label>
              <input type="text" value={form.username} onChange={set('username')} autoComplete="off" className={inp(errors.username)} />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
                <span className="text-xs text-gray-400 font-normal ml-1">— leave blank to keep current</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="New password (min. 6 characters)"
                  className={`${inp(errors.password)} pr-11`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-sm ${
              saved ? 'bg-emerald-500 shadow-emerald-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            {saved && <CheckCircle className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
