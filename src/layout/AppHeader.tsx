"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { Link } from "@/i18n/navigation";
import { MenuIcon, CloseIcon } from "@/icons";
import { useTranslations } from "next-intl";
export default function AppHeader({
  user,
}: {
  user: { name: string; email: string; role: string };
}) {
  const { isExpanded, isMobileOpen, toggleSidebar, toggleMobileSidebar } =
    useSidebar();
  const t = useTranslations("gateway");
  return (
    <header className="sticky top-0 z-40 flex w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex w-full items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label={t("toggleSidebar")}
            aria-expanded={isExpanded || isMobileOpen}
            onClick={() => {
              if (window.innerWidth >= 1280) toggleSidebar();
              else toggleMobileSidebar();
            }}
            className="flex size-11 items-center justify-center rounded-lg border border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400"
          >
            {isMobileOpen ? (
              <CloseIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
          <Link href="/" className="font-semibold text-brand-500 xl:hidden">
            {t("brand")}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggleButton />
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}
