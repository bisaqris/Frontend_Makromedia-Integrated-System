'use client';

import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface RichTextEditorProps {
  value: string;
  onChange?: (val: string) => void;
  onSave?: (val: string) => void;
  readOnly?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onSave,
  readOnly = false,
}) => {
  const [content, setContent] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onChange?.(e.target.value);
  };

  const handleToolbarClick = (symbol: string) => {
    if (readOnly) return;
    setContent((prev) => `${prev} ${symbol}`);
    onChange?.(`${content} ${symbol}`);
  };

  if (readOnly) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
        {content || 'Belum ada General Brief yang ditambahkan oleh Project Manager.'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Editor Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded-xl flex-wrap text-slate-600">
        <button
          type="button"
          onClick={() => handleToolbarClick('**Text**')}
          className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900 transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleToolbarClick('*Text*')}
          className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900 transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleToolbarClick('<u>Text</u>')}
          className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900 transition-colors"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleToolbarClick('~~Text~~')}
          className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900 transition-colors"
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => handleToolbarClick('# Heading 1')}
          className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900 transition-colors"
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleToolbarClick('## Heading 2')}
          className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900 transition-colors"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleToolbarClick('### Heading 3')}
          className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900 transition-colors"
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => handleToolbarClick('[Link Title](https://example.com)')}
          className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900 transition-colors"
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleToolbarClick('![Image Alt](https://example.com/image.jpg)')}
          className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900 transition-colors"
          title="Add Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => handleToolbarClick('\n1. Item 1\n2. Item 2')}
          className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900 transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleToolbarClick('\n- Item A\n- Item B')}
          className="p-1.5 rounded-lg hover:bg-white hover:text-slate-900 transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Textarea */}
      <textarea
        rows={6}
        value={content}
        onChange={handleChange}
        placeholder="Tuliskan petunjuk teknis, brief produksi, atau catatan penting untuk tim di sini..."
        className="w-full p-4 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary transition-colors resize-y leading-relaxed"
      />

      {/* Save Button */}
      {onSave && (
        <div className="flex justify-end">
          <Button variant="primary" size="sm" onClick={() => onSave(content)}>
            Save Brief
          </Button>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
