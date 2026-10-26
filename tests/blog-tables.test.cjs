const { test } = require("node:test");
const assert = require("node:assert/strict");
const { getSchema } = require("@tiptap/core");
const StarterKit = require("@tiptap/starter-kit").default;
const { EditorState, TextSelection } = require("@tiptap/pm/state");
const { addRowAfter, addColumnAfter, TableMap } = require("@tiptap/pm/tables");
const {
  blogTables,
} = require("../src/components/blog/extensions/blogTables.ts");
const { parseBlogDocument } = require("../src/lib/gateway/blog-document.ts");
const schema = getSchema([StarterKit, blogTables]);
const cell = (type, text) => ({
  type,
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});
const doc = {
  type: "doc",
  content: [
    {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: [cell("tableHeader", "Name"), cell("tableHeader", "Value")],
        },
        {
          type: "tableRow",
          content: [cell("tableCell", "AI"), cell("tableCell", "Automation")],
        },
      ],
    },
  ],
};

test("official TableKit imports and roundtrips header/cell text without losing content", () => {
  const parsed = parseBlogDocument(JSON.stringify(doc), schema);
  assert.deepEqual(parsed, doc);
  const normalized = schema.nodeFromJSON(parsed).toJSON();
  assert.deepEqual(
    parseBlogDocument(JSON.stringify(normalized), schema),
    JSON.parse(JSON.stringify(normalized)),
  );
});

test("official table commands add rows and columns without replacing existing cells", () => {
  const node = schema.nodeFromJSON(doc);
  let state = EditorState.create({
    schema,
    doc: node,
    selection: TextSelection.create(node, 4),
  });
  const dispatch = (transaction) => {
    state = state.apply(transaction);
  };
  assert.equal(addRowAfter(state, dispatch), true);
  assert.equal(addColumnAfter(state, dispatch), true);
  const map = TableMap.get(state.doc.firstChild);
  assert.equal(map.height, 3);
  assert.equal(map.width, 3);
  assert.match(state.doc.textContent, /Name/);
  assert.match(state.doc.textContent, /Automation/);
  parseBlogDocument(JSON.stringify(state.doc.toJSON()), schema);
});

test("table import rejects unsafe attributes, malformed hierarchy and invalid spans", () => {
  for (const attrs of [
    { colspan: 0 },
    { rowspan: true },
    { colwidth: [-1] },
    { colspan: 2, colwidth: [30] },
    { align: "expression(bad)" },
    { onclick: "bad" },
  ]) {
    const changed = structuredClone(doc);
    changed.content[0].content[0].content[0].attrs = attrs;
    assert.throws(() => parseBlogDocument(JSON.stringify(changed), schema));
  }
  for (const bad of [
    { type: "doc", content: [cell("tableCell", "Orphan")] },
    {
      type: "doc",
      content: [{ type: "table", content: [{ type: "paragraph" }] }],
    },
  ])
    assert.throws(() => parseBlogDocument(JSON.stringify(bad), schema));
});

test("official link title defaults survive a table document roundtrip", () => {
  const linked = structuredClone(doc);
  linked.content[0].content[0].content[0].content[0].content[0].marks = [
    { type: "link", attrs: { href: "https://example.test", title: null } },
  ];
  const normalized = schema
    .nodeFromJSON(parseBlogDocument(JSON.stringify(linked), schema))
    .toJSON();
  assert.doesNotThrow(() =>
    parseBlogDocument(JSON.stringify(normalized), schema),
  );
});
