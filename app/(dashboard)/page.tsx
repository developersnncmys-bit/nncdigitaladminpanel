'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  UserPlus, AlertCircle, CalendarCheck, UserCheck, Clock, CheckCircle, ArrowRight,
} from 'lucide-react';

import { useAuthUser } from '@/lib/useAuthUser';
import BarChart from '@/components/dashboard/BarChart';
import DonutChart from '@/components/dashboard/DonutChart';
import { useAddLead } from '@/context/AddLeadContext';

const PIPELINE_TABS = [
  { key: 'new',       label: 'Active New Leads',  color: 'from-teal-500 to-emerald-600',     href: '/leads/new',       icon: UserPlus },
  { key: 'overdue',   label: 'Current Overdue',   color: 'from-rose-500 to-red-600',        href: '/leads/overdue',   icon: AlertCircle },
  { key: 'today',     label: "Today's Follow-up", color: 'from-cyan-500 to-teal-600',       href: '/leads/today',     icon: CalendarCheck },
  { key: 'followup',  label: 'Pending Follow-up', color: 'from-amber-500 to-orange-600',    href: '/leads/followup',  icon: UserCheck },
  { key: 'inprocess', label: 'In Process',        color: 'from-fuchsia-500 to-purple-600',  href: '/leads/inprocess', icon: Clock },
  { key: 'converted', label: 'Total Converted',   color: 'from-emerald-500 to-green-600',   href: '/leads/converted', icon: CheckCircle },
] as const;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardPage() {
  const { leads, openModal, stats: serverStats } = useAddLead();
  const user = useAuthUser();

  const stats = serverStats ?? {
    new:       leads.filter((l) => l.status === 'new').length,
    overdue:   leads.filter((l) => l.status === 'overdue').length,
    today:     leads.filter((l) => l.status === 'today').length,
    followup:  leads.filter((l) => l.status === 'followup').length,
    inprocess: leads.filter((l) => l.status === 'inprocess').length,
    converted: leads.filter((l) => l.status === 'converted').length,
    dead:      leads.filter((l) => l.status === 'dead').length,
    total:     leads.length,
  };
  const total = stats.total;

  const donutData = [
    { label: 'Active New Leads', value: stats.new, color: '#14b8a6' },
    { label: 'Current Overdue', value: stats.overdue, color: '#f43f5e' },
    { label: "Today's Follow-up", value: stats.today, color: '#06b6d4' },
    { label: 'Pending Follow-up', value: stats.followup, color: '#f59e0b' },
    { label: 'In Process', value: stats.inprocess, color: '#d946ef' },
    { label: 'Total Converted', value: stats.converted, color: '#22c55e' },
    { label: 'Dead Leads', value: stats.dead, color: '#ef4444' },
  ];

  // Leads per month for the current calendar year.
  const monthlyData = useMemo(() => {
    const now = new Date();
    return MONTHS.map((label, m) => ({
      label,
      tip: `${label} ${now.getFullYear()}`,
      value: leads.filter((l) => {
        const c = new Date(l.createdAt);
        return c.getFullYear() === now.getFullYear() && c.getMonth() === m;
      }).length,
    }));
  }, [leads]);

  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting ? `${greeting}, ${user.name.split(' ')[0]}! 👋` : ''}
          </h1>
          <p className="text-sm text-gray-400 mt-1">Here&apos;s what&apos;s happening with your leads today.</p>
        </div>
        <button
          onClick={openModal}
          className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Lead
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {PIPELINE_TABS.map(({ key, label, color, href, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white hover:-translate-y-1 transition-all shadow-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-xs font-semibold uppercase tracking-wide">{label}</span>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold">{stats[key]}</p>
            <div className="flex items-center gap-1 mt-2 text-white/70 text-xs font-medium">
              <span>View leads</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* LEADS OVERVIEW */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-5">
          <h2 className="font-bold text-gray-900 text-base">Leads Overview</h2>
          <p className="text-xs text-gray-400 mt-1">Monthly lead activity — {new Date().getFullYear()}</p>
        </div>
        <BarChart data={monthlyData} />
      </div>

      {/* LEAD DISTRIBUTION */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-md">
        <div className="mb-5">
          <h2 className="font-bold text-gray-900">Lead Distribution</h2>
          <p className="text-xs text-gray-400 mt-1">Current lead pipeline distribution</p>
        </div>
        <DonutChart data={donutData} />
        <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between text-xs">
          <span className="text-gray-500">Conversion rate</span>
          <span className="font-bold text-emerald-600">
            {total > 0 ? ((stats.converted / total) * 100).toFixed(1) : '0.0'}%
          </span>
        </div>
      </div>
    </div>
  );
}
