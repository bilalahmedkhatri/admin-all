"use client";
import { useState } from "react";
import {
  overviewSections,
  canViewOverviewSection,
} from "@/lib/gateway/overview-navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { pages, hasPage } from "@/lib/gateway/permissions";
import {
  GridIcon,
  ChevronDownIcon,
  PlugInIcon,
  LockIcon,
  BoxCubeIcon,
  PieChartIcon,
  GroupIcon,
  UserCircleIcon,
  ListIcon,
  PencilIcon,
} from "@/icons";
import { useTranslations } from "next-intl";
const icons = {
  overview: GridIcon,
  endpoints: PlugInIcon,
  "api-keys": LockIcon,
  models: BoxCubeIcon,
  apps: BoxCubeIcon,
  activity: ListIcon,
  requests: PieChartIcon,
  users: GroupIcon,
  settings: LockIcon,
  "blog-editor": PencilIcon,
};
export default function AppSidebar({
  user,
}: {
  user: { role: string; page_permissions: string };
}) {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    toggleMobileSidebar,
  } = useSidebar();
  const pathname = usePathname();
  const [overviewOpen, setOverviewOpen] = useState(true);
  const t = useTranslations("sidebar");
  const copy = useTranslations("gateway");
  const expanded = isExpanded || isMobileOpen || isHovered;
  const entries = [
    ...pages
      .filter((p) => hasPage(user, p.id))
      .map((p) => ({ ...p, Icon: icons[p.id] })),
    {
      id: "profile",
      path: "/profile",
      title: "User profile",
      Icon: UserCircleIcon,
    },
  ];
  return (
    <aside
      className={
        "fixed start-0 top-0 z-50 flex h-full flex-col border-e border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 " +
        (expanded ? "w-72.5" : "w-22.5") +
        " " +
        (isMobileOpen
          ? "translate-x-0"
          : "-translate-x-full rtl:translate-x-full") +
        " xl:translate-x-0 xl:rtl:translate-x-0"
      }
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={
          "flex py-8 " + (expanded ? "justify-start" : "justify-center")
        }
      >
        <Link
          href="/"
          aria-label={copy("brand")}
          className="text-xl font-semibold text-brand-500"
        >
          {expanded ? copy("brand") : "AG"}
        </Link>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto">
        <nav aria-label={copy("navigation")} className="mb-6">
          <h2
            className={
              "mb-4 text-xs text-gray-400 uppercase " +
              (expanded ? "" : "text-center")
            }
          >
            {expanded ? copy("workspace") : "···"}
          </h2>
          <ul className="flex flex-col gap-1">
            {entries.map(({ id, path, Icon }) => {
              if (id === "overview") {
                const active =
                  pathname === "/" || pathname.startsWith("/overview/");
                return (
                  <li key={id}>
                    <button
                      type="button"
                      aria-label={t("items.overview")}
                      aria-expanded={expanded && overviewOpen}
                      aria-controls="overview-submenu"
                      onClick={() => setOverviewOpen((open) => !open)}
                      className={
                        "group menu-item w-full " +
                        (active ? "menu-item-active" : "menu-item-inactive")
                      }
                    >
                      <Icon className="size-6 shrink-0" />
                      {expanded && (
                        <>
                          <span className="menu-item-text">
                            {t("items.overview")}
                          </span>
                          <ChevronDownIcon
                            className={
                              "ms-auto size-4 shrink-0 transition-transform " +
                              (overviewOpen ? "rotate-180" : "")
                            }
                          />
                        </>
                      )}
                    </button>
                    {expanded && overviewOpen && (
                      <ul
                        id="overview-submenu"
                        className="ms-5 mt-2 space-y-1 border-s border-gray-200 ps-4 dark:border-gray-800"
                      >
                        {overviewSections
                          .filter((item) =>
                            canViewOverviewSection(user, item.id),
                          )
                          .map((item) => (
                            <li key={item.id}>
                              <Link
                                href={item.path}
                                aria-current={
                                  pathname === item.path ? "page" : undefined
                                }
                                onClick={() => {
                                  if (isMobileOpen) toggleMobileSidebar();
                                }}
                                className={
                                  "menu-item text-sm " +
                                  (pathname === item.path
                                    ? "menu-item-active"
                                    : "menu-item-inactive")
                                }
                              >
                                {t("overviewChildren." + item.label)}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    )}
                  </li>
                );
              }
              const active =
                path === "/"
                  ? pathname === "/"
                  : pathname === path || pathname.startsWith(path + "/");
              return (
                <li key={id}>
                  <Link
                    href={path}
                    aria-current={active ? "page" : undefined}
                    aria-label={t("items." + id)}
                    title={!expanded ? t("items." + id) : undefined}
                    onClick={() => {
                      if (isMobileOpen) toggleMobileSidebar();
                    }}
                    className={
                      "group menu-item " +
                      (active ? "menu-item-active" : "menu-item-inactive") +
                      (!expanded ? " lg:justify-center" : "")
                    }
                  >
                    <span
                      className={
                        active
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }
                    >
                      <Icon className="size-6" />
                    </span>
                    {expanded && (
                      <span className="menu-item-text">{t("items." + id)}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
