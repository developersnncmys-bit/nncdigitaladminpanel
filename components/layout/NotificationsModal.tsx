'use client';

import { X, AlertCircle, CalendarCheck, UserPlus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type NotifType = 'new' | 'overdue' | 'today';

interface Notification {
  id: string;
  type: NotifType;
  message: string;
  sub: string;
  href: string;
}

interface Props {
  notifications: Notification[];
  onClose: () => void;
}

const SECTION_META: Record<NotifType, { label: string; icon: React.ElementType; dot: string; bg: string; color: string; border: string }> = {
  new: {
    label: 'New Leads',
    icon: UserPlus,
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    color: 'text-emerald-700',
    border: 'border-emerald-100',
  },
  overdue: {
    label: 'Overdue Follow-ups',
    icon: AlertCircle,
    dot: 'bg-red-500',
    bg: 'bg-red-50',
    color: 'text-red-700',
    border: 'border-red-100',
  },
  today: {
    label: "Today's Follow-ups",
    icon: CalendarCheck,
    dot: 'bg-orange-400',
    bg: 'bg-orange-50',
    color: 'text-orange-700',
    border: 'border-orange-100',
  },
};

export default function NotificationsModal({ notifications, onClose }: Props) {
  const fresh = notifications.filter((n) => n.type === 'new');
  const overdue = notifications.filter((n) => n.type === 'overdue');
  const today = notifications.filter((n) => n.type === 'today');

  return (
    <>
      {/* Invisible backdrop for click-outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel — fixed top-right just below header */}
      <div className="fixed top-[84px] right-4 sm:right-5 z-50 w-[calc(100vw-32px)] sm:w-96 bg-white rounded-2xl border border-gray-100 shadow-2xl flex flex-col max-h-[calc(100vh-104px)] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">All Notifications</h2>
              <p className="text-xs text-gray-400">{notifications.length} pending action{notifications.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <CalendarCheck className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-500">All caught up!</p>
              <p className="text-xs text-gray-400 mt-1">No pending follow-ups right now.</p>
            </div>
          ) : (
            <div className="p-3 space-y-3">

              {/* New leads section */}
              {fresh.length > 0 && (
                <Section type="new" items={fresh} onClose={onClose} />
              )}

              {/* Overdue section */}
              {overdue.length > 0 && (
                <Section type="overdue" items={overdue} onClose={onClose} />
              )}

              {/* Today section */}
              {today.length > 0 && (
                <Section type="today" items={today} onClose={onClose} />
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 flex-shrink-0">
            <Link
              href="/leads"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
            >
              View all leads
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

      </div>
    </>
  );
}

function Section({ type, items, onClose }: { type: NotifType; items: { id: string; message: string; sub: string; href: string }[]; onClose: () => void }) {
  const meta = SECTION_META[type];
  const Icon = meta.icon;

  return (
    <div className={`rounded-xl border ${meta.border} overflow-hidden`}>
      {/* Section header */}
      <div className={`flex items-center gap-2 px-3 py-2.5 ${meta.bg}`}>
        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
        <span className={`text-xs font-bold ${meta.color}`}>{meta.label}</span>
        <span className={`ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-white/70 ${meta.color}`}>
          {items.length}
        </span>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-50">
        {items.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            onClick={onClose}
            className="flex items-start gap-3 px-3 py-3 hover:bg-gray-50 transition-colors group"
          >
            <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-800 font-medium leading-snug group-hover:text-emerald-600 transition-colors">
                {n.message}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{n.sub}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 flex-shrink-0 mt-1 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
