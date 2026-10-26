"use client";
import { Link } from "@/i18n/navigation";
export function AuthPage({
  title,
  description,
  children,
  register,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  register?: boolean;
}) {
  return (
    <section className="mx-auto w-full max-w-md px-5 py-10">
      <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h1>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      <div className="space-y-5">{children}</div>
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <Link
          href={register ? "/login" : "/register"}
          className="text-brand-500"
        >
          {register ? "Sign in" : "Request workspace access"}
        </Link>
      </div>
    </section>
  );
}
