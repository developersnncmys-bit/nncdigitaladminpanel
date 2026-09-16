'use client';

import { useEffect, useRef } from 'react';
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Quote, Link2, Undo, Redo, Pilcrow,
} from 'lucide-react';

// Dependency-free rich-text editor built on a contentEditable div + the
// browser's built-in formatting commands. Replaces the old CKEditor build
// (which could fail to load and left the content un-editable). Always works,
// no external packages. Emits HTML via onChange — same shape the rest of the
// blog flow already expects.

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Initialise / sync the editor's HTML when the incoming value changes from
  // OUTSIDE (e.g. opening a different blog). We skip syncing while the user is
  // typing — our own onChange echoes back the same HTML, so re-setting it would
  // reset the caret to the start on every keystroke.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return; // user is typing — don't clobber
    if (el.innerHTML !== (value || '')) el.innerHTML = value || '';
  }, [value]);

  const emit = () => { if (ref.current) onChange(ref.current.innerHTML); };

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const block = (tag: string) => exec('formatBlock', tag);

  const addLink = () => {
    const url = window.prompt('Enter the link URL (https://…)');
    if (url) exec('createLink', url);
  };

  const Btn = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {children}
    </button>
  );

  const Sep = () => <span className="w-px h-5 bg-gray-200 mx-0.5" />;

  return (
    <div className="rte-wrap border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/60">
        <Btn onClick={() => exec('bold')} title="Bold"><Bold className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec('italic')} title="Italic"><Italic className="w-4 h-4" /></Btn>
        <Sep />
        <Btn onClick={() => block('<h2>')} title="Heading 2"><Heading2 className="w-4 h-4" /></Btn>
        <Btn onClick={() => block('<h3>')} title="Heading 3"><Heading3 className="w-4 h-4" /></Btn>
        <Btn onClick={() => block('<p>')} title="Normal text"><Pilcrow className="w-4 h-4" /></Btn>
        <Sep />
        <Btn onClick={() => exec('insertUnorderedList')} title="Bullet list"><List className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec('insertOrderedList')} title="Numbered list"><ListOrdered className="w-4 h-4" /></Btn>
        <Btn onClick={() => block('<blockquote>')} title="Quote"><Quote className="w-4 h-4" /></Btn>
        <Btn onClick={addLink} title="Insert link"><Link2 className="w-4 h-4" /></Btn>
        <Sep />
        <Btn onClick={() => exec('undo')} title="Undo"><Undo className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec('redo')} title="Redo"><Redo className="w-4 h-4" /></Btn>
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-ph={placeholder || 'Write your blog content here…'}
        className="rte-area px-4 py-3 min-h-[240px] max-h-[420px] overflow-y-auto text-sm text-gray-900 leading-relaxed focus:outline-none"
      />

      {/* Minimal styling for content + empty-state placeholder */}
      <style jsx global>{`
        .rte-area:empty:before { content: attr(data-ph); color: #9ca3af; }
        .rte-area h2 { font-size: 1.25rem; font-weight: 700; margin: 0.6em 0 0.3em; }
        .rte-area h3 { font-size: 1.1rem; font-weight: 700; margin: 0.5em 0 0.3em; }
        .rte-area p { margin: 0.4em 0; }
        .rte-area ul { list-style: disc; padding-left: 1.4em; margin: 0.4em 0; }
        .rte-area ol { list-style: decimal; padding-left: 1.4em; margin: 0.4em 0; }
        .rte-area blockquote { border-left: 3px solid #cbd5e1; padding-left: 0.8em; color: #475569; margin: 0.5em 0; }
        .rte-area a { color: #059669; text-decoration: underline; }
      `}</style>
    </div>
  );
}
