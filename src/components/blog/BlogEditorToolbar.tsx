"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useEditorState, type Editor } from "@tiptap/react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import {
  blogLink,
  parseBlogDocument,
  BlogDocumentImportError,
  blogDocumentExample,
} from "@/lib/gateway/blog-document";
import { insertBlogMedia } from "./extensions/blogMedia";
// import {
//   FaStrikethrough,
//   FaParagraph,
//   FaCodiepie,
//   FaListUnordered,
//   FaListOrdered,
//   FaIndentIncrease,
//   FaIndentDecrease,
//   FaDoubleQuotesR,
//   FaCodeBoxLine,
//   FaSeparator,
//   FaTextWrap,
//   FaFormatClear,
//   FaSelectAll,
//   FaArrowGoBackLine,
//   FaArrowGoForwardLine,
//   FaLink,
//   FaLinkUnlink,
//   FaImages,
//   FaVideoLine,
//   FaBracesLine,
//   FaBold, FaItalic, FaUnderline
// } from "react-icons/fa";

// const toolIcons: Record<string, ReactNode> = {
//   bold: <FaBold />,
//   italic: <FaItalic />,
//   underline: <FaUnderline />,
//   strike: <FaStrikethrough />,
//   paragraph: <FaParagraph />,
//   code: <FaCodiepie />,
//   bulletList: <FaListUnordered />,
//   orderedList: <FaListOrdered />,
//   indent: <FaIndentIncrease />,
//   outdent: <FaIndentDecrease />,
//   blockquote: <FaDoubleQuotesR />,
//   codeBlock: <FaCodeBoxLine />,
//   horizontalRule: <FaSeparator />,
//   hardBreak: <FaTextWrap />,
//   clear: <FaFormatClear />,
//   selectAll: <FaSelectAll />,
//   undo: <FaArrowGoBackLine />,
//   redo: <FaArrowGoForwardLine />,
// };

import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaParagraph,
  FaCode,
  FaListUl,
  FaListOl,
  FaIndent,
  FaOutdent,
  FaQuoteRight,
  FaMinus,
  FaEraser,
  FaCheckSquare,
  FaUndo,
  FaRedo,
  FaLink,
  FaUnlink,
  FaImage,
  FaVideo,
  FaCodeBranch,
} from "react-icons/fa";
import { GoUnlink } from "react-icons/go";
import { LuBraces } from "react-icons/lu";

const toolIcons: Record<string, ReactNode> = {
  bold: <FaBold />,
  italic: <FaItalic />,
  underline: <FaUnderline />,
  strike: <FaStrikethrough />,
  paragraph: <FaParagraph />,
  code: <FaCode />,
  bulletList: <FaListUl />,
  orderedList: <FaListOl />,
  indent: <FaIndent />,
  outdent: <FaOutdent />,
  blockquote: <FaQuoteRight />,
  codeBlock: <FaCodeBranch />,
  horizontalRule: <FaMinus />,
  hardBreak: <FaCode />, // FaTextWrap ki jagah FaCode ya similar use kiya hai
  clear: <FaEraser />,
  selectAll: <FaCheckSquare />,
  undo: <FaUndo />,
  redo: <FaRedo />,
  link: <FaLink />,
  unlink: <GoUnlink />,
  image: <FaImage />,
  video: <FaVideo />,
};
const toolClass =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-200 dark:hover:bg-gray-800 [&>svg]:size-3.5";
const activeClass =
  "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300";

export default function BlogEditorToolbar({
  editor,
  disabled,
  onUpload,
  onDialogChange,
}: {
  editor: Editor;
  disabled: boolean;
  onUpload: () => void;
  onDialogChange: (open: boolean) => void;
}) {
  const t = useTranslations("blogJsonImport");
  const [importIssue, setImportIssue] =
    useState<BlogDocumentImportError | null>(null);
  const [dialog, setDialog] = useState<"json" | "link" | "video" | null>(null);
  const [source, setSource] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    onDialogChange(dialog !== null);
    return () => onDialogChange(false);
  }, [dialog, onDialogChange]);
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      paragraph: e.isActive("paragraph"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      heading:
        [1, 2, 3, 4, 5, 6].find((level) => e.isActive("heading", { level })) ||
        0,
      undo: e.can().undo(),
      redo: e.can().redo(),
      indent: e.can().sinkListItem("listItem"),
      outdent: e.can().liftListItem("listItem"),
    }),
  });
  const actions = [
    {
      key: "bold",
      label: "Bold",
      active: state.bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      key: "italic",
      label: "Italic",
      active: state.italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      key: "underline",
      label: "Underline",
      active: state.underline,
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      key: "strike",
      label: "Strikethrough",
      active: state.strike,
      run: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      key: "code",
      label: "Inline code",
      active: state.code,
      run: () => editor.chain().focus().toggleCode().run(),
    },
    {
      key: "paragraph",
      label: "Paragraph",
      active: state.paragraph,
      run: () => editor.chain().focus().setParagraph().run(),
    },
    {
      key: "bulletList",
      label: "Bullet list",
      active: state.bulletList,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      key: "orderedList",
      label: "Numbered list",
      active: state.orderedList,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      key: "indent",
      label: "Indent list",
      unavailable: !state.indent,
      run: () => editor.chain().focus().sinkListItem("listItem").run(),
    },
    {
      key: "outdent",
      label: "Outdent list",
      unavailable: !state.outdent,
      run: () => editor.chain().focus().liftListItem("listItem").run(),
    },
    {
      key: "blockquote",
      label: "Quote",
      active: state.blockquote,
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      key: "codeBlock",
      label: "Code block",
      active: state.codeBlock,
      run: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      key: "horizontalRule",
      label: "Separator",
      run: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      key: "hardBreak",
      label: "Line break",
      run: () => editor.chain().focus().setHardBreak().run(),
    },
    {
      key: "clear",
      label: "Clear formatting",
      run: () => editor.chain().focus().unsetAllMarks().clearNodes().run(),
    },
    {
      key: "selectAll",
      label: "Select all",
      run: () => editor.chain().focus().selectAll().run(),
    },
    {
      key: "undo",
      label: "Undo",
      unavailable: !state.undo,
      run: () => editor.chain().focus().undo().run(),
    },
    {
      key: "redo",
      label: "Redo",
      unavailable: !state.redo,
      run: () => editor.chain().focus().redo().run(),
    },
  ];
  function open(kind: "json" | "link" | "video") {
    setError("");
    setDialog(kind);
    if (kind === "json") setSource("");
    else
      setLink(
        kind === "video" ? "" : String(editor.getAttributes("link").href || ""),
      );
  }
  return (
    <>
      <div
        role="group"
        aria-label={"Editor formatting and content"}
        tabIndex={0}
        className="custom-scrollbar max-w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-xl border border-gray-200 bg-white p-2 shadow-theme-xs focus-visible:outline-2 focus-visible:outline-brand-500 dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="flex w-max min-w-full flex-nowrap items-center gap-1">
          <select
            aria-label={"Text style"}
            title={"Text style"}
            disabled={disabled}
            value={state.heading || 0}
            onChange={(event) => {
              const level = Number(event.target.value);
              if (level === 0) editor.chain().focus().setParagraph().run();
              else
                editor
                  .chain()
                  .focus()
                  .setHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                  .run();
            }}
            className="h-7 w-12 shrink-0 cursor-pointer rounded-lg border-0 bg-brand-50 px-2 text-sm font-bold text-brand-600 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-30 dark:bg-brand-500/15 dark:text-brand-300"
          >
            <option value={0}>{"P"}</option>
            {([1, 2, 3, 4, 5, 6] as const).map((level) => (
              <option key={level} value={level}>
                {`Heading ${level}`}
              </option>
            ))}
          </select>
          {actions.map((action) => (
            <button
              type="button"
              key={action.key}
              aria-label={action.label}
              title={action.label}
              aria-pressed={action.active}
              disabled={disabled || action.unavailable}
              onMouseDown={(event) => event.preventDefault()}
              onClick={action.run}
              className={`${toolClass} ${action.active ? activeClass : ""}`}
            >
              {toolIcons[action.key]}
            </button>
          ))}
          <span
            aria-hidden="true"
            className="mx-1 h-6 w-px shrink-0 bg-gray-200 dark:bg-gray-700"
          />
          <button
            type="button"
            aria-label={"Add / edit link"}
            title={"Add / edit link"}
            aria-pressed={state.link}
            disabled={disabled}
            onClick={() => open("link")}
            className={`${toolClass} ${state.link ? activeClass : ""}`}
          >
            <FaLink />
          </button>
          <button
            type="button"
            aria-label={"Remove link"}
            title={"Remove link"}
            disabled={disabled || !state.link}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              editor.chain().focus().extendMarkRange("link").unsetLink().run()
            }
            className={toolClass}
          >
            <FaUnlink />
          </button>
          <button
            type="button"
            aria-label={"Upload image / video / audio"}
            title={"Upload image / video / audio"}
            disabled={disabled}
            onClick={onUpload}
            className={toolClass}
          >
            <FaImage />
          </button>
          <button
            type="button"
            aria-label={"Insert YouTube video"}
            title={"Insert YouTube video"}
            disabled={disabled}
            onClick={() => open("video")}
            className={toolClass}
          >
            <FaVideo />
          </button>
          <button
            type="button"
            aria-label={"Import JSON"}
            title={"Import JSON"}
            disabled={disabled}
            onClick={() => open("json")}
            className={toolClass}
          >
            <LuBraces />
          </button>
        </div>
      </div>
      {dialog && (
        <Modal
          isOpen
          onClose={() => setDialog(null)}
          showCloseButton={false}
          className="mx-4 max-h-full max-w-3xl overflow-y-auto p-6"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-editor-dialog-title"
          >
            <h2
              id="blog-editor-dialog-title"
              className="text-lg font-semibold text-gray-800 dark:text-white"
            >
              {dialog === "json"
                ? "Import JSON"
                : dialog === "video"
                  ? "Insert YouTube video"
                  : "Add / edit link"}
            </h2>
            <p
              id="blog-editor-dialog-help"
              className="my-3 text-sm text-gray-600 dark:text-gray-300"
            >
              {dialog === "json"
                ? t("help")
                : dialog === "video"
                  ? "Paste an HTTPS YouTube video URL to insert it at the current selection. Existing content is preserved."
                  : "Use an HTTPS URL, a site-relative path or an anchor. The link applies to your selected text."}
            </p>
            {dialog === "json" && (
              <details
                id="blog-json-format-help"
                className="mb-4 text-sm text-gray-600 dark:text-gray-300"
              >
                <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
                  {t("guide")}
                </summary>
                <div className="mt-3 space-y-3">
                  <p>{t("format")}</p>
                  <pre
                    dir="ltr"
                    className="max-h-60 overflow-auto rounded-lg bg-gray-50 p-3 text-start text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                  >
                    {blogDocumentExample}
                  </pre>
                  <p>
                    {t("nodes", {
                      names: Object.keys(editor.schema.nodes).join(", "),
                    })}
                  </p>
                  <p>
                    {t("marks", {
                      names: Object.keys(editor.schema.marks).join(", "),
                    })}
                  </p>
                  <p>{t("attributes")}</p>
                  <p>{t("media")}</p>
                  <p>{t("limits")}</p>
                </div>
              </details>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (disabled) return;
                setImportIssue(null);
                try {
                  if (dialog === "json") {
                    const content = parseBlogDocument(source, editor.schema);
                    editor.commands.setContent(content, {
                      emitUpdate: true,
                      errorOnInvalidContent: true,
                    });
                  } else if (dialog === "video") {
                    const content = parseBlogDocument(
                      JSON.stringify({
                        type: "doc",
                        content: [
                          { type: "youtube", attrs: { src: link.trim() } },
                        ],
                      }),
                      editor.schema,
                    );
                    insertBlogMedia(editor, content.content![0]);
                  } else {
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange("link")
                      .setLink({
                        href: blogLink(link.trim()),
                        target: "_blank",
                        rel: "noopener noreferrer",
                      })
                      .run();
                  }
                  setDialog(null);
                } catch (failure) {
                  const issue =
                    failure instanceof BlogDocumentImportError
                      ? failure
                      : new BlogDocumentImportError("Invalid structure");
                  if (dialog === "json") setImportIssue(issue);
                  setError(
                    dialog === "json"
                      ? t("rejected", {
                          reason: t(
                            `reasons.${issue.reason.toLowerCase().replace(/[^a-z]+/g, "-")}`,
                          ),
                        })
                      : dialog === "video"
                        ? "Enter a supported HTTPS YouTube video URL."
                        : "Enter a valid HTTPS URL, site-relative path or anchor.",
                  );
                }
              }}
            >
              <label className="block text-sm text-gray-800 dark:text-gray-100">
                {dialog === "json"
                  ? "Tiptap JSON object"
                  : dialog === "video"
                    ? "YouTube video URL"
                    : "Link URL"}
                {dialog === "json" ? (
                  <textarea
                    autoFocus
                    value={source}
                    onChange={(event) => {
                      setSource(event.target.value);
                      setError("");
                      setImportIssue(null);
                    }}
                    aria-describedby={`blog-editor-dialog-help blog-json-format-help${error ? " blog-json-import-error" : ""}`}
                    aria-invalid={Boolean(error)}
                    spellCheck={false}
                    className="font-mono mt-2 min-h-72 w-full rounded-lg border border-gray-300 bg-transparent p-3 text-sm dark:border-gray-700"
                    placeholder={
                      '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello"}]}]}'
                    }
                  />
                ) : (
                  <input
                    autoFocus
                    value={link}
                    onChange={(event) => {
                      setLink(event.target.value);
                      setError("");
                    }}
                    aria-describedby="blog-editor-dialog-help"
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-transparent p-3 dark:border-gray-700"
                  />
                )}
              </label>
              {error && (
                <div
                  id="blog-json-import-error"
                  role="alert"
                  className="mt-3 space-y-2 text-sm break-words text-error-600 dark:text-error-400"
                >
                  <p>{error}</p>
                  {dialog === "json" && importIssue && (
                    <>
                      <p dir="ltr">
                        {t("location", { path: importIssue.path })}
                      </p>
                      {importIssue.value && (
                        <p>{t("value", { value: importIssue.value })}</p>
                      )}
                      {importIssue.reason === "Unsupported attributes" && (
                        <p>
                          {t("allowed", {
                            names: importIssue.allowed || t("noAttributes"),
                          })}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={
                    disabled ||
                    !(dialog === "json" ? source.trim() : link.trim())
                  }
                >
                  {dialog === "json"
                    ? "Replace editor content"
                    : dialog === "video"
                      ? "Insert video"
                      : "Apply link"}
                </Button>
                <Button variant="outline" onClick={() => setDialog(null)}>
                  {"Cancel"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}
