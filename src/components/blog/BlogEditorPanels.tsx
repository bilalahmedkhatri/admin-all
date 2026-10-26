"use client";
import type { ReactNode } from "react";
import {
  useEditor,
  useEditorState,
  EditorContent,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "next/image";
import { FaImage, FaSearch, FaTimes } from "react-icons/fa";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { blogImage, blogAudio, blogYoutube } from "./extensions/blogMedia";
import { attributedImageContent, type CoverImageDetails } from "./imageAttribution";
import { blogTables } from "./extensions/blogTables";

export function EditorPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <ComponentCard unstyledContent className="overflow-hidden shadow-theme-xs">
      <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <h2 className="text-theme-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          {title}
        </h2>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </ComponentCard>
  );
}

export function EditorStats({
  editor,
  dirty,
}: {
  editor: Editor;
  dirty: boolean;
}) {
  const text = useEditorState({
    editor,
    selector: ({ editor }) => editor.getText(),
  });
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-3 text-theme-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
      <div className="flex flex-wrap gap-4">
        <span>{`Words: ${words}`}</span>
        <span>{`Characters: ${text.length}`}</span>
        <span>{`Reading time: ${Math.ceil(words / 200)} min`}</span>
      </div>
      <span
        className={
          dirty
            ? "text-warning-600 dark:text-warning-400"
            : "text-success-600 dark:text-success-400"
        }
      >
        {dirty ? "Unsaved changes" : "No pending edits"}
      </span>
    </div>
  );
}

export function SearchPreview({
  editor,
  title,
  excerpt,
  canonical,
  slug,
}: {
  editor: Editor;
  title: string;
  excerpt: string;
  canonical: string | null;
  slug?: string;
}) {
  const text = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor.getText().replace(/\s+/gu, " ").trim().slice(0, 160),
  });
  return (
    <EditorPanel title={"SEO & search preview"}>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {
          "Your title and excerpt shape the search listing. Final metadata and the URL are generated when you save."
        }
      </p>
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        <p className="mb-3 flex items-center gap-2 text-theme-xs font-semibold tracking-wider text-gray-400 uppercase">
          <FaSearch aria-hidden="true" />
          {"Search result preview"}
        </p>
        <p className="text-theme-xs break-all text-gray-500 dark:text-gray-400">
          {canonical
            ? canonical + (slug ? "/" + slug : "")
            : "URL available after saving"}
        </p>
        <p className="mt-1 text-lg leading-snug text-blue-light-700 dark:text-blue-light-400">
          {title.slice(0, 70) || "Untitled post"}
        </p>
        <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {excerpt.slice(0, 160) ||
            text ||
            "Your article summary will appear here."}
        </p>
      </div>
    </EditorPanel>
  );
}

export function CoverImageCard({
  src,
  alt,
  disabled,
  onChoose,
  onRemove,
  children,
}: {
  src?: string;
  alt?: string;
  disabled: boolean;
  onChoose: () => void;
  onRemove: () => void;
  children?: ReactNode;
}) {
  return (
    <EditorPanel title={"Featured image"}>
      <button
        type="button"
        onClick={onChoose}
        disabled={disabled}
        className="group relative flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-brand-400 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-brand-500/10"
      >
        {src ? (
          <Image
            unoptimized
            src={src}
            alt={alt ?? "Featured image"}
            fill
            className="object-cover"
          />
        ) : (
          <>
            <FaImage aria-hidden="true" className="text-3xl text-gray-400" />
            <span className="text-sm font-medium">{"Choose cover image"}</span>
          </>
        )}
      </button>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={onChoose}
          className="cursor-pointer"
        >
          {src ? "Change image" : "Choose cover image"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={onRemove}
          className="cursor-pointer"
        >
          {"Clear selection"}
        </Button>
      </div>
      {children}
      <p className="text-theme-xs text-gray-400">
        {
          "Upload a cover or select one of your images. PNG, JPEG or WebP, up to 10 MiB."
        }
      </p>
    </EditorPanel>
  );
}

export function ArticlePreview({
  document,
  title,
  author,
  category,
  cover,
  coverDetails,
  onClose,
}: {
  document: JSONContent;
  title: string;
  author: string;
  category: string;
  cover?: string;
  coverDetails?: CoverImageDetails;
  onClose: () => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit, blogTables, blogImage, blogAudio, blogYoutube],
    content: cover && coverDetails ? {
      type: "doc",
      content: [...attributedImageContent({ public_url: cover, media_type: "image/webp", original_filename: "Featured image", ...coverDetails }), ...(document.content ?? [])],
    } : document,
    editable: false,
    immediatelyRender: false,
  });
  return (
    <Modal
      isOpen
      onClose={onClose}
      showCloseButton={false}
      className="mx-4 max-h-full max-w-3xl overflow-y-auto"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-preview-title"
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
          <h2
            id="article-preview-title"
            className="text-sm font-semibold text-gray-600 dark:text-gray-300"
          >
            {"Preview"}
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            aria-label={"Close preview"}
            className="cursor-pointer"
          >
            <FaTimes aria-hidden="true" />
          </Button>
        </div>
        <article className="space-y-5 p-6 sm:p-8">
          {category && (
            <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-theme-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              {category}
            </span>
          )}
          <h3 className="text-title-sm font-bold text-gray-900 dark:text-white">
            {title || "Untitled post"}
          </h3>
          <p className="border-b border-gray-100 pb-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            {author}
          </p>
          {cover && !coverDetails && (
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <Image
                unoptimized
                src={cover}
                alt={title || "Featured image"}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="tiptap-editor-content text-gray-800 dark:text-gray-200">
            <EditorContent editor={editor} />
          </div>
        </article>
      </div>
    </Modal>
  );
}
