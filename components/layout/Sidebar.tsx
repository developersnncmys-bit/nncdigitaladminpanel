'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, PlusCircle, UserPlus, AlertCircle,
  CalendarCheck, UserCheck, Clock, CheckCircle, XCircle,
  Settings,
} from 'lucide-react';
import { useAuthUser } from '@/lib/useAuthUser';
import { useAddLead } from '@/context/AddLeadContext';

const LEAD_NAV = [
  { href: '/leads/new',       label: 'New Leads',          icon: UserPlus,      key: 'new',       dot: '#10b981' },
  { href: '/leads/overdue',   label: 'Overdue',            icon: AlertCircle,   key: 'overdue',   dot: '#9ca3af' },
  { href: '/leads/today',     label: "Today's Follow-up",  icon: CalendarCheck, key: 'today',     dot: '#14b8a6' },
  { href: '/leads/followup',  label: 'Follow-up',          icon: UserCheck,     key: 'followup',  dot: '#f59e0b' },
  { href: '/leads/inprocess', label: 'In Process',         icon: Clock,         key: 'inprocess', dot: '#06b6d4' },
  { href: '/leads/converted', label: 'Converted',          icon: CheckCircle,   key: 'converted', dot: '#10b981' },
  { href: '/leads/dead',      label: 'Dead Leads',         icon: XCircle,       key: 'dead',      dot: '#ef4444' },
];

const ADMIN_NAV = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { openModal } = useAddLead();
  const user = useAuthUser();
  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white h-screen fixed left-0 top-0 z-30 border-r border-gray-100">

      {/* Brand: NNC Digital logo mark + wordmark. */}
      <div className="flex items-center gap-3 px-5 h-20 border-b border-gray-100 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src="/nnc-mark.png" alt="NNC Digital" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-gray-900 leading-tight">NNC Digital</p>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">CRM</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">

        <NavItem href="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/') && pathname === '/'} />
        <button
          onClick={openModal}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all"
        >
          <PlusCircle className="w-4 h-4 text-gray-400" />
          Add Lead
        </button>

        <SectionLabel>Pipeline</SectionLabel>
        {LEAD_NAV.map(({ href, label, icon, dot }) => (
          <NavItem
            key={href}
            href={href}
            icon={icon}
            label={label}
            active={isActive(href)}
            dot={dot}
          />
        ))}

        {user.role === 'admin' && (
          <>
            <SectionLabel>Admin</SectionLabel>
            {ADMIN_NAV.map(({ href, label, icon }) => (
              <NavItem key={href} href={href} icon={icon} label={label} active={isActive(href)} />
            ))}
          </>
        )}
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-[11px] text-gray-400 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-4 pb-1.5 px-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{children}</p>
    </div>
  );
}

function NavItem({
  href, icon: Icon, label, active, badge, dot, highlight,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  badge?: number;
  dot?: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
        active
          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
          : highlight
          ? 'text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {dot && !active ? (
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
      ) : (
        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
      )}

      <span className="flex-1 truncate">{label}</span>

      {badge !== undefined && badge > 0 && (
        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center tabular-nums ${
          active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          {badge}
        </span>
      )}
    </Link>
  );
}
