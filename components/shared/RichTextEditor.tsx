'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  Upload,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Square,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import { showToast } from '@/components/ui/Toast';

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
  // Modal states for Image & Link insertion
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // Image Modal states
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected Image Reference & state for DOM interaction
  const selectedImgRef = useRef<HTMLImageElement | null>(null);
  const [hasSelectedImg, setHasSelectedImg] = useState(false);
  const [imgWidthPx, setImgWidthPx] = useState<number>(400);
  const [imgRoundedPx, setImgRoundedPx] = useState<number>(12);

  // Link Modal states
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image cursor-pointer rounded-xl my-2 transition-all duration-200 inline-block',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent underline font-semibold cursor-pointer hover:text-orange-600',
        },
      }),
    ],
    content: value || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[260px] p-4 sm:p-5 text-xs sm:text-sm text-slate-800 focus:outline-none leading-relaxed ' +
          '[&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:my-3 [&_h1]:leading-tight ' +
          '[&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:my-2.5 [&_h2]:leading-snug ' +
          '[&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:my-2 ' +
          '[&_p]:my-1.5 ' +
          '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ul_li]:my-1 ' +
          '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_ol_li]:my-1 ' +
          '[&_u]:underline [&_s]:line-through ' +
          '[&_a]:text-accent [&_a]:underline [&_a]:font-semibold ' +
          '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-2 [&_img]:shadow-xs [&_img]:inline-block',
      },
    },
  });

  // Attach direct click listener to handle image selection, width & rounded reading
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'IMG') {
      if (selectedImgRef.current && selectedImgRef.current !== target) {
        selectedImgRef.current.style.outline = 'none';
        selectedImgRef.current.style.boxShadow = 'none';
      }

      const imgEl = target as HTMLImageElement;
      imgEl.style.outline = '2px solid #2563eb';
      imgEl.style.outlineOffset = '2px';
      selectedImgRef.current = imgEl;

      // Extract current pixel width or default to clientWidth
      const currentWidth = imgEl.clientWidth || parseInt(imgEl.style.width, 10) || 400;
      const currentRounded = parseInt(imgEl.style.borderRadius, 10) || 12;

      setImgWidthPx(currentWidth);
      setImgRoundedPx(currentRounded);
      setHasSelectedImg(true);
    } else {
      if (selectedImgRef.current) {
        selectedImgRef.current.style.outline = 'none';
        selectedImgRef.current.style.boxShadow = 'none';
        selectedImgRef.current = null;
      }
      setHasSelectedImg(false);
    }
  };

  // Sync content if value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // Sync readOnly prop
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  if (!editor) {
    return null;
  }

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast.error('File harus berupa gambar (JPG, PNG, WebP, GIF).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewImage(result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Image Modal
  const handleInsertImage = () => {
    let srcToInsert = '';
    if (imageTab === 'upload') {
      if (!previewImage) {
        showToast.error('Pilih file gambar dari komputer terlebih dahulu.');
        return;
      }
      srcToInsert = previewImage;
    } else {
      if (!imageUrl.trim()) {
        showToast.error('Masukkan URL gambar.');
        return;
      }
      srcToInsert = imageUrl.trim();
    }

    editor
      .chain()
      .focus()
      .setImage({
        src: srcToInsert,
        alt: 'Brief Image',
      })
      .run();

    setIsImageModalOpen(false);
    setPreviewImage(null);
    setImageUrl('');
    showToast.success('Gambar berhasil ditambahkan.');
  };

  // Open Link Modal
  const handleOpenLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');

    setLinkUrl(previousUrl);
    setLinkText(selectedText || '');
    setIsLinkModalOpen(true);
  };

  // Submit Link Modal
  const handleInsertLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setIsLinkModalOpen(false);
      return;
    }

    let formattedUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const { selection } = editor.state;

    if (selection.empty) {
      const textToDisplay = linkText.trim() || formattedUrl;
      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${textToDisplay}</a> `
        )
        .run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: formattedUrl }).run();
    }

    setIsLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
    showToast.success('Link berhasil ditambahkan.');
  };

  const handleUnsetLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setIsLinkModalOpen(false);
    showToast.info('Link dihapus.');
  };

  // Flexible Image Width Slider Handler
  const handleSliderWidthChange = (newWidthPx: number) => {
    setImgWidthPx(newWidthPx);
    const imgEl = selectedImgRef.current;
    if (!imgEl) return;

    imgEl.style.width = `${newWidthPx}px`;
    imgEl.style.maxWidth = '100%';
    imgEl.style.height = 'auto';

    onChange?.(editor.getHTML());
  };

  // Flexible Image Rounded Corner Radius Handler
  const handleSetImageRounded = (roundedPx: number) => {
    setImgRoundedPx(roundedPx);
    const imgEl = selectedImgRef.current;
    if (!imgEl) return;

    if (roundedPx === 9999) {
      imgEl.style.borderRadius = '9999px';
    } else {
      imgEl.style.borderRadius = `${roundedPx}px`;
    }

    onChange?.(editor.getHTML());
    showToast.info(`Sudut kelengkungan gambar diubah ke ${roundedPx === 9999 ? 'Full' : `${roundedPx}px`}.`);
  };

  const handleSetImageAlignment = (align: 'left' | 'center' | 'right') => {
    const imgEl = selectedImgRef.current;
    if (!imgEl) return;

    if (align === 'left') {
      imgEl.style.display = 'block';
      imgEl.style.marginLeft = '0';
      imgEl.style.marginRight = 'auto';
    } else if (align === 'center') {
      imgEl.style.display = 'block';
      imgEl.style.marginLeft = 'auto';
      imgEl.style.marginRight = 'auto';
    } else if (align === 'right') {
      imgEl.style.display = 'block';
      imgEl.style.marginLeft = 'auto';
      imgEl.style.marginRight = '0';
    }

    onChange?.(editor.getHTML());
    showToast.info(`Perataan gambar diubah ke ${align}.`);
  };

  const handleDeleteImg = () => {
    const imgEl = selectedImgRef.current;
    if (!imgEl) return;
    imgEl.remove();
    selectedImgRef.current = null;
    setHasSelectedImg(false);

    onChange?.(editor.getHTML());
    showToast.success('Gambar berhasil dihapus.');
  };

  if (readOnly) {
    return (
      <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Editor Container matching project design system */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        {/* Sleek Toolbar Navigation */}
        <div className="flex items-center gap-1.5 p-3 bg-white border-b border-slate-100 flex-wrap text-slate-700 text-xs sm:text-sm select-none">
          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`font-black px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('bold')
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Bold (Ctrl+B)"
          >
            B
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`italic font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('italic')
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Italic (Ctrl+I)"
          >
            I
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`underline font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('underline')
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Underline (Ctrl+U)"
          >
            U
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`line-through font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('strike')
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Strikethrough"
          >
            S
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`font-extrabold text-xs px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Heading 1"
          >
            H1
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`font-extrabold text-xs px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Heading 2"
          >
            H2
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`font-extrabold text-xs px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Heading 3"
          >
            H3
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* Add Link */}
          <button
            type="button"
            onClick={handleOpenLinkModal}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('link')
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
            title="Tambah / Edit Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {/* Add Image */}
          <button
            type="button"
            onClick={() => setIsImageModalOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
            title="Tambah Gambar (Upload dari Komputer / URL)"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('orderedList')
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
            title="List Angka (Numbered List)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('bulletList')
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
            title="List Titik (Bullet List)"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Natural Image Toolbar when an Image is selected */}
        {hasSelectedImg && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap text-xs text-slate-700 animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                <span>Pengaturan Gambar:</span>
              </span>

              {/* Alignment Buttons */}
              <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5">
                <button
                  type="button"
                  onClick={() => handleSetImageAlignment('left')}
                  className="p-1 rounded text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Rata Kiri"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSetImageAlignment('center')}
                  className="p-1 rounded text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Rata Tengah"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSetImageAlignment('right')}
                  className="p-1 rounded text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Rata Kanan"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Flexible Width Range Slider */}
              <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Lebar:</span>
                <input
                  type="range"
                  min="120"
                  max="900"
                  step="10"
                  value={imgWidthPx}
                  onChange={(e) => handleSliderWidthChange(Number(e.target.value))}
                  className="w-24 accent-primary cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <span className="font-mono font-bold text-slate-800 w-12 text-right">
                  {imgWidthPx}px
                </span>
              </div>

              {/* Flexible Corner Radius / Rounded Selector */}
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium mr-0.5 flex items-center gap-1">
                  <Square className="w-3 h-3 text-slate-400" />
                  Sudut:
                </span>
                <button
                  type="button"
                  onClick={() => handleSetImageRounded(0)}
                  className={`px-1.5 py-0.5 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                    imgRoundedPx === 0 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Sudut Tajam (0px)"
                >
                  0px
                </button>
                <button
                  type="button"
                  onClick={() => handleSetImageRounded(8)}
                  className={`px-1.5 py-0.5 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                    imgRoundedPx === 8 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Sudut Sedang (8px)"
                >
                  8px
                </button>
                <button
                  type="button"
                  onClick={() => handleSetImageRounded(16)}
                  className={`px-1.5 py-0.5 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                    imgRoundedPx === 16 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Sudut Bulat (16px)"
                >
                  16px
                </button>
                <button
                  type="button"
                  onClick={() => handleSetImageRounded(9999)}
                  className={`px-1.5 py-0.5 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                    imgRoundedPx === 9999 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Sudut Lingkaran / Pill (Full)"
                >
                  Full
                </button>
              </div>
            </div>

            {/* Quick Presets & Delete Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSliderWidthChange(300)}
                className="px-2 py-0.5 font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Kecil
              </button>
              <button
                type="button"
                onClick={() => handleSliderWidthChange(500)}
                className="px-2 py-0.5 font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Sedang
              </button>
              <button
                type="button"
                onClick={() => {
                  const imgEl = selectedImgRef.current;
                  if (imgEl) {
                    imgEl.style.width = '100%';
                    setImgWidthPx(imgEl.clientWidth || 800);
                    onChange?.(editor.getHTML());
                  }
                }}
                className="px-2 py-0.5 font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Maximize2 className="w-3 h-3" />
                Full
              </button>
              <button
                type="button"
                onClick={handleDeleteImg}
                className="p-1 rounded-lg text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer ml-1"
                title="Hapus Gambar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Editor WYSIWYG Content Area */}
        <div ref={editorContainerRef} onClick={handleEditorClick}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Save Button */}
      {onSave && (
        <div className="flex justify-end pt-1">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onSave(editor.getHTML());
              showToast.success('General Brief berhasil disimpan.');
            }}
          >
            Save Brief
          </Button>
        </div>
      )}

      {/* Custom Modal Insert Image */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setPreviewImage(null);
          setImageUrl('');
        }}
        title="Tambah Gambar"
        maxWidth="md"
      >
        <div className="space-y-4">
          <Tabs
            tabs={[
              { id: 'upload', label: 'Upload dari Komputer' },
              { id: 'url', label: 'Input URL Gambar' },
            ]}
            activeTab={imageTab}
            onChange={(id) => setImageTab(id as 'upload' | 'url')}
            variant="pills"
          />

          {imageTab === 'upload' ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-slate-50/50 hover:bg-slate-50"
              >
                {previewImage ? (
                  <div className="space-y-2">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="max-h-48 rounded-xl object-contain mx-auto border border-slate-200"
                    />
                    <p className="text-xs text-primary font-bold">Klik untuk mengganti gambar</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-primary mb-2" />
                    <p className="text-sm font-bold text-slate-700">Pilih File Gambar dari Komputer</p>
                    <p className="text-xs text-slate-400 mt-1">Mendukung format JPG, PNG, WebP, GIF</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Gambar <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="https://example.com/image.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsImageModalOpen(false);
                setPreviewImage(null);
                setImageUrl('');
              }}
            >
              Batal
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleInsertImage}>
              Sisipkan Gambar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Custom Modal Insert / Edit Link */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Tambah / Edit Link"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Teks yang Ditampilkan (Opsional)
            </label>
            <Input
              placeholder="misal: Website Official / Klik di sini"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL Link Website <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {editor.isActive('link') ? (
              <Button type="button" variant="danger" size="sm" onClick={handleUnsetLink}>
                Hapus Link
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsLinkModalOpen(false)}>
                Batal
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleInsertLink}>
                Simpan Link
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RichTextEditor;
