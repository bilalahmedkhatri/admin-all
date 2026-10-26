import type { HTMLAttributes, TdHTMLAttributes } from "react";
import * as Tail from "@/components/ui/table";
export function Table({
  children,
  className,
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="custom-scrollbar max-w-full overflow-x-auto">
      <Tail.Table className={className}>{children}</Tail.Table>
    </div>
  );
}
export const TableHeader = Tail.TableHeader,
  TableBody = Tail.TableBody,
  TableRow = Tail.TableRow;
export function TableHead({
  children,
  className,
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <Tail.TableCell
      isHeader
      className={
        "border-b border-gray-100 py-3 text-start text-theme-xs font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400 " +
        (className || "")
      }
    >
      {children}
    </Tail.TableCell>
  );
}
export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      {...props}
      className={
        "border-b border-gray-100 text-theme-sm text-gray-700 dark:border-gray-800 dark:text-gray-300 " +
        (className || "")
      }
    />
  );
}
