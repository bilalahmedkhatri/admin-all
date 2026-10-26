"use client";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { UserCircleIcon, ChevronDownIcon } from "@/icons";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
export default function UserDropdown({
  user,
}: {
  user: { name: string; email: string; role: string };
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("gateway");
  return (
    <div className="relative">
      <button
        className="dropdown-toggle flex items-center gap-3 text-gray-700 dark:text-gray-300"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={t("account")}
      >
        <UserCircleIcon className="size-9 shrink-0" />
        <span className="max-w-40 truncate text-sm font-medium">
          {user.name}
        </span>
        <ChevronDownIcon className="size-4" />
      </button>
      <Dropdown
        isOpen={open}
        onClose={() => setOpen(false)}
        className="absolute end-0 mt-4 w-64 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
      >
        <p className="text-sm font-medium break-all text-gray-800 dark:text-gray-100">
          {user.name}
        </p>
        <p className="mb-4 text-xs break-all text-gray-500 dark:text-gray-400">
          {user.email}
        </p>
        <Link
          href="/profile"
          onClick={() => setOpen(false)}
          className="menu-item menu-item-inactive"
        >
          {t("profile")}
        </Link>
        <form action="/logout" method="post">
          <button className="menu-item w-full menu-item-inactive" type="submit">
            {t("signOut")}
          </button>
        </form>
      </Dropdown>
    </div>
  );
}
