"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import type { AdminUser } from "@/lib/gateway/types";
import { pages } from "@/lib/gateway/permissions";
import {
  initialSelection,
  relatedComponents,
  sectionOperations,
  togglePermission,
  type PermissionCatalog,
  type PermissionKind,
} from "@/lib/gateway/permission-options";

export default function PermissionEditor({
  catalog,
  user,
}: {
  catalog: PermissionCatalog;
  user?: AdminUser;
}) {
  const t = useTranslations("gateway.permissionEditor");
  const copy = useTranslations("gateway.copy");
  const id = useId();
  const [selection, setSelection] = useState(() => initialSelection(user));
  const [role, setRole] = useState(user?.role || "viewer");
  const [activePage, setActivePage] = useState(selection.page[0] || "");
  const [activeSection, setActiveSection] = useState(
    selection.section[0] || "",
  );
  const visiblePages = catalog.pages.filter(
    (key) => !pages.find((p) => p.id === key && "admin" in p && p.admin),
  );
  const sections = catalog.sections.filter(
    (key) => sectionOperations(catalog, key, role).length > 0,
  );
  const selectedPages = selection.page.filter((key) =>
    visiblePages.includes(key),
  );
  const selectedSections = selection.section.filter((key) =>
    sections.includes(key),
  );
  const page = selectedPages.includes(activePage)
    ? activePage
    : selectedPages[0] || "";
  const section = selectedSections.includes(activeSection)
    ? activeSection
    : selectedSections[0] || "";
  const pageLabel = (key: string) =>
    t.has(`pages.${key}`)
      ? t(`pages.${key}`)
      : pages.find((p) => p.id === key)?.title || key;
  const componentLabel = (key: string) =>
    t.has(`actions.${key.replaceAll(".", "_")}`)
      ? t(`actions.${key.replaceAll(".", "_")}`)
      : key;

  function toggle(kind: PermissionKind, value: string, checked: boolean) {
    setSelection((current) => togglePermission(current, kind, value, checked));
    if (checked && kind === "page") setActivePage(value);
    if (checked && kind === "section") setActiveSection(value);
  }

  function options(
    kind: PermissionKind,
    items: string[],
    label: (value: string) => string,
    focus?: (value: string) => void,
    active?: string,
  ) {
    return (
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((value) => (
          <div
            key={value}
            className={`flex min-w-0 items-start gap-2 rounded-lg p-3 text-sm ${active === value ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300" : "bg-gray-50 dark:bg-white/5"}`}
          >
            <input
              id={`${id}-${kind}-${value}`}
              type="checkbox"
              aria-label={label(value)}
              checked={selection[kind].includes(value)}
              onChange={(event) => toggle(kind, value, event.target.checked)}
              className="mt-0.5 size-4 shrink-0 cursor-pointer accent-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            />
            {focus ? (
              <button
                type="button"
                aria-pressed={active === value}
                className="min-w-0 flex-1 cursor-pointer text-start break-words focus-visible:outline-2 focus-visible:outline-brand-500"
                onClick={() => {
                  if (!selection[kind].includes(value))
                    toggle(kind, value, true);
                  focus(value);
                }}
              >
                {label(value)}
              </button>
            ) : (
              <label
                htmlFor={`${id}-${kind}-${value}`}
                className="min-w-0 flex-1 cursor-pointer break-all"
              >
                {label(value)}
              </label>
            )}
          </div>
        ))}
      </div>
    );
  }

  const components = relatedComponents(catalog, page, section, role);
  const blogApps = catalog.components.filter((key) =>
    key.startsWith("blog.app."),
  );
  return (
    <div className="space-y-5">
      {/* Hidden inputs serialize every selection, including inactive panels. */}
      {Object.entries(selection).flatMap(([kind, values]) =>
        values.map((value) => (
          <input
            key={`${kind}:${value}`}
            type="hidden"
            name={kind}
            value={value}
          />
        )),
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="block font-medium">{copy("m203")}</span>
          <select
            name="role"
            value={role}
            onChange={(event) =>
              setRole(event.target.value as AdminUser["role"])
            }
            className="h-11 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="viewer">{copy("m204")}</option>
            <option value="operator">{copy("m205")}</option>
            <option value="admin">{copy("m206")}</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="block font-medium">{copy("m032")}</span>
          <select
            name="status"
            defaultValue={user?.status || "approved"}
            className="h-11 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="approved">{copy("m208")}</option>
            <option value="pending">{copy("m207")}</option>
            <option value="revoked">{copy("m209")}</option>
          </select>
        </label>
      </div>
      {role === "admin" ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("adminAccess")}
        </p>
      ) : (
        <>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">
              {t("pagesTitle")}
            </legend>
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
              {t("choosePage")}
            </p>
            {options("page", visiblePages, pageLabel, setActivePage, page)}
          </fieldset>
          {page && (
            <section
              aria-label={t("pageOptions", { page: pageLabel(page) })}
              className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-800"
            >
              <h3 className="text-sm font-semibold">
                {t("pageOptions", { page: pageLabel(page) })}
              </h3>
              {page === "endpoints" && (
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">
                    {t("sectionsTitle")}
                  </legend>
                  {options(
                    "section",
                    sections,
                    (key) => key,
                    setActiveSection,
                    section,
                  )}
                </fieldset>
              )}
              {page === "blog-editor" && blogApps.length > 0 && (
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">
                    {t("blogApps")}
                  </legend>
                  {options("component", blogApps, (key) =>
                    key.slice("blog.app.".length).replaceAll("_", " "),
                  )}
                </fieldset>
              )}
              {components.length > 0 && (
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">
                    {t("componentsTitle")}
                  </legend>
                  {options("component", components, componentLabel)}
                </fieldset>
              )}
              {page === "endpoints" && section && (
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">
                    {t("endpointTitle", { section })}
                  </legend>
                  {options(
                    "endpoint",
                    sectionOperations(catalog, section, role),
                    (key) => key,
                  )}
                </fieldset>
              )}
              {page === "endpoints" && catalog.credentials.length > 0 && (
                <details>
                  <summary className="cursor-pointer text-sm font-medium">
                    {t("credentialsTitle")}
                  </summary>
                  <p className="my-2 text-xs text-gray-500 dark:text-gray-400">
                    {t("credentialsHint")}
                  </p>
                  {options(
                    "credential",
                    catalog.credentials.map((c) => String(c.id)),
                    (key) =>
                      catalog.credentials.find((c) => String(c.id) === key)
                        ?.label || key,
                  )}
                </details>
              )}
              {page !== "endpoints" &&
                page !== "blog-editor" &&
                components.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("pageOnly")}
                  </p>
                )}
              {page === "endpoints" && !section && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("chooseSection")}
                </p>
              )}
            </section>
          )}
        </>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">{copy("m210")}</p>
    </div>
  );
}
