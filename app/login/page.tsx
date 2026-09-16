'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, ArrowRight, FileText, Briefcase, Award } from 'lucide-react';
import * as api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await api.login(form.username, form.password);
      localStorage.setItem(
        'crm-auth',
        JSON.stringify({ userId: user.id, name: user.name, role: user.role, email: user.email })
      );
      router.push('/');
    } catch (err) {
      setError((err as Error).message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand panel (hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 45%, #065f46 75%, #0d9488 100%)' }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glowing orbs */}
        <div className="absolute top-1/4 -right-24 w-80 h-80 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -left-24 w-80 h-80 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-2/3 right-1/3 w-48 h-48 bg-violet-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-[72px] h-[72px] rounded-2xl bg-white flex items-center justify-center p-2 shadow-lg shadow-black/20">
              <img src="/nnc-mark.png" alt="NNC Digital" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight tracking-tight">NNC Digital</p>
              <p className="text-emerald-400 text-xs font-medium tracking-widest uppercase">CRM Lead Dashboard</p>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
            Welcome<br />to your<br />
            <span className="text-emerald-400">workspace.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            Sign in to manage leads, track follow-ups, and stay in sync with your team — for admins and employees alike.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            { icon: FileText, label: 'Lead Management',  sub: 'Track every enquiry from new to converted',     color: 'text-emerald-400' },
            { icon: Briefcase, label: '11 Service Lines', sub: 'Passport, Visa, PAN, Insurance and more',      color: 'text-emerald-400'    },
            { icon: Award, label: 'Role-based Access',    sub: 'Admin and employee workflows on one dashboard', color: 'text-violet-400'  },
          ].map(({ icon: Icon, label, sub, color }) => (
            <div key={label} className="flex items-center gap-4 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 hover:bg-white/[0.08] transition-colors">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 lg:p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src="/nnc-mark.png" alt="NNC Digital" width={56} height={56} className="rounded-2xl flex-shrink-0" />
            <div>
              <p className="font-bold text-gray-900">NNC Digital</p>
              <p className="text-xs text-gray-500">CRM Lead Dashboard</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome back</h2>
            <p className="text-gray-400 text-sm">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-300 transition-all bg-gray-50/60 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-300 transition-all bg-gray-50/60 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-60 active:scale-[0.99]"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(37, 99, 235, 0.4)',
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <span className="text-emerald-600 font-medium">Contact your admin for access.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
