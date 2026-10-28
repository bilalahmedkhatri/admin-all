import type { ReactNode } from "react";

export default function PromptsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative mx-auto w-full max-w-screen-2xl min-w-0 space-y-6 text-gray-800 dark:text-gray-100">
      {children}
    </div>
  );
}
