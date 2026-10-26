import type { Editor, JSONContent } from "@tiptap/core";
import { Node, mergeAttributes } from "@tiptap/core";

export interface ImageAttributes {
  src: string;
  asset_id?: number;
  alt?: string;
  title?: string;
  caption?: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customImage: {
      setImage: (options: ImageAttributes) => ReturnType;
    };
    customVideo: {
      setVideo: (options: {
        src: string;
        asset_id?: number;
        caption?: string;
      }) => ReturnType;
    };
    customFileAttachment: {
      setFileAttachment: (options: {
        src: string;
        asset_id?: number;
        fileName: string;
        fileSize?: string;
        fileType?: string;
      }) => ReturnType;
    };
  }
}

export const CustomImage = Node.create({
  name: "customImage",
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      asset_id: { default: null },
      alt: { default: "" },
      title: { default: "" },
      caption: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "figure[data-type='custom-image']" }, { tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, title, caption } = HTMLAttributes;
    if (caption) {
      return [
        "figure",
        {
          "data-type": "custom-image",
          class: "my-6 text-center select-none",
        },
        [
          "img",
          mergeAttributes({
            src,
            alt: alt || "Blog image",
            title: title || "",
            class:
              "mx-auto max-h-[500px] w-auto rounded-xl border border-gray-200 object-cover shadow-sm dark:border-gray-800",
          }),
        ],
        [
          "figcaption",
          { class: "mt-2 text-xs italic text-gray-500 dark:text-gray-400" },
          caption,
        ],
      ];
    }

    return [
      "img",
      mergeAttributes(HTMLAttributes, {
        class:
          "my-6 mx-auto block max-h-[500px] w-auto rounded-xl border border-gray-200 object-cover shadow-sm dark:border-gray-800",
      }),
    ];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

function getYouTubeEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      (url.port && url.port !== "443")
    )
      return null;
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
    return id && /^[A-Za-z0-9_-]{11}$/.test(id)
      ? "https://www.youtube.com/embed/" + id
      : null;
  } catch {
    return null;
  }
}

export const CustomVideo = Node.create({
  name: "customVideo",
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      asset_id: { default: null },
      caption: { default: "" },
    };
  },

  parseHTML() {
    return [
      { tag: "div[data-type='custom-video']" },
      { tag: "video[src]" },
      { tag: "iframe[src*='youtube']" },
      { tag: "iframe[src*='vimeo']" },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, caption } = HTMLAttributes;
    const youtubeEmbed =
      typeof src === "string" ? getYouTubeEmbedUrl(src) : null;

    if (youtubeEmbed) {
      return [
        "div",
        {
          "data-type": "custom-video",
          class: "my-6 text-center select-none",
        },
        [
          "div",
          {
            class:
              "aspect-video w-full max-w-3xl mx-auto overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-gray-800",
          },
          [
            "iframe",
            {
              src: youtubeEmbed,
              class: "h-full w-full",
              frameborder: "0",
              referrerpolicy: "strict-origin-when-cross-origin",
              allow:
                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
              allowfullscreen: "true",
            },
          ],
        ],
        caption
          ? [
              "p",
              { class: "mt-2 text-xs italic text-gray-500 dark:text-gray-400" },
              caption,
            ]
          : "",
      ];
    }

    return [
      "div",
      {
        "data-type": "custom-video",
        class: "my-6 text-center select-none",
      },
      [
        "video",
        mergeAttributes({
          src,
          controls: "true",
          class:
            "mx-auto max-h-[460px] w-full max-w-3xl rounded-2xl border border-gray-200 shadow-sm dark:border-gray-800",
        }),
      ],
      caption
        ? [
            "p",
            { class: "mt-2 text-xs italic text-gray-500 dark:text-gray-400" },
            caption,
          ]
        : "",
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export const CustomFileAttachment = Node.create({
  name: "customFileAttachment",
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: "#" },
      asset_id: { default: null },
      fileName: { default: "Attachment" },
      fileSize: { default: "" },
      fileType: { default: "File" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='custom-file-attachment']" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, fileName, fileSize, fileType } = HTMLAttributes;
    return [
      "div",
      {
        "data-type": "custom-file-attachment",
        class:
          "my-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/80 p-3.5 transition dark:border-gray-800 dark:bg-gray-800/40 select-none",
      },
      [
        "div",
        { class: "flex items-center gap-3 overflow-hidden text-start" },
        [
          "div",
          {
            class:
              "flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-bold text-xs uppercase",
          },
          fileType || "FILE",
        ],
        [
          "div",
          { class: "min-w-0" },
          [
            "p",
            {
              class:
                "truncate text-sm font-medium text-gray-800 dark:text-gray-200",
            },
            fileName || "Download Attachment",
          ],
          fileSize
            ? [
                "p",
                { class: "text-xs text-gray-500 dark:text-gray-400" },
                fileSize,
              ]
            : "",
        ],
      ],
      [
        "a",
        {
          href: src || "#",
          download: fileName || "file",
          target: "_blank",
          rel: "noopener noreferrer",
          class:
            "inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600 shadow-theme-xs shrink-0",
        },
        "Download",
      ],
    ];
  },

  addCommands() {
    return {
      setFileAttachment:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export const CustomAudio = Node.create({
  name: "customAudio",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      src: { default: null },
      asset_id: { default: null },
      caption: { default: "" },
    };
  },
  parseHTML() {
    return [{ tag: "audio[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "audio",
      {
        src: HTMLAttributes.src,
        controls: true,
        preload: "metadata",
        class: "my-4 w-full",
      },
    ];
  },
});

// Insert after a selected node/range, preserving existing media rather than replacing it.
export function insertBlogMedia(editor: Editor | null, node: JSONContent) {
  if (!editor) return false;
  return editor
    .chain()
    .focus()
    .insertContentAt(editor.state.selection.to, node)
    .run();
}
