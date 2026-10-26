import {
  tableAttributes,
  validateTableAttributes,
} from "@/components/blog/extensions/blogTables";
import type { JSONContent } from "@tiptap/core";
import type { Schema } from "@tiptap/pm/model";

export function blogLink(value: string): string {
  if (!value || value.length > 2048 || /[\s\\\u0000-\u001f\u007f]/u.test(value))
    throw new Error("Invalid URL");
  if (
    (value.startsWith("/") && !value.startsWith("//")) ||
    value.startsWith("#")
  )
    return value;
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    !url.hostname ||
    url.username ||
    url.password
  )
    throw new Error("Invalid URL");
  return value;
}

// Typed diagnostics keep validation details local to the import dialog.
export class BlogDocumentImportError extends Error {
  constructor(
    public reason: string,
    public path = "$",
    public value = "",
    public allowed = "",
  ) {
    super(`${path}: ${reason}${value ? ` (${value})` : ""}`);
    this.name = "BlogDocumentImportError";
  }
}

export const blogDocumentExample = JSON.stringify(
  {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Article heading" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Article text", marks: [{ type: "bold" }] },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "List item" }],
              },
            ],
          },
        ],
      },
    ],
  },
  null,
  2,
);

// Reject unsupported content before Tiptap can silently drop nodes or attributes.
// The backend remains authoritative for validation and selected-app asset ownership.
export function parseBlogDocument(source: string, schema: Schema): JSONContent {
  if (new TextEncoder().encode(source).length > 1024 * 1024)
    throw new BlogDocumentImportError("Document too large");
  let document: unknown;
  try {
    document = JSON.parse(source);
  } catch {
    throw new BlogDocumentImportError("Invalid JSON syntax");
  }
  const object = (value: unknown): value is Record<string, unknown> =>
    Boolean(value) && typeof value === "object" && !Array.isArray(value);
  if (
    !object(document) ||
    document.type !== "doc" ||
    !Array.isArray(document.content)
  )
    throw new BlogDocumentImportError("Expected a Tiptap document object");
  const media = new Set(["image", "audio", "youtube"]);
  const attributes: Record<string, string[]> = {
    ...tableAttributes,
    heading: ["level"],
    orderedList: ["start", "type"],
    codeBlock: ["language"],
    image: ["src", "alt", "title", "width", "height"],
    audio: [
      "src",
      "controls",
      "autoplay",
      "loop",
      "muted",
      "preload",
      "controlslist",
      "crossorigin",
      "disableremoteplayback",
    ],
    youtube: ["src", "width", "height", "start"],
  };
  const stack = [{ value: document, depth: 0, path: "$" }];
  let nodes = 0,
    textSize = 0;
  while (stack.length) {
    const { value, depth, path } = stack.pop()!;
    try {
      if (++nodes > 8000 || depth > 24)
        throw new Error("Document structure limit");
      if (
        !object(value) ||
        typeof value.type !== "string" ||
        !schema.nodes[value.type] ||
        (depth > 0 && value.type === "doc")
      )
        throw new Error("Unsupported document node");
      const extraFields = Object.keys(value).filter(
        (key) => !["type", "attrs", "content", "text", "marks"].includes(key),
      );
      if (extraFields.length)
        throw new BlogDocumentImportError(
          "Unsupported document field",
          path,
          extraFields.join(", "),
        );

      const kind = value.type;
      const attrs = value.attrs === undefined ? {} : value.attrs;
      if (
        !object(attrs) ||
        Object.keys(attrs).some(
          (key) => !(attributes[kind] || []).includes(key),
        )
      )
        throw new BlogDocumentImportError(
          "Unsupported attributes",
          `${path}.attrs`,
          object(attrs)
            ? Object.keys(attrs)
                .filter((key) => !(attributes[kind] || []).includes(key))
                .join(", ")
            : "attrs",
          (attributes[kind] || []).join(", "),
        );
      validateTableAttributes(kind, attrs);
      if (value.type === "text") {
        if (
          typeof value.text !== "string" ||
          value.text.length === 0 ||
          /[\u0000-\u0008\u000b-\u001f\u007f\p{Cs}]/u.test(value.text)
        )
          throw new Error("Invalid text");
        textSize += value.text.length;
        if (textSize > 200000) throw new Error("Too much text");
      } else if ("text" in value) throw new Error("Invalid text node");
      if (
        value.type === "heading" &&
        (!Number.isInteger(attrs.level) ||
          Number(attrs.level) < 1 ||
          Number(attrs.level) > 6)
      )
        throw new Error("Invalid heading");
      if (
        value.type === "orderedList" &&
        attrs.start !== undefined &&
        (!Number.isInteger(attrs.start) ||
          Number(attrs.start) < 1 ||
          Number(attrs.start) > 100000)
      )
        throw new Error("Invalid list start");
      if (
        value.type === "orderedList" &&
        attrs.type != null &&
        !["1", "a", "A", "i", "I"].includes(String(attrs.type))
      )
        throw new Error("Invalid list type");
      if (
        value.type === "codeBlock" &&
        attrs.language != null &&
        (typeof attrs.language !== "string" ||
          attrs.language.length > 40 ||
          /[\p{Cc}\p{Cs}]/u.test(attrs.language))
      )
        throw new Error("Invalid code language");
      if (media.has(kind)) {
        if (
          typeof attrs.src !== "string" ||
          !blogLink(attrs.src).startsWith("https://")
        )
          throw new Error("Invalid media URL");
        for (const dimension of [attrs.width, attrs.height])
          if (
            dimension != null &&
            (!Number.isInteger(dimension) ||
              Number(dimension) < 1 ||
              Number(dimension) > 100000)
          )
            throw new Error("Invalid media dimension");
        for (const text of [attrs.alt, attrs.title])
          if (text != null && (typeof text !== "string" || text.length > 1000))
            throw new Error("Invalid image text");
        if (kind === "audio") {
          for (const key of [
            "controls",
            "autoplay",
            "loop",
            "muted",
            "disableremoteplayback",
          ])
            if (attrs[key] != null && typeof attrs[key] !== "boolean")
              throw new Error("Invalid audio option");
          if (
            attrs.preload != null &&
            !["none", "metadata", "auto"].includes(String(attrs.preload))
          )
            throw new Error("Invalid audio preload");
          if (
            attrs.crossorigin != null &&
            !["", "anonymous", "use-credentials"].includes(
              String(attrs.crossorigin),
            )
          )
            throw new Error("Invalid audio CORS option");
          if (
            attrs.controlslist != null &&
            (typeof attrs.controlslist !== "string" ||
              attrs.controlslist.length > 100)
          )
            throw new Error("Invalid audio controls");
        }
        if (kind === "youtube") {
          const url = new URL(attrs.src);
          if (url.port && url.port !== "443")
            throw new Error("Invalid YouTube URL");
          const id =
            url.hostname === "youtu.be"
              ? url.pathname.slice(1)
              : ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(
                    url.hostname,
                  )
                ? url.pathname === "/watch"
                  ? url.searchParams.get("v")
                  : url.pathname.startsWith("/embed/")
                    ? url.pathname.slice(7)
                    : null
                : null;
          if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id))
            throw new Error("Invalid YouTube URL");
          if (
            attrs.start != null &&
            (!Number.isInteger(attrs.start) ||
              Number(attrs.start) < 0 ||
              Number(attrs.start) > 86400)
          )
            throw new Error("Invalid YouTube start");
          attrs.src = "https://www.youtube.com/embed/" + id;
        }
      }
      const marks = value.marks === undefined ? [] : value.marks;
      if (
        !Array.isArray(marks) ||
        marks.length > 8 ||
        (marks.length > 0 && value.type !== "text")
      )
        throw new Error("Invalid marks");
      for (const [markIndex, mark] of marks.entries()) {
        try {
          if (
            !object(mark) ||
            typeof mark.type !== "string" ||
            !schema.marks[mark.type] ||
            Object.keys(mark).some((key) => !["type", "attrs"].includes(key))
          )
            throw new Error("Unsupported mark");
          const ma = mark.attrs ?? {};
          if (!object(ma)) throw new Error("Invalid mark attributes");
          if (mark.type === "link") {
            if (
              Object.keys(ma).some(
                (key) =>
                  !["href", "target", "rel", "class", "title"].includes(key),
              ) ||
              typeof ma.href !== "string"
            )
              throw new Error("Invalid link");
            if (
              ma.title != null &&
              (typeof ma.title !== "string" ||
                ma.title.length > 1000 ||
                /[\p{Cc}\p{Cs}]/u.test(ma.title))
            )
              throw new Error("Invalid link title");
            mark.attrs = {
              href: blogLink(ma.href),
              target: "_blank",
              rel: "noopener noreferrer",
              ...(ma.title == null ? {} : { title: ma.title }),
            };
          } else if (Object.keys(ma).length)
            throw new Error("Unsupported mark attributes");
        } catch (error) {
          throw new BlogDocumentImportError(
            error instanceof Error ? error.message : "Invalid marks",
            `${path}.marks[${markIndex}]`,
            object(mark) && typeof mark.type === "string"
              ? mark.type.slice(0, 120)
              : "",
          );
        }
      }
      if (
        value.content !== undefined &&
        (!Array.isArray(value.content) ||
          (schema.nodes[kind].isLeaf && value.content.length > 0))
      )
        throw new Error("Invalid children");
      const children = (value.content ?? []) as unknown[];
      for (let index = children.length - 1; index >= 0; index--) {
        const child = children[index];
        if (!object(child))
          throw new BlogDocumentImportError(
            "Invalid child",
            `${path}.content[${index}]`,
          );
        stack.push({
          value: child,
          depth: depth + 1,
          path: `${path}.content[${index}]`,
        });
      }
    } catch (error) {
      if (error instanceof BlogDocumentImportError) throw error;
      throw new BlogDocumentImportError(
        error instanceof Error ? error.message : "Invalid structure",
        path,
        object(value) && typeof value.type === "string"
          ? value.type.slice(0, 120)
          : "",
      );
    }
  }
  try {
    const parsed = schema.nodeFromJSON(document);
    const checkStructure = (node: typeof parsed, path: string) => {
      if (!node.type.validContent(node.content))
        throw new BlogDocumentImportError(
          "Invalid structure",
          path,
          node.type.name,
        );
      node.forEach((child, _offset, index) =>
        checkStructure(child, `${path}.content[${index}]`),
      );
    };
    checkStructure(parsed, "$");
    parsed.check();
  } catch (error) {
    if (error instanceof BlogDocumentImportError) throw error;
    throw new BlogDocumentImportError("Invalid structure");
  }
  return document as JSONContent;
}
