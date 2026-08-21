"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  ImageIcon,
  Copy,
  Download,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";

interface TiptapEditorProps {
  initialContent?: string;
  onChange?: (markdown: string, html: string) => void;
  readOnly?: boolean;
}

export function TiptapEditor({ initialContent = "", onChange, readOnly = false }: TiptapEditorProps) {
  const [copied, setCopied] = useState(false);

  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Mulai menulis artikel SEO Anda di sini...",
      }),
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
    ],
    content: initialContent || "<p></p>",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      if (onChange) {
        onChange(text, html);
      }
    },
  });

  // Update content if initialContent changes externally
  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent && editor.getText() !== initialContent) {
      // If content is pure markdown or text, render paragraph or headings
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) {
    return (
      <div className="h-[450px] flex items-center justify-center text-slate-500 text-sm bg-slate-950/60 rounded-2xl border border-slate-800">
        Memuat Editor Tiptap...
      </div>
    );
  }

  const addImage = () => {
    const url = window.prompt("Masukkan URL Gambar:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editor.getText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const text = editor.getText();
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hariyuka-article.md";
    a.click();
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/80 border-b border-slate-800 text-slate-300">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive("heading", { level: 1 }) ? "bg-indigo-600/30 text-indigo-400" : ""
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive("heading", { level: 2 }) ? "bg-indigo-600/30 text-indigo-400" : ""
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ${
              editor.isActive("heading", { level: 3 }) ? "bg-indigo-600/30 text-indigo-400" : ""
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          {/* Formats */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
              editor.isActive("bold") ? "bg-indigo-600/30 text-indigo-400" : ""
            }`}
            title="Bold (Tebal)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
              editor.isActive("italic") ? "bg-indigo-600/30 text-indigo-400" : ""
            }`}
            title="Italic (Miring)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
              editor.isActive("bulletList") ? "bg-indigo-600/30 text-indigo-400" : ""
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
              editor.isActive("orderedList") ? "bg-indigo-600/30 text-indigo-400" : ""
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
              editor.isActive("blockquote") ? "bg-indigo-600/30 text-indigo-400" : ""
            }`}
            title="Kutipan (Quote)"
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
              editor.isActive("codeBlock") ? "bg-indigo-600/30 text-indigo-400" : ""
            }`}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={addImage}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
            title="Sisipkan Gambar"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-30"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-30"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            title="Salin semua teks"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Tersalin!" : "Salin"}</span>
          </button>

          <button
            type="button"
            onClick={downloadMarkdown}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium transition-colors"
            title="Download .md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh .MD</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="p-6 md:p-8 bg-slate-950/40 min-h-[480px] focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
