'use client';

import { useState, useEffect } from 'react';
import { X, BookOpen, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useEditBlog } from '@/context/EditBlogContext';
import { useBlogs } from '@/context/BlogContext';
import RichTextEditor from './RichTextEditor';

interface BlogForm {
  title: string;
  category: string;
  excerpt: string;
  image: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
  status: 'published' | 'draft';
  readMins: string;
}

const CATEGORIES = [
  'Passport', 'Tourist Visa', 'PAN Card', 'Senior Citizen Card', 'Insurance',
  'Rental Agreement', 'Lease Agreement', 'Police Verification', 'MSME Certificate',
  'Police Clearance Certificate', 'Affidavits / Annexure',
];

const inputCls = (err?: string) =>
  `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 ${
    err ? 'border-red-300 focus:ring-red-400' : 'border-gray-200'
  }`;

export default function EditBlogModal() {
  const { blog, closeModal } = useEditBlog();
  const { updateBlog } = useBlogs();
  const open = blog !== null;

  const [form, setForm] = useState<BlogForm>({
    title: '', category: 'Passport', excerpt: '', image: '', metaTitle: '', metaDescription: '', description: '', status: 'draft', readMins: '',
  });
  const [errors, setErrors] = useState<Partial<BlogForm>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync form when blog changes
  useEffect(() => {
    if (blog) {
      setForm({
        title: blog.title,
        category: blog.category || 'Passport',
        excerpt: blog.excerpt || '',
        image: blog.image || '',
        metaTitle: blog.metaTitle,
        metaDescription: blog.metaDescription,
        description: blog.description,
        status: blog.status,
        readMins: blog.readTime ? blog.readTime.replace(/\D/g, '') : '',
      });
      setErrors({});
      setSubmitError('');
      setSuccess(false);
    }
  }, [blog]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const set = (key: keyof BlogForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e: Partial<BlogForm> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !blog) return;
    setLoading(true);
    setSubmitError('');
    const saved = await updateBlog(blog.id, {
      title: form.title,
      category: form.category,
      excerpt: form.excerpt,
      image: form.image,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      description: form.description,
      status: form.status,
      readTime: form.readMins ? `${form.readMins} min` : '',
    });
    setLoading(false);
    if (saved) setSuccess(true);
    else setSubmitError('Could not save changes. Please try again.');
  };

  const handleClose = () => {
    closeModal();
    setTimeout(() => { setErrors({}); setSubmitError(''); setSuccess(false); }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Edit Blog</h2>
              <p className="text-xs text-gray-400 truncate max-w-xs">{blog?.title}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Blog Updated!</h3>
              <p className="text-sm text-gray-400">Your changes have been saved.</p>
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form id="edit-blog-form" onSubmit={handleSubmit} className="space-y-5">

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                  {submitError}
                </div>
              )}

              {/* Title + Image + Status + Read mins */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Blog Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter blog title"
                    value={form.title}
                    onChange={set('title')}
                    className={inputCls(errors.title)}
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                  <select value={form.category} onChange={set('category')} className={inputCls()}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Excerpt</label>
                  <textarea
                    placeholder="Short summary shown on blog cards"
                    value={form.excerpt}
                    onChange={set('excerpt')}
                    rows={2}
                    className={`${inputCls()} resize-none`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-gray-400" /> Featured Image
                  </label>
                  {form.image ? (
                    <div className="flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.image}
                        alt="preview"
                        className="w-32 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                      />
                      <div className="flex flex-col gap-2">
                        <label className="cursor-pointer inline-block px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-center">
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result || '') }));
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, image: '' }))}
                          className="px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="flex items-center justify-center w-full h-28 bg-gray-50 border border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="text-center">
                          <ImageIcon className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                          <p className="text-xs text-gray-500">Click to upload an image</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result || '') }));
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                  <select value={form.status} onChange={set('status')} className={inputCls()}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Read Time (mins)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    value={form.readMins}
                    onChange={set('readMins')}
                    min={1}
                    className={inputCls()}
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* SEO */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">SEO Settings</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-gray-600">Meta Title</label>
                      <span className={`text-[11px] font-medium ${form.metaTitle.length > 80 ? 'text-red-500' : 'text-gray-400'}`}>
                        {form.metaTitle.length}/80
                      </span>
                    </div>
                    <input type="text" maxLength={80} placeholder="SEO meta title (max 80 chars)" value={form.metaTitle} onChange={set('metaTitle')} className={inputCls()} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-gray-600">Meta Description</label>
                      <span className={`text-[11px] font-medium ${form.metaDescription.length > 155 ? 'text-red-500' : 'text-gray-400'}`}>
                        {form.metaDescription.length}/155
                      </span>
                    </div>
                    <textarea maxLength={155} placeholder="SEO meta description (max 155 chars)" value={form.metaDescription} onChange={set('metaDescription')} rows={2} className={`${inputCls()} resize-none`} />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => setForm((f) => ({ ...f, description: html }))}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-blog-form"
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-200"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <BookOpen className="w-4 h-4" />
              }
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
