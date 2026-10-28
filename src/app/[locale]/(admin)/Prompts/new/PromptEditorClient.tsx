"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import { parseMarkdownToHtml, PROMPT_CATEGORIES, type PromptCategory } from "../prompt-route";

const DEFAULT_MARKDOWN = `# Cinematic Voiceover Persona

**Tone:** Calm, authoritative, and resonant baritone.  
**Pacing:** Slow, measured tempo with 1.5s pauses for tension.  

## Delivery Guidelines
- Emphasize emotional weight on {topic}
- Avoid high vocal fry or rushed cadence
- Maintain warm, close-mic proximity effect
`;

export default function PromptEditorClient({
  editId,
  defaultAuthor = "Admin",
  initialData,
}: {
  editId?: string;
  defaultAuthor?: string;
  initialData?: { title: string; category: string; content: string; author_name: string } | null;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [category, setCategory] = useState<PromptCategory>(
    (initialData?.category as PromptCategory) ?? "Audio Generation",
  );
  const [author, setAuthor] = useState(initialData?.author_name ?? defaultAuthor);
  const [content, setContent] = useState(initialData?.content ?? DEFAULT_MARKDOWN);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (prefix: string, suffix = "", defaultText = "text") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);
    const replacement = `${prefix}${selected || defaultText}${suffix}`;
    const updated = content.slice(0, start) + replacement + content.slice(end);
    setContent(updated);
    setTimeout(() => {
      el.focus();
      const s = start + prefix.length;
      el.setSelectionRange(s, s + (selected ? selected.length : defaultText.length));
    }, 0);
  };

  const insertBlock = (blockText: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const newlinePrefix = start > 0 && content[start - 1] !== "\n" ? "\n\n" : "";
    const replacement = `${newlinePrefix}${blockText}\n`;
    setContent(content.slice(0, start) + replacement + content.slice(el.selectionEnd));
    setTimeout(() => {
      el.focus();
      const pos = start + replacement.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setSaveStatus("");
    try {
      const body = {
        title: title.trim(),
        category,
        content: content.trim(),
        author_name: author.trim() || defaultAuthor,
      };
      const url = editId ? `/Prompts/api?id=${editId}` : "/Prompts/api";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(typeof err?.detail === "string" ? err.detail : "Save failed");
      }
      setSaveStatus(editId ? "Prompt updated!" : "Prompt saved!");
      setTimeout(() => {
        router.push("/Prompts/list");
        router.refresh();
      }, 800);
    } catch (e) {
      setSaveStatus(e instanceof Error ? e.message : "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-900">
      {/* Top Form Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Title */}
        <div className="md:col-span-1">
          <label
            htmlFor="prompt-title"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Prompt Title
          </label>
          <input
            id="prompt-title"
            type="text"
            placeholder="e.g. Cinematic Voice Persona"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
          />
        </div>

        {/* Use Case / Category */}
        <div>
          <label
            htmlFor="prompt-category"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Use Case / Type
          </label>
          <select
            id="prompt-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as PromptCategory)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {PROMPT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Author */}
        <div>
          <label
            htmlFor="prompt-author"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Author Name
          </label>
          <input
            id="prompt-author"
            type="text"
            placeholder="e.g. Your Name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Mode Switch & Toolbar */}
      <div className="mb-3 space-y-2 border-b border-gray-200 pb-3 dark:border-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
                mode === "write"
                  ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-900 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Write (Markdown)
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
                mode === "preview"
                  ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-900 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Preview
            </button>
          </div>
          <span className="hidden text-xs text-gray-400 sm:inline">
            Click any button below to insert formatted Markdown
          </span>
        </div>

        {mode === "write" && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {/* Headings */}
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-800 dark:bg-gray-800/50">
              <button type="button" onClick={() => insertMarkdown("# ", "", "Main Heading")} className="rounded px-2 py-1 text-xs font-bold text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Heading 1">H1</button>
              <button type="button" onClick={() => insertMarkdown("## ", "", "Section Heading")} className="rounded px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Heading 2">H2</button>
              <button type="button" onClick={() => insertMarkdown("### ", "", "Sub-heading")} className="rounded px-2 py-1 text-xs font-medium text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Heading 3">H3</button>
            </div>

            {/* Text formats */}
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-800 dark:bg-gray-800/50">
              <button type="button" onClick={() => insertMarkdown("**", "**", "bold text")} className="rounded px-2 py-1 text-xs font-bold text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Bold">B</button>
              <button type="button" onClick={() => insertMarkdown("*", "*", "italic text")} className="rounded px-2 py-1 text-xs italic text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Italic">I</button>
              <button type="button" onClick={() => insertMarkdown("~~", "~~", "strikethrough")} className="rounded px-2 py-1 text-xs line-through text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Strikethrough">S</button>
            </div>

            {/* Lists */}
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-800 dark:bg-gray-800/50">
              <button type="button" onClick={() => insertMarkdown("- ", "", "List item")} className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Bullet List">• Bullet</button>
              <button type="button" onClick={() => insertMarkdown("1. ", "", "Numbered item")} className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Numbered List">1. List</button>
              <button type="button" onClick={() => insertMarkdown("- [ ] ", "", "Task item")} className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Task Checklist">☑ Task</button>
            </div>

            {/* Blocks */}
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-800 dark:bg-gray-800/50">
              <button type="button" onClick={() => insertMarkdown("> ", "", "Quote text")} className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Blockquote">&ldquo; Quote</button>
              <button type="button" onClick={() => insertMarkdown("`", "`", "code")} className="rounded px-2 py-1 font-mono text-xs text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Inline Code">&lt;/&gt; Code</button>
              <button type="button" onClick={() => insertBlock("```\n// Add instructions here\n```")} className="rounded px-2 py-1 font-mono text-xs text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Code Block">&#123; &#125; Block</button>
            </div>

            {/* Extras */}
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-800 dark:bg-gray-800/50">
              <button type="button" onClick={() => insertMarkdown("[Link Title](", ")", "https://example.com")} className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Link">🔗 Link</button>
              <button type="button" onClick={() => insertBlock("| Parameter | Description |\n| --- | --- |\n| Tone | Enthusiastic |")} className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Table">▦ Table</button>
              <button type="button" onClick={() => insertBlock("---")} className="rounded px-2 py-1 text-xs text-gray-700 hover:bg-white hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700" title="Divider">— Divider</button>
            </div>

            {/* Prompt Variables */}
            <div className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50/60 p-0.5 dark:border-amber-800/50 dark:bg-amber-950/30">
              <span className="px-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">Tags:</span>
              <button type="button" onClick={() => insertMarkdown("{topic}", "")} className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-amber-800 shadow-2xs hover:bg-amber-100 dark:bg-gray-900 dark:text-amber-300 dark:hover:bg-gray-800" title="{topic}">&#123;topic&#125;</button>
              <button type="button" onClick={() => insertMarkdown("{tone}", "")} className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-amber-800 shadow-2xs hover:bg-amber-100 dark:bg-gray-900 dark:text-amber-300 dark:hover:bg-gray-800" title="{tone}">&#123;tone&#125;</button>
              <button type="button" onClick={() => insertMarkdown("{target_audience}", "")} className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-amber-800 shadow-2xs hover:bg-amber-100 dark:bg-gray-900 dark:text-amber-300 dark:hover:bg-gray-800" title="{target_audience}">&#123;target_audience&#125;</button>
            </div>
          </div>
        )}
      </div>

      {/* Editor / Preview */}
      {mode === "write" ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your prompt here using markdown or click the buttons above to format..."
          rows={14}
          className="w-full rounded-lg border border-gray-300 bg-transparent p-4 font-mono text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-gray-100"
        />
      ) : (
        <div
          className="min-h-[350px] rounded-lg border border-gray-200 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-950/40"
          dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(content) }}
        />
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          {saveStatus && (
            <span
              className={`text-sm font-medium ${
                saveStatus.includes("fail") || saveStatus.includes("failed")
                  ? "text-red-500"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {saveStatus}
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !title.trim() || !content.trim()}
        >
          {saving ? "Saving…" : editId ? "Update Prompt" : "Save Prompt"}
        </Button>
      </div>
    </div>
  );
}
