# AGENTS.md — TailAdmin Pro

> Next.js admin dashboard template · Tailwind CSS v4 · next-intl · ApexCharts · FullCalendar · Swiper

## Active blog implementation and open findings (2026-10-24)

- `/blog-editor` uses `BlogWorkspace` -> `DatabaseBlogEditor` and `BlogMediaPicker`. `BlogEditorView`/`test-blog-editor` are legacy demos. The active editor saves Tiptap JSON to the selected app DB through its authenticated Next server proxy and FastAPI `app/blog/`; it does not persist article/media DataURLs in localStorage. Preserve existing legacy drafts; explicit import is not implemented.
- Apps come from the independent blog catalog, not gateway `authorized_apps`. Keep server-owned app routing, author snapshots, slugs/metadata, JSON validation and page/app/create/update/publish authorization. Never serialize DB URLs, B2 secrets or sessions. No post/asset delete control or endpoint.
- Admin backend uploads to public B2 `blogPost001` in per-app folders. Keep stable public media URLs, asset_id references, same-token upload retries, JSON-only saves and the shared media insertion helper that preserves selected content. Only public media origin belongs in this frontend's environment; credentials stay in the Python backend.
- Fresh recheck passed 43 frontend tests, typecheck, production build and focused ESLint; backend checks passed 50 isolated plus 63 offline tests. Four schemas/eight B2 objects were verified, but ordinary BondsGame pooler connections repeatedly fail with `42P05`/`DuplicatePreparedStatementError`. A temporary unique-statement-name diagnostic passed, not an implemented connector fix. Do not claim unconditional current acceptance from the earlier 70-check Phase 6 receipt.
- Open UI findings: internal Next/sidebar navigation can discard unsaved edits despite unload/app-switch guards; categories and cover choices load only the first 100 rows; prior strike/inline-code/ordered-list/blockquote/code-block/horizontal-rule buttons are missing. Existing media library selection is an additional improvement; the picker currently uploads only. README status text also needs reconciliation. These items remain unresolved.
- Current recheck data: AzeemLab acceptance post ID 1 is published/version 5, not archived; do not automatically change it based on older evidence. Prior temporary sessions 21-24 are revoked. Sikander Art/E Sahulat configuration, consumer integration and deployment remain deferred; no consumer project changes were authorized in this rollout.
- Full findings: `D:/AIModels_SearchAPIS/admin/output/BLOG_PHASES_RECHECK.md`. Preserve the distinction between isolated tests, past live browser writes, fresh read-only checks and deployment. Operator `app/blog/acceptance*.py --run-live` tools are not regression suites and may create real records/sessions.

## Repo Map

> Route groups `(name)/` are Next.js App Router organizational folders —
> they don't affect the URL path. Explore subfolders directly; this map
> stops at the level needed to orient, not to enumerate.

```
src/
├── app/                      # routes (Next.js App Router)
│   ├── [locale]/             # localized routes (next-intl)
│   │   ├── (admin)/          # dashboard shell (sidebar+header via src/layout)
│   │   │   ├── blog-editor/  # DB-backed rich-text editor with public B2 media
│   │   │   ├── (home)/       # dashboard variants, e.g. analytics/, crm/, sales/
│   │   │   ├── (others-pages)/ # feature pages, e.g. calendar/, chat/, (forms)/
│   │   │   └── (ui-elements)/ # component demo pages (alerts, buttons, modals…)
│   │   ├── (full-width-pages)/ # no dashboard shell, e.g. test-blog-editor/, (auth)/
│   │   ├── (layouts-example)/ # sidebar layout variants (layout-one … six)
│   │   └── layout.tsx, not-found.tsx
│   ├── favicon.ico, globals.css
├── components/
│   ├── blog/                  # BlogWorkspace, DatabaseBlogEditor, BlogMediaPicker, extensions
│   ├── ui/                    # primitives: button, modal, table, tabs…
│   ├── form/                  # Form, Label, Select + input/, switch/
│   ├── common/                # shared widgets: PageBreadCrumb, ThemeToggleButton…
│   ├── header/                # header dropdowns
│   └── <feature>/             # one folder per domain: ecommerce, crm, invoice…
├── i18n/                     # routing.ts, request.ts, navigation.ts, languages.ts
├── messages/                 # translation dictionaries (en.json, ar.json, es.json, de.json)
├── layout/                    # admin shell: AppSidebar, AppHeader
├── context/                   # SidebarContext, ThemeContext
├── hooks/                     # useModal, useGoBack, useClickOutside
├── icons/                     # .svg + index.tsx barrel (SVGR)
├── proxy.ts                  # next-intl routing middleware
└── utils/
```

## Stack

- **Next.js 16** (App Router, Turbopack + webpack both configured) with **React 19** and strict **TypeScript**.
- **next-intl v4** for internationalization (i18n), localized routing, and RTL support.
- **Tiptap v3** (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`) for rich text blogging with custom image, video, and file attachment nodes.
- Path alias: `@/*` → `src/*`.
- Scripts: `npm run dev`, `npm run build`, `npm run lint`. Node >= 20.9.
- This Next.js version may differ from your training data — read the relevant guide in `node_modules/next/dist/docs/` before writing code and heed deprecation notices.

## Conventions

- **New page** → add a folder under the matching `src/app/[locale]/(...)/` group; colocate route-only components there. Never place pages outside `[locale]`.
- **New reusable component** → `components/<feature>/` if domain-specific, else `components/common/` or `components/ui/`.
- **New icon** → drop the `.svg` in `icons/`, export it from the `index.tsx` barrel with a PascalCase name. Never inline SVG markup in components.
- Route groups: `(admin)` is the only group with the sidebar/header shell; `(full-width-pages)` renders pages without chrome; `(layouts-example)` holds alternative sidebar layouts.
- Component files are **PascalCase** (`MonthlySalesChart.tsx`) with a **default export**; route files stay lowercase (`page.tsx`, `layout.tsx`); hooks are camelCase (`useModal.ts`).
- Root `app/[locale]/layout.tsx` is a Server Component setting up `NextIntlClientProvider`, fonts, direction (`dir="ltr"|"rtl"`), and providers. The `(admin)` shell layout and interactive UI are Client Components — add `"use client"` whenever using hooks, event handlers, or browser APIs.
- Import via the alias (`@/context/...`, `@/icons/...`, `@/i18n/...`) for cross-folder imports; relative imports are fine within a feature folder.

## Internationalization (next-intl) rules

- **Navigation & Routing**: Always import navigation primitives (`Link`, `useRouter`, `usePathname`, `redirect`) from `@/i18n/navigation`, never directly from `next/link` or `next/navigation`.
- **Routing Configuration**: Locales (`en`, `ar`, `es`, `de`) and routing settings are centralized in `src/i18n/routing.ts` (`localePrefix: "never"`).
- **Translations**:
  - In Client Components: use `useTranslations("namespace")`.
  - In Server Components: use `getTranslations("namespace")` from `next-intl/server`.
  - Organize translation keys by nested feature namespaces (e.g. `t("customers")` under `ecommerce.metrics`).
- **Translation Messages**: All translation dictionaries live in `src/messages/<locale>.json`. When adding or updating user-facing copy, maintain corresponding keys across all supported language files.
- **Static Rendering & Server Components**: Server layouts/pages inside `[locale]` must call `setRequestLocale(locale)` to enable static rendering with `generateStaticParams()`.
- **RTL Support**: Arabic (`ar`) uses RTL direction (`dir="rtl"`) via `isRtl(locale)` in `src/i18n/languages.ts`. Ensure UI components handle RTL layouts gracefully using CSS logical properties and `rtl:` variants.

## Styling rules

- Tailwind CSS **v4** — the theme lives in `src/app/globals.css` under `@theme`; there is no `tailwind.config`.
- Always use theme tokens instead of hardcoded values:
  - Colors: `brand`, `gray`, `blue-light`, `orange`, `success`, `error`, `warning` scales (`25`–`950`), plus `theme-pink-500` / `theme-purple-500`.
  - Typography: `font-outfit`, `text-theme-xs/sm/xl`, `text-title-sm/md/lg/xl/2xl`.
  - Shadows: `shadow-theme-xs/sm/md/lg/xl`, `shadow-focus-ring`, `shadow-slider-navigation`, `shadow-tooltip`, `shadow-datepicker`.
  - Breakpoints: custom `2xsm` (375px), `xsm` (425px), `3xl` (2000px) alongside the defaults.
  - Z-index: `z-1`, `z-9`, `z-99`, … `z-999999` tokens.
- **Dark mode is class-based** (`@custom-variant dark (&:is(.dark *))`, driven by `ThemeContext` with light/dark/auto). Every styled element must include its `dark:` variant.
- **CSS Logical Properties for RTL & Internationalization**:
  - Never use physical directional utilities when logical equivalents exist; physical `left`/`right` properties break in RTL (`ar`) layout:
    - **Margins**: Use `ms-*` / `me-*` (margin-inline start/end) instead of `ml-*` / `mr-*`.
    - **Padding**: Use `ps-*` / `pe-*` (padding-inline start/end) instead of `pl-*` / `pr-*`.
    - **Positioning / Insets**: Use `start-*` / `end-*` instead of `left-*` / `right-*`.
    - **Borders**: Use `border-s-*` / `border-e-*` instead of `border-l-*` / `border-r-*`.
    - **Border Radius**: Use `rounded-s-*` / `rounded-e-*` / `rounded-ss-*` / `rounded-se-*` / `rounded-es-*` / `rounded-ee-*` instead of `rounded-l-*` / `rounded-r-*` / `rounded-t-*` corner combos.
    - **Text Alignment**: Use `text-start` / `text-end` instead of `text-left` / `text-right`.
  - **Directional Icons & Transforms**:
    - Directional glyphs (e.g. back/forward arrows, breadcrumb chevrons, next/prev icons) must flip in RTL with `rtl:rotate-180` or `rtl:-scale-x-100`.
    - Off-canvas drawers and sliding elements must mirror their translation (e.g., `-translate-x-full rtl:translate-x-full`).
    - Use `ltr:*` and `rtl:*` modifiers when explicit directional overrides or third-party integration styles are required.
- Reusable `@utility` classes already exist in `globals.css` (`menu-item-*`, `menu-dropdown-*`, `custom-scrollbar`, `no-scrollbar`, `docs-menu-item-*`, `nav-icon-item-*`, …) — reuse them before inventing new ones.
- All third-party CSS overrides (ApexCharts, FullCalendar, Swiper, flatpickr, jvectormap, simplebar, Prism) live at the bottom of `globals.css`. Add overrides there, matching the existing `@apply` style.
- Never hardcode hex colors in `className`. (Chart option objects like `ApexOptions.colors` are the established exception — copy hex values from the `@theme` palette, e.g. `#465fff` = brand-500.)

## Component rules

- **One feature, one folder**: new page UI goes in `src/components/<feature>/`, split into focused single-responsibility sub-components (e.g. `EcommerceMetrics.tsx`, `RecentOrders.tsx`) — never one monolithic file.
- **Composition over prop drilling**: pass `children`, keep container/state logic separate from presentational components, extract section-level JSX into its own file, and define explicit typed prop interfaces per sub-component.
- Prefer primitives from `src/components/ui/` and `src/components/form/` over raw HTML or new third-party equivalents.
- Wrap demo/page sections in `ComponentCard` and add `PageBreadCrumb` at the top of pages, matching existing pages.
- **Charts**: `react-apexcharts` must be dynamically imported — `const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })`.
- **Calendar & carousels**: `FullCalendar` and `Swiper` are also client-only libraries — dynamically import them the same way (`dynamic(() => import(...), { ssr: false })`) rather than importing directly, unless they're already isolated inside a component that's rendered client-side only (verify before assuming).- **Icons**: import from `@/icons` (SVGs are compiled to React components via `@svgr/webpack`, configured for both webpack and Turbopack).
- **Rich Text Editor (Tiptap)**: Client-only component; pass `immediatelyRender: false` in `useEditor` options to avoid SSR hydration mismatches in Next.js 16. Custom media nodes (`CustomImage`, `CustomVideo`, `CustomFileAttachment`) live under `src/components/blog/extensions/mediaExtensions.ts`. The active editor stores validated JSON in the selected app DB and uploads media through the admin backend to public B2. DataURL/localStorage behavior belongs only to the retained legacy demo; do not restore it to the active editor. Third-party typography styles live in `globals.css` under `.tiptap-editor-content`.
- Modals use the `useModal` hook (`isOpen`, `openModal`, `closeModal`, `toggleModal`).
- Global state goes through the existing contexts (`useSidebar`, `useTheme`) — don't add new providers without need.

## Don'ts

- Don't install new packages without asking the user.
- Don't import `Link`, `useRouter`, `usePathname`, or `redirect` from `next/link` or `next/navigation` — always use `@/i18n/navigation`.
- Don't create pages directly under `src/app/` outside the `[locale]` segment.
- Don't hardcode user-facing text without adding keys to `src/messages/*.json`.
- Don't use physical directional utilities (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `border-l-*`, `border-r-*`, `rounded-l-*`, `rounded-r-*`, `text-left`, `text-right`) — always use CSS logical equivalents (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `border-s-*`, `border-e-*`, `rounded-s-*`, `rounded-e-*`, `text-start`, `text-end`).
- Don't hardcode hex colors or pixel values in `className` — use the `@theme` tokens.
- Don't create a `tailwind.config` — Tailwind v4 is configured through `globals.css`.
- Don't import `react-apexcharts`, `FullCalendar`, or `Swiper` statically — always use `next/dynamic` with `ssr: false` (unless already wrapped in a client-only boundary — confirm the existing pattern in that feature folder first).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Pending dev reload investigation and image compression (2026-10-26)

- User reports slow reload/file-change updates, sometimes no visible update. Investigation was read-only; no watcher/configuration fix has been applied. Browser/HMR verification remains pending and must be performed by the user.
- Supplied logs: GET /blog-editor 200 in 8.0s (Next 178ms, proxy 251ms, generate-params 898ms, application 6.7s); two profile GETs each 4.4s (application 3.2s). These show application waits, not proof of a failed watcher.
- Current dev log `.next/dev/logs/next-development.log` repeatedly recorded `The requested page could not be loaded`, `[object Response]` and browser `Uncaught Error: Response`. Admin layout and blog loader both call requireUser/currentUser -> backend /me. The layout's handleResponse can rethrow a raw non-redirect Response. Backend failure is a plausible render blocker; precise failing status/request and HMR behavior were not verified.
- Earlier `Failed to find Server Action` is a possible client/build mismatch, not a confirmed root cause. POST /api/blog/avatar 404 was addressed separately by the authenticated blog profile-avatar endpoint/proxy; do not claim this fixes reload behavior.
- Inspection found next dev/Turbopack on localhost:3002, explicit correct turbopack.root, no disabled Fast Refresh and no duplicate admin dev server. AzeemLab also had its own dev server; about 9 GiB RAM was available. Antivirus/disk latency and watcher events were not measured. No automatic cache deletion, server restart, polling change or auth bypass is authorized by these findings.
- Shared browser compressor is src/utils/compressImage.ts. Integrated first in BlogAuthorCard, now also BlogMediaPicker before image upload (including its shared cover picker). Default editor bounds 1920x1920, quality 0.82; avatar remains 512x512. PNG/JPEG/WebP only, animated PNG/WebP pass through, candidate retained only when smaller. Image upload limit 10 MiB applies after compression; source compressor limit is 32 MiB. Audio/video unchanged.
- Picker keeps identical prepared bytes for same-token retries, resets when another file is chosen, and preserves upload -> My images -> explicit selection behavior. User browser checks are still required: verify actual image dimensions/bytes and quality/transparency, retry behavior and library insertion. Do not claim actual browser/B2 acceptance from mocked tests.
- After the image work is manually accepted, remind the user of the pending reload/session latency and render-error investigation above before starting unrelated work.


## Render auth and error handling follow-up (2026-10-26)

- /me now uses React cache keyed by the incoming cookie header: layout/page reads share one live check within a server render only. Page/role checks remain independent; no process-wide/session TTL cache, client authority or API authorization bypass. Fresh navigations/actions/requests still validate the session. Do not remove leaf-page authorization based on layout success.
- Admin layout uses handlePageError; non-redirect Response failures map to login/forbidden/not-found or a sanitized Error rather than raw Response. Framework control-flow errors are preserved with unstable_rethrow. A parent [locale]/error.tsx reuses the existing Retry UI to catch admin-layout failures (same-segment error.tsx cannot catch its own layout).
- Author profile effect shares an in-flight read and retains its loaded state for this mounted editor, so effect replay neither refetches nor overwrites locally saved profile state. Failed reads can retry; account changes key/remount the editor. Other editor effects and React Strict Mode remain enabled. Backend publishing still checks live profile completeness and grants.
- These changes do not prove file-watcher/HMR reliability or eliminate upstream DB latency. User browser checks remain required for one /me per render, permissions/revocation, profile saves + refresh replay, service failure Retry UI and controlled edit/HMR updates. No server restart/cache deletion/deployment was performed.
