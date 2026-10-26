import { TableKit } from "@tiptap/extension-table";

// Official TableKit supplies the table, row, header and cell schema/behaviour.
export const blogTables = TableKit.configure({
  table: {
    HTMLAttributes: {
      class: "block max-w-full overflow-x-auto border-collapse",
    },
  },
  tableCell: {
    HTMLAttributes: {
      class: "border border-gray-300 p-2 align-top dark:border-gray-700",
    },
  },
  tableHeader: {
    HTMLAttributes: {
      class:
        "border border-gray-300 bg-gray-50 p-2 text-start font-semibold dark:border-gray-700 dark:bg-gray-800",
    },
  },
});

export const tableAttributes: Record<string, string[]> = {
  table: [],
  tableRow: [],
  tableCell: ["colspan", "rowspan", "colwidth", "align"],
  tableHeader: ["colspan", "rowspan", "colwidth", "align"],
};

export function validateTableAttributes(
  kind: string,
  attrs: Record<string, unknown>,
) {
  if (kind !== "tableCell" && kind !== "tableHeader") return;
  for (const key of ["colspan", "rowspan"]) {
    const value = attrs[key] === undefined ? 1 : attrs[key];
    if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 1000)
      throw new Error("Invalid table span");
  }
  const widths = attrs.colwidth;
  if (
    widths != null &&
    (!Array.isArray(widths) ||
      widths.length !== (attrs.colspan ?? 1) ||
      widths.some(
        (width) => !Number.isInteger(width) || width < 0 || width > 100000,
      ))
  )
    throw new Error("Invalid table column widths");
  if (
    attrs.align != null &&
    !["left", "right", "center"].includes(String(attrs.align))
  )
    throw new Error("Invalid cell alignment");
}
