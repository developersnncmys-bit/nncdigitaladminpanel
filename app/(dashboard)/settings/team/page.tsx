'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, UserPlus, Edit3, Trash2,
  CheckCircle, XCircle, Search, X, Eye, EyeOff, Shield, UserCheck,
  ArrowLeft,
} from 'lucide-react';
import { User, UserRole } from '@/lib/types';
import { SERVICES, STATES } from '@/lib/constants';
import * as api from '@/lib/api';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 10;

interface UserForm {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  username: string;
  password: string;
  services: string[];
  states: string[];
}

type FormErrors = Partial<Record<keyof UserForm, string>>;

const INITIAL_FORM: UserForm = { name: '', email: '', phone: '', role: 'employee', username: '', password: '', services: [], states: [] };

export default function TeamSettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveError, setSaveError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  // Toggle showing a single user's stored password in the table.
  const toggleReveal = (id: string) =>
    setRevealed((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  const load = async () => {
    try {
      setUsers(await api.listUsers());
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => { load(); }, []);

  // mirror to localStorage so the "assign to" employee dropdowns on the lead
  // pages stay populated without each needing its own fetch
  useEffect(() => {
    if (users.length) localStorage.setItem('crm-users', JSON.stringify(users));
  }, [users]);

  const set = (key: keyof UserForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // Toggle a service/state in or out of the user's handled list.
  const toggleIn = (key: 'services' | 'states', value: string) =>
    setForm((f) => {
      const has = f[key].includes(value);
      return { ...f, [key]: has ? f[key].filter((v) => v !== value) : [...f[key], value] };
    });

  const openAdd = () => {
    setEditingUser(null);
    setForm(INITIAL_FORM);
    setErrors({});
    setSaveError('');
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, phone: user.phone || '', role: user.role, username: user.username, password: '', services: user.services || [], states: user.states || [] });
    setErrors({});
    setSaveError('');
    setShowPassword(false);
    setShowModal(true);
  };

  const validate = () => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (form.phone.trim() && !/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number';
    if (!form.username.trim()) e.username = 'Required';
    else if (/\s/.test(form.username)) e.username = 'No spaces allowed';
    else {
      const dup = users.find((u) => u.username === form.username.trim() && u.id !== editingUser?.id);
      if (dup) e.username = 'Username already taken';
    }
    if (!editingUser) {
      if (!form.password) e.password = 'Required';
      else if (form.password.length < 6) e.password = 'Min 6 characters';
    } else if (form.password && form.password.length < 6) {
      e.password = 'Min 6 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaveError('');
    const payload: Partial<User> = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      username: form.username.trim(),
      services: form.services,
      states: form.states,
      ...(form.password ? { password: form.password } : {}),
    };
    try {
      if (editingUser) {
        const updated = await api.updateUser(editingUser.id, payload);
        setUsers((us) => us.map((u) => (u.id === editingUser.id ? updated : u)));
      } else {
        const created = await api.createUser(payload);
        setUsers((us) => [...us, created]);
      }
      setShowModal(false);
    } catch (err) {
      setSaveError((err as Error).message || 'Could not save user. Please try again.');
    }
  };

  const toggleStatus = async (id: string) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    const status = u.status === 'active' ? 'inactive' : 'active';
    setUsers((us) => us.map((x) => (x.id === id ? { ...x, status } : x)));
    try {
      await api.updateUser(id, { status });
    } catch (err) {
      console.error('Failed to update status:', err);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    setUsers((us) => us.filter((u) => u.id !== id));
    try {
      await api.deleteUser(id);
    } catch (err) {
      console.error('Failed to delete user:', err);
      load();
    }
  };

  const filtered = users.filter((u) =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { setPage((p) => Math.min(p, Math.max(1, totalPages))); }, [totalPages]);

  const inp = (err?: string) =>
    `w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all text-gray-900 ${err ? 'border-red-300' : 'border-gray-200'}`;

  const active = users.filter((u) => u.status === 'active').length;
  const inactive = users.filter((u) => u.status === 'inactive').length;

  return (
    <div className="space-y-6">

      {/* Back to Settings hub */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
      </Link>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-sm shadow-emerald-200">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Team Settings</h1>
            <p className="text-sm text-gray-400">Manage team members and access control</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-200"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add User</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Total Members', short: 'Total', value: users.length, icon: Users, from: 'from-emerald-500', to: 'to-emerald-600' },
          { label: 'Active', short: 'Active', value: active, icon: UserCheck, from: 'from-emerald-500', to: 'to-emerald-600' },
          { label: 'Inactive', short: 'Inactive', value: inactive, icon: XCircle, from: 'from-gray-400', to: 'to-gray-500' },
        ].map(({ label, short, value, icon: Icon, from, to }) => (
          <div key={label} className={`bg-gradient-to-br ${from} ${to} rounded-2xl p-3 sm:p-5 text-white shadow-sm`}>
            <div className="flex items-center justify-between mb-2 sm:mb-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{value}</p>
            <p className="text-white/80 text-[10px] sm:text-xs font-semibold uppercase tracking-wide mt-1 truncate">
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Users table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-50">
          <div>
            <p className="text-sm font-bold text-gray-900">Team Members</p>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} of {users.length} users</p>
          </div>
          <div className="relative w-full sm:w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/60">
                {['#', 'Member', 'Username', 'Password', 'Phone', 'Role', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">No users found.</td>
                </tr>
              ) : pageItems.map((user) => (
                <tr key={user.id} className="hover:bg-emerald-50/20 transition-colors">

                  <td className="px-5 py-4 text-sm text-gray-400 font-medium w-10">{user.slNo}</td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-100">
                        <span className="text-white text-xs font-bold">{user.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-xs font-mono font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                      @{user.username}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {user.passwordPlain ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-gray-700">
                          {revealed.has(user.id) ? user.passwordPlain : '••••••'}
                        </span>
                        <button
                          onClick={() => toggleReveal(user.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title={revealed.has(user.id) ? 'Hide password' : 'Show password'}
                        >
                          {revealed.has(user.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400" title="Reset this user's password once to make it viewable">—</span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">{user.phone || '—'}</td>

                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      user.role === 'admin'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {user.role === 'admin' ? 'Admin' : 'Employee'}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                        user.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {user.status === 'active'
                        ? <><CheckCircle className="w-3.5 h-3.5" /> Active</>
                        : <><XCircle className="w-3.5 h-3.5" /> Inactive</>
                      }
                    </button>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(user)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-400">No users found.</p>
          ) : pageItems.map((user) => (
            <div key={user.id} className="px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{user.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                      @{user.username}
                    </span>
                    {user.passwordPlain && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] font-mono text-gray-600">
                          {revealed.has(user.id) ? user.passwordPlain : '••••••'}
                        </span>
                        <button
                          onClick={() => toggleReveal(user.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title={revealed.has(user.id) ? 'Hide password' : 'Show password'}
                        >
                          {revealed.has(user.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(user)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 ml-13">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${user.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {user.role === 'admin' ? 'Admin' : 'Employee'}
                </span>
                <button
                  onClick={() => toggleStatus(user.id)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {user.status === 'active' ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${editingUser ? 'bg-emerald-100' : 'bg-emerald-100'}`}>
                  {editingUser
                    ? <Edit3 className="w-4 h-4 text-emerald-600" />
                    : <UserPlus className="w-4 h-4 text-emerald-600" />
                  }
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {editingUser ? 'Update user details' : 'Fill in the details below'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                  {saveError}
                </div>
              )}

              {/* Avatar preview */}
              {form.name && (
                <div className="flex justify-center">
                  <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-md shadow-emerald-100">
                    <span className="text-white text-xl font-bold">{form.name[0].toUpperCase()}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" placeholder="Enter full name" value={form.name} onChange={set('name')} className={inp(errors.name)} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input type="email" placeholder="Enter email" value={form.email} onChange={set('email')} className={inp(errors.email)} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Username
                    <span className="text-xs text-gray-400 font-normal ml-1">— login ID</span>
                  </label>
                  <input type="text" placeholder="e.g. john.doe" value={form.username} onChange={set('username')} className={inp(errors.username)} autoComplete="off" />
                  {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                  <input type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={set('phone')} className={inp(errors.phone)} maxLength={10} />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Password
                    {editingUser && <span className="text-xs text-gray-400 font-normal ml-1">— leave blank to keep current</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={editingUser ? 'New password (optional)' : 'Min. 6 characters'}
                      value={form.password}
                      onChange={set('password')}
                      className={`${inp(errors.password)} pr-10`}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['employee', 'admin'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, role: r }))}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          form.role === r
                            ? r === 'admin'
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                        {r === 'admin' ? 'Admin' : 'Employee'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Services handled — new leads for these auto-assign to this user */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Services Handled
                    <span className="text-xs text-gray-400 font-normal ml-1">— new leads for these auto-assign here</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES.map((s) => {
                      const on = form.services.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleIn('services', s)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${on ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* States handled — empty = all states */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    States Handled
                    <span className="text-xs text-gray-400 font-normal ml-1">— leave empty for all states</span>
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-0.5">
                    {STATES.map((s) => {
                      const on = form.states.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleIn('states', s)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${on ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-50">
              <button
                onClick={handleSave}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm shadow-sm shadow-emerald-200"
              >
                {editingUser ? 'Save Changes' : 'Add User'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
