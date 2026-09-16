'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle, Bold, Italic, List, Link2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface BlogForm {
  title: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
  status: 'published' | 'draft';
  image: string;
}

const INITIAL: BlogForm = {
  title: '', metaTitle: '', metaDescription: '',
  description: '', status: 'draft', image: '',
};

export default function NewBlogPage() {
  const router = useRouter();
  const [form, setForm] = useState<BlogForm>(INITIAL);
  const [errors, setErrors] = useState<Partial<BlogForm>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key: keyof BlogForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e: Partial<BlogForm> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => router.push('/blogs'), 2000);
  };

  const inputClass = (err?: string) =>
    `w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 ${
      err ? 'border-red-300' : 'border-gray-200'
    }`;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Blog Created!</h2>
        <p className="text-gray-500 text-sm">Redirecting to blogs list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/blogs" className="p-2 rounded-xl hover:bg-white border border-gray-200 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Blog</h1>
            <p className="text-sm text-gray-500">Write a new blog post</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {/* Title + Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Blog Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter blog title"
                value={form.title}
                onChange={set('title')}
                className={inputClass(errors.title)}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Featured Image</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                  <ImageIcon className="w-4 h-4" />
                  Choose File
                  <input type="file" accept="image/*" className="hidden" />
                </label>
                <span className="text-sm text-gray-400">No file chosen</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={set('status')} className={inputClass()}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* SEO */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">SEO Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meta Title</label>
                <input
                  type="text"
                  placeholder="SEO meta title"
                  value={form.metaTitle}
                  onChange={set('metaTitle')}
                  className={inputClass()}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meta Description</label>
                <textarea
                  placeholder="SEO meta description"
                  value={form.metaDescription}
                  onChange={set('metaDescription')}
                  rows={3}
                  className={`${inputClass()} resize-none`}
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            {/* Simple toolbar */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
                {[
                  { icon: Bold, label: 'Bold' },
                  { icon: Italic, label: 'Italic' },
                  { icon: Link2, label: 'Link' },
                  { icon: List, label: 'List' },
                  { icon: ImageIcon, label: 'Image' },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    title={label}
                    className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Write your blog content here..."
                value={form.description}
                onChange={set('description')}
                rows={12}
                className={`w-full px-4 py-3 text-sm focus:outline-none resize-none bg-white text-gray-900 placeholder-gray-400 ${
                  errors.description ? 'ring-2 ring-red-400' : ''
                }`}
              />
            </div>
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm shadow-emerald-200"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <BookOpen className="w-4 h-4" />
            )}
            {loading ? 'Creating...' : 'Create Blog'}
          </button>
          <Link
            href="/blogs"
            className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
