"use client";
export function Loading({ label, kind }: { label: string; kind?: string }) {
  const page = kind === "page";
  return (
    <span
      role="status"
      aria-live="polite"
      className={
        page
          ? "inline-flex flex-col items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
          : "inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
      }
    >
      <span
        aria-hidden="true"
        className={
          (page ? "size-10 border-4" : "size-4 border-2") +
          " shrink-0 animate-spin rounded-full border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400"
        }
      />
      {label}
    </span>
  );
}
