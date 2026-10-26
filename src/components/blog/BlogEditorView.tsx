"use client";

import React, { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/gateway/ui/card";
import { Badge } from "@/components/gateway/ui/badge";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import {
  PencilIcon,
  PlusIcon,
  CopyIcon,
  CheckLineIcon,
  TrashBinIcon,
  DocsIcon,
  TimeIcon,
  CheckCircleIcon,
  ImageIcon,
  VideoIcon,
  FileIcon,
} from "@/icons";
import {
  CustomImage,
  CustomVideo,
  CustomFileAttachment,
} from "./extensions/mediaExtensions";
import MediaUploadModal, { type MediaModalType } from "./MediaUploadModal";

export interface BlogDraft {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  updatedAt: string;
  wordCount: number;
}

const STORAGE_KEY = "ai_voice_blog_drafts";

const INITIAL_SAMPLE_POST: BlogDraft = {
  id: "sample-blog-1",
  title: "Top Free AI Voice Generators in 2026: Realistic TTS Guide",
  slug: "top-free-ai-voice-generators-2026",
  category: "AI Tools",
  excerpt:
    "Explore the top free AI voice generators available in 2026. Learn how neural speech synthesis produces lifelike, expressive voiceovers with zero equipment.",
  content: `<h1>Top Free AI Voice Generators in 2026: Complete Overview</h1>
<p>Modern artificial intelligence voice synthesis has reached studio-grade realism. Whether you are producing video essays, podcasts, audiobooks, or interactive assistants, neural text-to-speech (TTS) transforms written words into nuanced human voice in seconds.</p>

<figure data-type="custom-image" class="my-6 text-center select-none"><img src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200&auto=format&fit=crop" alt="Studio Audio Equipment and Waveform" class="mx-auto max-h-[500px] w-auto rounded-xl border border-gray-200 object-cover shadow-sm dark:border-gray-800" /><figcaption class="mt-2 text-xs italic text-gray-500 dark:text-gray-400">Figure 1: High fidelity voice synthesis powered by modern neural architectures</figcaption></figure>

<h2>Key Features of Modern Voice Models</h2>
<p>When selecting a voice generator for your project, consider these fundamental capabilities:</p>
<ul>
  <li><strong>Emotion & Tone Control:</strong> Adjust conversational, excited, somber, or whisper delivery modes.</li>
  <li><strong>Multi-Language & Accent Fidelity:</strong> Accurate pronunciation across over 60 international languages and local dialects.</li>
  <li><strong>Low Latency Streaming:</strong> Sub-second audio delivery suitable for real-time applications.</li>
</ul>

<blockquote>"Studio quality voiceovers no longer require thousands of dollars in microphones and acoustically treated rooms. Modern neural synthesis gives every developer and creator a personal voice actor."</blockquote>

<h2>Download Resources & Guides</h2>
<div data-type="custom-file-attachment" class="my-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/80 p-3.5 transition dark:border-gray-800 dark:bg-gray-800/40 select-none"><div class="flex items-center gap-3 overflow-hidden text-start"><div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-bold text-xs uppercase">PDF</div><div class="min-w-0"><p class="truncate text-sm font-medium text-gray-800 dark:text-gray-200">AI-Voice-Generation-Cheatsheet-2026.pdf</p><p class="text-xs text-gray-500 dark:text-gray-400">1.8 MB</p></div></div><a href="#" download="AI-Voice-Generation-Cheatsheet-2026.pdf" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600 shadow-theme-xs shrink-0">Download</a></div>

<h2>Sample API Usage in Next.js</h2>
<pre><code>const response = await fetch('/api/v1/voice/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Welcome to our voice generator platform!',
    voice_id: 'en-US-neural-clarity',
    speed: 1.0
  })
});
const audioBlob = await response.blob();</code></pre>

<h2>Conclusion & Next Steps</h2>
<p>With realistic cadence, breathing pauses, and natural inflection, AI voice generation enables rapid content publishing. Use the toolbar above to upload your own images, embed videos, and attach downloadable files!</p>`,
  updatedAt: "2026-10-21, 04:00 AM",
  wordCount: 195,
};

function calculateWordCount(text: string): number {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getInitialDrafts(storageKey: string): BlogDraft[] {
  if (typeof window === "undefined") {
    return [INITIAL_SAMPLE_POST];
  }
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      const parsed: BlogDraft[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    window.localStorage.setItem(storageKey, JSON.stringify([INITIAL_SAMPLE_POST]));
  } catch {
    // fallback if localStorage not accessible
  }
  return [INITIAL_SAMPLE_POST];
}

function generatePostId(): string {
  return "post-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function BlogEditorView({ storageKey = STORAGE_KEY, onUnsavedChange }: { storageKey?: string; onUnsavedChange?: (dirty: boolean) => void } = {}) {
  const [drafts, setDrafts] = useState<BlogDraft[]>(() => getInitialDrafts(storageKey));
  const initialPost = drafts[0] || INITIAL_SAMPLE_POST;

  const [currentId, setCurrentId] = useState<string>(initialPost.id);
  const [title, setTitle] = useState<string>(initialPost.title);
  const [slug, setSlug] = useState<string>(initialPost.slug);
  const [category, setCategory] = useState<string>(initialPost.category);
  const [excerpt, setExcerpt] = useState<string>(initialPost.excerpt);
  const [saveStatus, setSaveStatusValue] = useState<string>("Saved in localStorage");
  const setSaveStatus = useCallback((status: string) => {
    onUnsavedChange?.(status === "Unsaved changes" || status === "New draft started");
    setSaveStatusValue(status);
  }, [onUnsavedChange]);
  const [copiedType, setCopiedType] = useState<"html" | "json" | null>(null);
  const [wordCount, setWordCount] = useState<number>(initialPost.wordCount || 195);

  // Modal State for Image, Video, File
  const [mediaModalOpen, setMediaModalOpen] = useState<boolean>(false);
  const [mediaModalType, setMediaModalType] = useState<MediaModalType>("image");

  // Initialize Tiptap with Media extensions
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      CustomImage,
      CustomVideo,
      CustomFileAttachment,
    ],
    content: initialPost.content,
    editorProps: {
      attributes: {
        class:
          "min-h-[360px] p-4 text-gray-800 dark:text-gray-100 focus:outline-none selection:bg-brand-100 dark:selection:bg-brand-900/40 text-base leading-relaxed",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setSaveStatus("Unsaved changes");
      setWordCount(calculateWordCount(currentEditor.getText()));
    },
  });

  // Handle title change & auto-generate slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(slugify(newTitle));
    setSaveStatus("Unsaved changes");
  };

  // Save current post to localStorage
  const handleSaveDraft = useCallback(() => {
    if (!editor) return;
    const contentHtml = editor.getHTML();
    const plainText = editor.getText();
    const count = calculateWordCount(plainText);
    const now = new Date().toLocaleString();

    const updatedPost: BlogDraft = {
      id: currentId,
      title: title || "Untitled Blog Post",
      slug: slug || slugify(title || "untitled-post"),
      category: category || "General",
      excerpt: excerpt || "",
      content: contentHtml,
      updatedAt: now,
      wordCount: count,
    };

    setDrafts((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === updatedPost.id);
      let updated: BlogDraft[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = updatedPost;
      } else {
        updated = [updatedPost, ...prev];
      }
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save to localStorage:", err);
      }
      return updated;
    });

    setSaveStatus(`Saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
  }, [editor, currentId, title, slug, category, excerpt, storageKey, setSaveStatus]);

  // Load a draft from the saved list
  const handleLoadDraft = (draft: BlogDraft) => {
    setCurrentId(draft.id);
    setTitle(draft.title);
    setSlug(draft.slug);
    setCategory(draft.category);
    setExcerpt(draft.excerpt);
    if (editor) {
      editor.commands.setContent(draft.content);
      setWordCount(calculateWordCount(editor.getText()));
    }
    setSaveStatus(`Loaded (${draft.updatedAt})`);
  };

  // Create a brand new blank draft
  const handleNewDraft = () => {
    const newId = generatePostId();
    setCurrentId(newId);
    setTitle("");
    setSlug("");
    setCategory("AI Voice");
    setExcerpt("");
    if (editor) {
      editor.commands.setContent("<p></p>");
      setWordCount(0);
    }
    setSaveStatus("New draft started");
  };

  // Delete a draft from localStorage
  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDrafts((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(filtered));
      } catch (err) {
        console.error("Failed to delete draft:", err);
      }
      return filtered;
    });

    if (currentId === id) {
      handleNewDraft();
    }
  };

  // Media Insertion Handlers
  const handleOpenMediaModal = (type: MediaModalType) => {
    setMediaModalType(type);
    setMediaModalOpen(true);
  };

  const handleInsertImage = (data: { src: string; alt?: string; caption?: string }) => {
    if (!editor) return;
    editor.chain().focus().setImage(data).run();
    setSaveStatus("Unsaved changes");
  };

  const handleInsertVideo = (data: { src: string; caption?: string }) => {
    if (!editor) return;
    editor.chain().focus().setVideo(data).run();
    setSaveStatus("Unsaved changes");
  };

  const handleInsertFile = (data: {
    src: string;
    fileName: string;
    fileSize?: string;
    fileType?: string;
  }) => {
    if (!editor) return;
    editor.chain().focus().setFileAttachment(data).run();
    setSaveStatus("Unsaved changes");
  };

  // Copy HTML or JSON to clipboard
  const handleCopy = (type: "html" | "json") => {
    if (!editor) return;
    if (type === "html") {
      navigator.clipboard.writeText(editor.getHTML());
    } else {
      const data = {
        title,
        slug,
        category,
        excerpt,
        content: editor.getHTML(),
        wordCount: calculateWordCount(editor.getText()),
      };
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    }
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const readTimeEstimate = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageBreadcrumb pageTitle="Blog Editor (Tiptap)" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Write blogs with rich text, images, videos, and file uploads. Data persists automatically to localStorage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="outline" className="text-xs">
            {saveStatus}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            startIcon={<PlusIcon className="size-4" />}
            onClick={handleNewDraft}
            disabled={!editor}
          >
            New Blog
          </Button>
          <Button
            size="sm"
            variant="primary"
            startIcon={<CheckLineIcon className="size-4" />}
            onClick={handleSaveDraft}
            disabled={!editor}
          >
            Save Draft
          </Button>
        </div>
      </div>

      {/* Main Grid: Editor (Left 2/3) + Drafts & Tools (Right 1/3) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column: Post Details & Tiptap Canvas */}
        <div className="space-y-6 xl:col-span-2">
          {/* Metadata Card */}
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <PencilIcon className="size-4 text-brand-500" />
                Blog Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Blog Title
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Free AI Voice Generators in 2026..."
                  value={title}
                  onChange={handleTitleChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    URL Slug
                  </label>
                  <Input
                    type="text"
                    placeholder="my-blog-post-slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSaveStatus("Unsaved changes");
                    }}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. AI Tools, Tutorial, News"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSaveStatus("Unsaved changes");
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Excerpt / Short Summary
                </label>
                <TextArea
                  rows={2}
                  placeholder="A concise summary of the article for blog cards and SEO preview..."
                  value={excerpt}
                  onChange={(val) => {
                    setExcerpt(val);
                    setSaveStatus("Unsaved changes");
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tiptap Editor Card */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base font-semibold">Rich Text Editor</CardTitle>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>~{readTimeEstimate} min read</span>
                </div>
              </div>
            </CardHeader>

            {/* Tiptap Toolbar */}
            {editor && (
              <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50/70 p-2 dark:border-gray-800 dark:bg-gray-800/40">
                {/* Heading Options */}
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition ${editor.isActive("paragraph")
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                >
                  P
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`rounded px-2.5 py-1 text-xs font-bold transition ${editor.isActive("heading", { level: 1 })
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`rounded px-2.5 py-1 text-xs font-bold transition ${editor.isActive("heading", { level: 2 })
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`rounded px-2.5 py-1 text-xs font-bold transition ${editor.isActive("heading", { level: 3 })
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                >
                  H3
                </button>

                <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-700" />

                {/* Inline Formatting */}
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`rounded px-2.5 py-1 text-xs font-bold transition ${editor.isActive("bold")
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  title="Bold (Ctrl+B)"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`rounded px-2.5 py-1 text-xs italic transition ${editor.isActive("italic")
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  title="Italic (Ctrl+I)"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`rounded px-2.5 py-1 text-xs line-through transition ${editor.isActive("strike")
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  title="Strikethrough"
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={`rounded px-2.5 py-1 font-mono text-xs transition ${editor.isActive("code")
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  title="Inline Code"
                >
                  &lt;&gt;
                </button>

                <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-700" />

                {/* Lists & Blocks */}
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`rounded px-2 py-1 text-xs transition ${editor.isActive("bulletList")
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  title="Bullet List"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`rounded px-2 py-1 text-xs transition ${editor.isActive("orderedList")
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  title="Numbered List"
                >
                  1. List
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`rounded px-2 py-1 text-xs transition ${editor.isActive("blockquote")
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  title="Quote"
                >
                  &ldquo; Quote
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className={`rounded px-2 py-1 font-mono text-xs transition ${editor.isActive("codeBlock")
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  title="Code Block"
                >
                  {`{ } Code`}
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  className="rounded px-2 py-1 text-xs text-gray-600 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                  title="Horizontal Divider"
                >
                  ― Rule
                </button>

                <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-700" />

                {/* Media & Upload Controls */}
                <button
                  type="button"
                  onClick={() => handleOpenMediaModal("image")}
                  className="inline-flex items-center gap-1.5 rounded bg-brand-50/60 px-2.5 py-1 text-xs font-medium text-brand-600 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                  title="Insert Image (Upload or URL)"
                >
                  <ImageIcon className="size-3.5" />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenMediaModal("video")}
                  className="inline-flex items-center gap-1.5 rounded bg-brand-50/60 px-2.5 py-1 text-xs font-medium text-brand-600 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                  title="Insert Video (Upload or YouTube link)"
                >
                  <VideoIcon className="size-3.5" />
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenMediaModal("file")}
                  className="inline-flex items-center gap-1.5 rounded bg-brand-50/60 px-2.5 py-1 text-xs font-medium text-brand-600 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                  title="Attach Downloadable File"
                >
                  <FileIcon className="size-3.5" />
                  <span>File</span>
                </button>

                <div className="ms-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="rounded px-2 py-1 text-xs text-gray-600 transition hover:bg-gray-200 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-700"
                    title="Undo"
                  >
                    ↶ Undo
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="rounded px-2 py-1 text-xs text-gray-600 transition hover:bg-gray-200 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-700"
                    title="Redo"
                  >
                    ↷ Redo
                  </button>
                </div>
              </div>
            )}

            {/* Editable Content Container */}
            <div className="tiptap-editor-content bg-white dark:bg-gray-900/60">
              <EditorContent editor={editor} />
            </div>

            {/* Editor Footer Info */}
            <div className="flex flex-wrap items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-2 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <TimeIcon className="size-3.5" />
                <span>Auto-saves to browser localStorage</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleCopy("html")}
                  className="inline-flex items-center gap-1 font-medium text-brand-500 hover:text-brand-600"
                >
                  {copiedType === "html" ? (
                    <>
                      <CheckCircleIcon className="size-3.5 text-success-500" />
                      <span>Copied HTML!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="size-3.5" />
                      <span>Copy HTML</span>
                    </>
                  )}
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => handleCopy("json")}
                  className="inline-flex items-center gap-1 font-medium text-brand-500 hover:text-brand-600"
                >
                  {copiedType === "json" ? (
                    <>
                      <CheckCircleIcon className="size-3.5 text-success-500" />
                      <span>Copied JSON!</span>
                    </>
                  ) : (
                    <>
                      <DocsIcon className="size-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: LocalStorage Saved Drafts List */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <DocsIcon className="size-4 text-brand-500" />
                  Saved Drafts ({drafts.length})
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  localStorage
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-4">
              {drafts.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  No drafts saved yet. Write an article and click &ldquo;Save Draft&rdquo;.
                </div>
              ) : (
                drafts.map((draft) => {
                  const isActive = draft.id === currentId;
                  return (
                    <div
                      key={draft.id}
                      onClick={() => handleLoadDraft(draft)}
                      className={`group relative flex cursor-pointer flex-col gap-1.5 rounded-xl border p-3.5 transition ${isActive
                        ? "border-brand-500 bg-brand-50/40 dark:border-brand-500/60 dark:bg-brand-500/10"
                        : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-800/40 dark:hover:border-gray-700"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`line-clamp-2 text-sm font-medium ${isActive
                            ? "text-brand-600 dark:text-brand-400"
                            : "text-gray-800 dark:text-gray-100"
                            }`}
                        >
                          {draft.title || "Untitled Draft"}
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteDraft(draft.id, e)}
                          title="Delete Draft"
                          className="text-gray-400 opacity-60 transition hover:text-error-500 group-hover:opacity-100"
                        >
                          <TrashBinIcon className="size-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">
                          {draft.category || "General"}
                        </span>
                        <span>•</span>
                        <span>{draft.wordCount} words</span>
                        <span>•</span>
                        <span>{draft.updatedAt}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Media Upload Modal */}
      <MediaUploadModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        type={mediaModalType}
        onInsertImage={handleInsertImage}
        onInsertVideo={handleInsertVideo}
        onInsertFile={handleInsertFile}
      />
    </div>
  );
}
