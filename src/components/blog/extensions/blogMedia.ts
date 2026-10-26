import type { Editor, JSONContent } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Audio from "@tiptap/extension-audio";
import Youtube from "@tiptap/extension-youtube";

// Official extensions only. No Node.create(), renamed nodes or custom attributes.
export const blogImage = Image.configure({ allowBase64: false });
export const blogAudio = Audio.configure({
  allowBase64: false,
  autoplay: false,
  controls: true,
});
export const blogYoutube = Youtube.configure({
  autoplay: false,
  controls: true,
});

export function insertBlogMedia(editor: Editor | null, node: JSONContent | JSONContent[]) {
  return (
    editor
      ?.chain()
      .focus()
      .insertContentAt(editor.state.selection.to, node)
      .run() ?? false
  );
}

export function assetDocumentNode(asset: {
  public_url: string;
  media_type: string;
  original_filename: string;
  alt_text?: string;
}): JSONContent {
  if (asset.media_type.startsWith("image/"))
    return {
      type: "image",
      attrs: {
        src: asset.public_url,
        alt: asset.alt_text ?? asset.original_filename,
      },
    };
  if (asset.media_type.startsWith("audio/"))
    return { type: "audio", attrs: { src: asset.public_url } };
  // No documented core video/file node: use the standard Link mark.
  return {
    type: "paragraph",
    content: [
      {
        type: "text",
        text: asset.original_filename,
        marks: [
          {
            type: "link",
            attrs: {
              href: asset.public_url,
              target: "_blank",
              rel: "noopener noreferrer",
            },
          },
        ],
      },
    ],
  };
}

// Read compatibility only: normalize saved legacy media in memory. The editor
// does not register legacy nodes and no database record is rewritten on load.
export function standardBlogDocument(document: JSONContent): JSONContent {
  let count = 0;
  function convert(node: JSONContent, depth: number): JSONContent[] {
    if (++count > 8000 || depth > 24)
      throw new Error("Document structure exceeds supported limits.");
    const attrs = node.attrs || {};
    const caption =
      typeof attrs.caption === "string" && attrs.caption
        ? [
            {
              type: "paragraph",
              content: [{ type: "text", text: attrs.caption }],
            },
          ]
        : [];
    if (node.type === "customImage")
      return [
        {
          type: "image",
          attrs: {
            src: attrs.src,
            alt: attrs.alt || "",
            title: attrs.title || null,
          },
        },
        ...caption,
      ];
    if (node.type === "customAudio")
      return [{ type: "audio", attrs: { src: attrs.src } }, ...caption];
    if (node.type === "customVideo" && attrs.asset_id == null)
      return [{ type: "youtube", attrs: { src: attrs.src } }, ...caption];
    if (node.type === "customVideo" || node.type === "customFileAttachment")
      return [
        assetDocumentNode({
          public_url: attrs.src,
          media_type: "application/octet-stream",
          original_filename:
            attrs.fileName ||
            attrs.caption ||
            (node.type === "customVideo" ? "Video" : "Attachment"),
        }),
        ...caption,
      ];
    return [
      {
        ...node,
        ...(node.content
          ? {
              content: node.content.flatMap((child) =>
                convert(child, depth + 1),
              ),
            }
          : {}),
      },
    ];
  }
  return convert(document, 0)[0];
}
