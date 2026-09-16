'use client';

import Link from 'next/link';
import { Users, BookOpen, ArrowRight, Briefcase } from 'lucide-react';

export default function SettingsHubPage() {
  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400">Choose what you&apos;d like to manage</p>
      </div>

      {/* Hub cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/settings/team"
          className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-5 hover:bg-emerald-100 transition-colors"
        >
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-200">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">Team Settings</p>
            <p className="text-xs text-gray-500 truncate">Members, roles &amp; access</p>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        </Link>

        <Link
          href="/blogs"
          className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-2xl p-5 hover:bg-teal-100 transition-colors"
        >
          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-teal-200">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">Blog Management</p>
            <p className="text-xs text-gray-500 truncate">Create and publish posts</p>
          </div>
          <ArrowRight className="w-4 h-4 text-teal-600 flex-shrink-0" />
        </Link>

        <Link
          href="/settings/careers"
          className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-2xl p-5 hover:bg-violet-100 transition-colors"
        >
          <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-200">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">Careers</p>
            <p className="text-xs text-gray-500 truncate">Open roles shown on the website</p>
          </div>
          <ArrowRight className="w-4 h-4 text-violet-600 flex-shrink-0" />
        </Link>
      </div>

    </div>
  );
}
