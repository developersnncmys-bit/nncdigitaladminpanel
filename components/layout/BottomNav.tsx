'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, UserPlus, AlertCircle, PlusCircle,
  CalendarCheck, Clock, UserCheck,
} from 'lucide-react';
import { useAddLead } from '@/context/AddLeadContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { openModal } = useAddLead();

  const isActive = (href: string) => pathname === href;

  const leftNav = [
    { href: '/',              icon: LayoutDashboard, label: 'Home' },
    { href: '/leads/new',     icon: UserPlus,        label: 'New' },
    { href: '/leads/overdue', icon: AlertCircle,     label: 'Overdue' },
  ];
  const rightNav = [
    { href: '/leads/today',     icon: CalendarCheck, label: 'Today' },
    { href: '/leads/inprocess', icon: Clock,         label: 'Process' },
    { href: '/leads/followup',  icon: UserCheck,     label: 'Follow-up' },
  ];

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`flex flex-col items-center justify-center gap-0.5 px-1 py-1 rounded-lg transition-colors min-w-0 flex-1 ${
          active ? 'text-emerald-600' : 'text-gray-400'
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-[9px] font-medium whitespace-nowrap truncate w-full text-center">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="flex items-center h-16 px-1">
        {leftNav.map((item) => <NavItem key={item.href} {...item} />)}

        <button onClick={openModal} className="flex flex-col items-center -mt-6 flex-shrink-0 px-1">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-300">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-[9px] font-medium text-emerald-600 mt-0.5">Add</span>
        </button>

        {rightNav.map((item) => <NavItem key={item.href} {...item} />)}
      </div>
    </nav>
  );
}
