'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Camera, UserCircle } from 'lucide-react';
import { MOCK_AUTH_USER, MOCK_USERS } from '@/lib/mockData';
import Link from 'next/link';

export default function ProfilePage() {
  const authUser = MOCK_AUTH_USER;
  const fullUser = MOCK_USERS.find((u) => u.id === authUser.id)!;
  const initials = authUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const [form, setForm] = useState({
    name: fullUser.name,
    email: fullUser.email,
    phone: fullUser.phone || '',
    username: fullUser.username,
    password: fullUser.password,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('crm-profile');
    if (stored) {
      const data = JSON.parse(stored);
      setForm((f) => ({ ...f, ...data }));
    }
  }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    localStorage.setItem('crm-profile', JSON.stringify({
      name: form.name,
      email: form.email,
      phone: form.phone,
      username: form.username,
      password: form.password,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all text-gray-900';

  return (
    <div className="space-y-5 max-w-2xl">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <UserCircle className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500">Manage your account details</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center shadow-md shadow-emerald-200">
            <span className="text-white text-2xl font-bold">{initials}</span>
          </div>
          <button className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors">
            <Camera className="w-4 h-4" />
            Change Photo
          </button>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-0.5 rounded-full capitalize">
            {authUser.role}
          </span>
        </div>

        <div className="border-t border-gray-50" />

        {/* Form fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
            <input type="text" value={form.name} onChange={set('name')} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="Enter mobile number" className={inputClass} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={set('email')} className={inputClass} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
            <input type="text" value={form.username} onChange={set('username')} className={inputClass} />
          </div>
        </div>

        {/* Password section */}
        <div className="border-t border-gray-50 pt-5 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="relative max-w-sm">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button className="text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors">
            Change Password
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <Link
            href="/"
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>

          <button
            onClick={handleSave}
            className={`px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm ${
              saved ? 'bg-emerald-500 shadow-emerald-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
