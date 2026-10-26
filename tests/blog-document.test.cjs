const { test } = require("node:test");
const assert = require("node:assert/strict");
const { getSchema } = require("@tiptap/core");
const StarterKit = require("@tiptap/starter-kit").default;
const {
  blogImage,
  blogAudio,
  blogYoutube,
  standardBlogDocument,
} = require("../src/components/blog/extensions/blogMedia.ts");
const {
  parseBlogDocument,
  blogLink,
} = require("../src/lib/gateway/blog-document.ts");
const schema = getSchema([StarterKit, blogImage, blogAudio, blogYoutube]);
const parse = (value) => parseBlogDocument(JSON.stringify(value), schema);
const paragraph = (text) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});
test("JSON import preserves all installed rich formatting and registered media", () => {
  const doc = {
    type: "doc",
    content: [
      ...Array.from({ length: 6 }, (_, i) => ({
        type: "heading",
        attrs: { level: i + 1 },
        content: [{ type: "text", text: "Heading" }],
      })),
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Format",
            marks: [
              { type: "bold" },
              { type: "italic" },
              { type: "underline" },
              { type: "strike" },
            ],
          },
        ],
      },
      {
        type: "orderedList",
        attrs: { start: 2 },
        content: [{ type: "listItem", content: [paragraph("Item")] }],
      },
      { type: "blockquote", content: [paragraph("Quote")] },
      {
        type: "codeBlock",
        attrs: { language: "js" },
        content: [{ type: "text", text: "const n=1;" }],
      },
      { type: "horizontalRule" },
      {
        type: "image",
        attrs: { src: "https://media.test/a.png", alt: "Alt" },
      },
      {
        type: "audio",
        attrs: { src: "https://media.test/a.wav" },
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "clip.mp4",
            marks: [
              {
                type: "link",
                attrs: {
                  href: "https://media.test/a.mp4",
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
              },
            ],
          },
        ],
      },
    ],
  };
  const parsed = parse(doc);
  assert.deepEqual(parsed, doc);
  schema.nodeFromJSON(parsed).check();
  assert.equal(
    schema.nodeFromJSON(parsed).lastChild.firstChild.marks[0].attrs.href,
    "https://media.test/a.mp4",
  );
});
test("invalid and unsupported imports fail before content replacement", () => {
  const invalid = [
    [],
    {
      post: { content_json: { type: "doc", content: [paragraph("wrapped")] } },
    },
    { type: "doc", content: [{ type: "table" }] },
    {
      type: "doc",
      content: [{ type: "paragraph", attrs: { textAlign: "center" } }],
    },
    { type: "doc", content: [{ type: "text", text: "not a block" }] },
    {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "x", content: [paragraph("ignored")] },
          ],
        },
      ],
    },
    {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "x",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
          ],
        },
      ],
    },
    {
      type: "doc",
      content: [
        { type: "customImage", attrs: { src: "data:image/png;base64,AA" } },
      ],
    },
    {
      type: "doc",
      content: [{ type: "customImage", attrs: { asset_id: -2 } }],
    },
    {
      type: "doc",
      content: [
        {
          type: "customVideo",
          attrs: { src: "https://attacker.test/embed/abcdefghijk" },
        },
      ],
    },
  ];
  for (const doc of invalid) assert.throws(() => parse(doc));
  assert.throws(() => parseBlogDocument("{bad", schema));
});
test("import bounds encoded bytes, depth, node count and text", () => {
  assert.throws(() => parseBlogDocument(" ".repeat(1024 * 1024 + 1), schema));
  assert.throws(() =>
    parse({ type: "doc", content: [paragraph("x".repeat(200001))] }),
  );
  assert.throws(() =>
    parse({
      type: "doc",
      content: Array.from({ length: 8001 }, () => paragraph("x")),
    }),
  );
  let child = paragraph("deep");
  for (let i = 0; i < 25; i++) child = { type: "blockquote", content: [child] };
  assert.throws(() => parse({ type: "doc", content: [child] }));
});
test("import normalizes safe links and YouTube without fetching remote content", () => {
  const doc = parse({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Link",
            marks: [
              {
                type: "link",
                attrs: {
                  href: "https://example.test",
                  target: "_self",
                  class: "unused",
                },
              },
            ],
          },
        ],
      },
      { type: "youtube", attrs: { src: "https://youtu.be/abcdefghijk" } },
    ],
  });
  assert.deepEqual(doc.content[0].content[0].marks[0].attrs, {
    href: "https://example.test",
    target: "_blank",
    rel: "noopener noreferrer",
  });
  assert.equal(
    doc.content[1].attrs.src,
    "https://www.youtube.com/embed/abcdefghijk",
  );
  assert.equal(blogLink("/en/blog"), "/en/blog");
  assert.equal(blogLink("#part"), "#part");
  for (const url of [
    "http://example.test",
    "//example.test",
    "javascript:bad",
    "https://u:p@example.test",
    "https://example.test/ bad",
  ])
    assert.throws(() => blogLink(url));
});

test("active editor has only official media nodes and normalizes legacy records without mutation", () => {
  for (const name of ["image", "audio", "youtube"])
    assert.ok(schema.nodes[name]);
  for (const name of [
    "customImage",
    "customVideo",
    "customAudio",
    "customFileAttachment",
  ])
    assert.equal(schema.nodes[name], undefined);
  const saved = {
    type: "doc",
    content: [
      {
        type: "customImage",
        attrs: {
          asset_id: 3,
          src: "https://media.test/a.png",
          alt: "Alt",
          caption: "Caption",
        },
      },
      {
        type: "customAudio",
        attrs: { asset_id: 4, src: "https://media.test/a.wav" },
      },
      {
        type: "customVideo",
        attrs: { asset_id: 5, src: "https://media.test/a.mp4" },
      },
    ],
  };
  const original = JSON.stringify(saved);
  const normalized = standardBlogDocument(saved);
  assert.equal(JSON.stringify(saved), original);
  assert.deepEqual(
    normalized.content.map((node) => node.type),
    ["image", "paragraph", "audio", "paragraph"],
  );
  assert.equal(normalized.content[0].attrs.asset_id, undefined);
  assert.equal(
    normalized.content[3].content[0].marks[0].attrs.href,
    "https://media.test/a.mp4",
  );
  parse(normalized);
});

test("official image nodes retain descriptive and deliberately empty alt text", () => {
  const {
    assetDocumentNode,
  } = require("../src/components/blog/extensions/blogMedia.ts");
  const asset = {
    public_url: "https://media.test/chart.webp",
    media_type: "image/webp",
    original_filename: "chart.webp",
  };
  const schema = getSchema([StarterKit, blogImage]);
  for (const alt of ["Automation workflow diagram", ""]) {
    const node = assetDocumentNode({ ...asset, alt_text: alt });
    assert.equal(schema.nodeFromJSON(node).toJSON().attrs.alt, alt);
  }
  assert.equal(assetDocumentNode(asset).attrs.alt, "chart.webp");
});

test("JSON import reports unsupported placeholders at their exact nested path", () => {
  const {
    BlogDocumentImportError,
  } = require("../src/lib/gateway/blog-document.ts");
  const doc = {
    type: "doc",
    content: [
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "marks-placeholder-removed", text: "" }],
              },
            ],
          },
        ],
      },
    ],
  };
  const original = JSON.stringify(doc);
  assert.throws(
    () => parse(doc),
    (error) => {
      assert.ok(error instanceof BlogDocumentImportError);
      assert.equal(error.reason, "Unsupported document node");
      assert.equal(error.path, "$.content[0].content[0].content[0].content[0]");
      assert.equal(error.value, "marks-placeholder-removed");
      return true;
    },
  );
  assert.equal(JSON.stringify(doc), original);
});

test("import diagnostics explain syntax, attributes, marks and nesting", () => {
  const {
    BlogDocumentImportError,
    blogDocumentExample,
  } = require("../src/lib/gateway/blog-document.ts");
  assert.doesNotThrow(() => parseBlogDocument(blogDocumentExample, schema));
  const cases = [
    ["{bad", "Invalid JSON syntax", "$"],
    [
      JSON.stringify({
        type: "doc",
        content: [{ type: "heading", attrs: { level: 2, color: "red" } }],
      }),
      "Unsupported attributes",
      "$.content[0].attrs",
      "color",
      "level",
    ],
    [
      JSON.stringify({
        type: "doc",
        content: [{ type: "heading", attrs: { level: 8 } }],
      }),
      "Invalid heading",
      "$.content[0]",
    ],
    [
      JSON.stringify({
        type: "doc",
        content: [paragraph("valid"), { type: "text", text: "not a block" }],
      }),
      "Invalid structure",
      "$",
    ],
    [
      JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "x", marks: [{ type: "madeUp" }] }],
          },
        ],
      }),
      "Unsupported mark",
      "$.content[0].content[0].marks[0]",
      "madeUp",
    ],
    [
      JSON.stringify({
        type: "doc",
        content: [
          {
            type: "blockquote",
            content: [{ type: "paragraph", content: [{ type: "paragraph" }] }],
          },
        ],
      }),
      "Invalid structure",
      "$.content[0].content[0]",
    ],
  ];
  const messages = require("../src/messages/en.json").blogJsonImport;
  for (const [source, reason, path, value, allowed] of cases) {
    assert.throws(
      () => parseBlogDocument(source, schema),
      (error) => {
        assert.ok(error instanceof BlogDocumentImportError);
        assert.equal(error.reason, reason);
        assert.equal(error.path, path);
        if (value) assert.equal(error.value, value);
        if (allowed) assert.equal(error.allowed, allowed);
        assert.ok(
          messages.reasons[error.reason.toLowerCase().replace(/[^a-z]+/g, "-")],
        );
        return true;
      },
    );
  }
});
