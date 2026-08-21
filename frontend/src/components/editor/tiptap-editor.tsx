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
import { useTokens } from "@/lib/use-tokens";

interface TiptapEditorProps {
  initialContent?: string;
  onChange?: (markdown: string, html: string) => void;
  readOnly?: boolean;
}

/** Simple, robust Markdown to HTML converter for Tiptap */
function markdownToHtml(md: string): string {
  if (!md) return "<p></p>";
  if (md.trim().startsWith("<") && md.trim().endsWith(">")) return md; // Already HTML

  const lines = md.split(/\r?\n/);
  const htmlLines: string[] = [];
  let inList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Close open lists if line is empty or not a list item
    if (inList && !line.trim().startsWith("- ") && !line.trim().startsWith("* ")) {
      htmlLines.push("</ul>");
      inList = false;
    }
    if (inOrderedList && !/^\d+\.\s/.test(line.trim())) {
      htmlLines.push("</ol>");
      inOrderedList = false;
    }

    if (!line.trim()) {
      continue;
    }

    // Inline formatting (bold, italic, code)
    line = line
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

    // Headings
    if (line.startsWith("### ")) {
      htmlLines.push(`<h3>${line.slice(4)}</h3>`);
    } else if (line.startsWith("## ")) {
      htmlLines.push(`<h2>${line.slice(3)}</h2>`);
    } else if (line.startsWith("# ")) {
      htmlLines.push(`<h1>${line.slice(2)}</h1>`);
    } else if (line.startsWith("> ")) {
      htmlLines.push(`<blockquote><p>${line.slice(2)}</p></blockquote>`);
    } else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      if (!inList) {
        htmlLines.push("<ul>");
        inList = true;
      }
      htmlLines.push(`<li>${line.trim().slice(2)}</li>`);
    } else if (/^\d+\.\s/.test(line.trim())) {
      if (!inOrderedList) {
        htmlLines.push("<ol>");
        inOrderedList = true;
      }
      htmlLines.push(`<li>${line.trim().replace(/^\d+\.\s/, "")}</li>`);
    } else {
      htmlLines.push(`<p>${line}</p>`);
    }
  }

  if (inList) htmlLines.push("</ul>");
  if (inOrderedList) htmlLines.push("</ol>");

  return htmlLines.join("");
}

export function TiptapEditor({ initialContent = "", onChange, readOnly = false }: TiptapEditorProps) {
  const tk = useTokens();
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
    content: markdownToHtml(initialContent),
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
    if (editor && initialContent) {
      const parsedHtml = markdownToHtml(initialContent);
      if (editor.getHTML() !== parsedHtml) {
        editor.commands.setContent(parsedHtml);
      }
    }
  }, [initialContent, editor]);

  if (!editor) {
    return (
      <div className={`h-[450px] flex items-center justify-center text-sm rounded-2xl border t-border t-bg-card ${tk.textMuted}`}>
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

  const btnBase = "p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer";
  const btnActive = "t-accent-bg shadow-sm";
  const btnInactive = `${tk.textMuted} hover:t-text-primary hover:bg-[#d97757]/10`;

  return (
    <div className={`t-card rounded-2xl overflow-hidden shadow-sm flex flex-col border t-border`}>
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b t-border t-bg-tag">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`${btnBase} ${editor.isActive("heading", { level: 1 }) ? btnActive : btnInactive}`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${btnBase} ${editor.isActive("heading", { level: 2 }) ? btnActive : btnInactive}`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`${btnBase} ${editor.isActive("heading", { level: 3 }) ? btnActive : btnInactive}`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 mx-1 border-r t-border" />

          {/* Formats */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${btnBase} ${editor.isActive("bold") ? btnActive : btnInactive}`}
            title="Bold (Tebal)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${btnBase} ${editor.isActive("italic") ? btnActive : btnInactive}`}
            title="Italic (Miring)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 mx-1 border-r t-border" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${btnBase} ${editor.isActive("bulletList") ? btnActive : btnInactive}`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${btnBase} ${editor.isActive("orderedList") ? btnActive : btnInactive}`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`${btnBase} ${editor.isActive("blockquote") ? btnActive : btnInactive}`}
            title="Kutipan (Quote)"
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`${btnBase} ${editor.isActive("codeBlock") ? btnActive : btnInactive}`}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={addImage}
            className={`${btnBase} ${btnInactive}`}
            title="Sisipkan Gambar"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 mx-1 border-r t-border" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={`${btnBase} ${btnInactive} disabled:opacity-30`}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={`${btnBase} ${btnInactive} disabled:opacity-30`}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyToClipboard}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${tk.outlineBtn}`}
            title="Salin semua teks"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Tersalin!" : "Salin"}</span>
          </button>

          <button
            type="button"
            onClick={downloadMarkdown}
            className="t-accent-bg flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold shadow-sm transition-all"
            title="Download .md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh .MD</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="p-6 md:p-8 t-bg-card min-h-[520px] focus:outline-none transition-colors">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
