# AI Gateway admin — TailAdmin frontend

This folder is the replacement dashboard. Gateway calls and authorization remain server-side.

See [MIGRATION.md](MIGRATION.md) for setup, security boundaries, verification and remaining acceptance checks.

Development: `npm run dev` on http://localhost:3002. Checks: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

---

## Original TailAdmin template reference

# TailAdmin Next.js - Free Next.js Tailwind Admin Dashboard Template

TailAdmin is a free and open-source admin dashboard template built on **Next.js and Tailwind CSS** providing developers with everything they need to create a feature-rich and data-driven: back-end, dashboard, or admin panel solution for any sort of web project.

![TailAdmin - Next.js Dashboard Preview](./banner.png)

With TailAdmin Next.js, you get access to all the necessary dashboard UI components, elements, and pages required to build a high-quality and complete dashboard or admin panel. Whether you're building a dashboard or admin panel for a complex web application or a simple website.

TailAdmin utilizes the powerful features of **Next.js 16** and common features of Next.js such as server-side rendering (SSR), static site generation (SSG), and seamless API route integration. Combined with the advancements of **React 19** and the robustness of **TypeScript**, TailAdmin is the perfect solution to help get your project up and running quickly.

## Overview

TailAdmin provides essential UI components and layouts for building feature-rich, data-driven admin dashboards and control panels. It's built on:

- Next.js 16.x
- React 19
- TypeScript
- Tailwind CSS V4

### Quick Links

- [✨ Visit Website](https://tailadmin.com)

> Windows Users: place the repository near the root of your drive if you face issues while cloning.

1. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

   > Use `--legacy-peer-deps` flag if you face peer-dependency error during installation.

2. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Components

TailAdmin is a pre-designed starting point for building a web-based dashboard using Next.js and Tailwind CSS. The template includes:

- Sophisticated and accessible sidebar
- Data visualization components
- Profile management and custom 404 page
- Tables and Charts(Line and Bar)
- Authentication forms and input elements
- Alerts, Dropdowns, Modals, Buttons and more
- Can't forget Dark Mode 🕶️

All components are built with React and styled using Tailwind CSS for easy customization.

## Feature Comparison

### Free Version

- 1 Unique Dashboard
- 30+ dashboard components
- 50+ UI elements
- Basic Figma design files
- Community support

### Pro Version

- 7 Unique Dashboards: Ecommerce, Analytics, Marketing, CRM, Stocks, SaaS, Logistics, AI, Sales, Finance (more coming soon)
- 500+ dashboard components and UI elements
- Complete Figma design file
- Email support

To learn more about pro version features and pricing, visit our [pricing page](https://tailadmin.com/pricing).

## Changelog

### Version 2.4.0 - [September 13, 2026]

- Added Internationalization (Multi Language) support.
- Updated complete template styles to support RTL.
- Added Yearly View into calendar page.
- Updated `maplibre-gl` implementation with `react-map-gl`.
- Added new requested components and fixed noted accessibility issues.
- Updated project structure and component compositions for easy adaption.
- Added AGENTS.md to easily work with AI Agents.
- Updated all the packages and libraries to the latest versions. Also removed unused packages.

### Version 2.3.1 - [May 23, 2026]

- Added AI Settings page to configure models, keys, and token limits.
- Added Maps page with MapLibre GL, Leaflet, and iframe styles.
- Added Vector Maps page powered by AmCharts 5 geodata (World & USA).
- Added Radar Charts page with 3 unique formats.
- Added Radial Progress Charts page featuring 4 custom layout templates.
- Introduced new Bar Charts Five & Six and Pie Charts Four & Five.

### Version 2.3.0 - [April 28, 2026]

- **New Feature**: Added **AI Dashboard** with token usage and revenue tracking.
- **New Feature**: Added **Sales Dashboard** with retention and multi-channel analytics.
- **New Feature**: Added **Finance Dashboard** with cashflow and balance management.
- **New Feature**: Introduced **6 New Layout variations** for improved UI flexibility.
- **Enhancement**: Integrated **Advanced Data Visualization** with 7+ new chart types.

### Version 2.2.3 - [March 15, 2026]

- update ESLint configuration and dependencies; upgrade Next.js to version 16.1.6

### Version 2.2.2 - [December 30, 2025]

- Fixed date picker positioning and functionality in Statistics Chart.

### Version 2.1.0 - [November 15, 2025]

- Updated to Next.js 16.x
- Fixed all reported minor bugs

### Version 2.0.2 - [March 25, 2025]

- Upgraded to Next.js 16.x for [CVE-2025-29927](https://nextjs.org/blog/cve-2025-29927) concerns
- Included overrides vectormap for packages to prevent peer dependency errors during installation.
- Migrated from react-flatpickr to flatpickr package for React 19 support

### Version 2.0.1 - [February 27, 2025]

#### Update Overview

- Upgraded to Tailwind CSS v4 for better performance and efficiency.
- Updated class usage to match the latest syntax and features.
- Replaced deprecated class and optimized styles.

#### Next Steps

- Run npm install or yarn install to update dependencies.
- Check for any style changes or compatibility issues.
- Refer to the Tailwind CSS v4 [Migration Guide](https://tailwindcss.com/docs/upgrade-guide) on this release. if needed.
- This update keeps the project up to date with the latest Tailwind improvements. 🚀

### v2.0.0 (February 2025)

A major update focused on Next.js 16 implementation and comprehensive redesign.

#### Major Improvements

- Complete redesign using Next.js 16 App Router and React Server Components
- Enhanced user interface with Next.js-optimized components
- Improved responsiveness and accessibility
- New features including collapsible sidebar, chat screens, and calendar
- Redesigned authentication using Next.js App Router and server actions
- Updated data visualization using ApexCharts for React

#### Breaking Changes

- Migrated from Next.js 14 to Next.js 16
- Chart components now use ApexCharts for React
- Authentication flow updated to use Server Actions and middleware

[Read more](https://tailadmin.com/docs/update-logs/nextjs) on this release.

### v1.3.4 (July 01, 2024)

- Fixed JSvectormap rendering issues

### v1.3.3 (June 20, 2024)

- Fixed build error related to Loader component

### v1.3.2 (June 19, 2024)

- Added ClickOutside component for dropdown menus
- Refactored sidebar components
- Updated Jsvectormap package

### v1.3.1 (Feb 12, 2024)

- Fixed layout naming consistency
- Updated styles

### v1.3.0 (Feb 05, 2024)

- Upgraded to Next.js 14
- Added Flatpickr integration
- Improved form elements
- Enhanced multiselect functionality
- Added default layout component

## License

TailAdmin Next.js Free Version is released under the MIT License.

## Support

If you find this project helpful, please consider giving it a star on GitHub. Your support helps us continue developing and maintaining this template.


## Multi-app blog Phase 5 (local implementation, 2026-10-24)

The active /blog-editor workspace uses DatabaseBlogEditor with the existing
Tiptap extensions and shared card/button/loading primitives. BlogWorkspace still
selects the independent backend blog catalog. Active editor storage is now the
selected app database through the authenticated Next.js /blog-editor/api route;
there is no localStorage/DataURL persistence or browser-to-gateway credential
forwarding in that workspace. The standalone test-blog-editor legacy demo and
existing browser drafts remain untouched for explicit Phase 6 import decisions.

Features: draft create/load/update, publish/move-to-draft with separate grants,
backend slugs and metadata, typed category selection or same-field name creation,
profile name/designation editing, author snapshots, image cover selection,
image/video/audio uploads, supported HTTPS YouTube embeds, saved-post pagination,
version-conflict error retention and dirty/app-switch guards. Published save uses
published status and never silently unpublishes. There is no delete control/API.

New files are contained in components/blog and lib/gateway/services/blog-api.ts,
plus the route handler under [locale]/(admin)/blog-editor/api. Server API routing
allowlists app/resource/method/ID combinations, independently checks the session,
blog page and mutation Origin, then uses the existing backend() helper. Backend
permissions/app scope remain authoritative; the loader supplies only safe UI
capability flags, never credentials. JSON and raw media bodies are bounded and
streamed with Node fetch duplex handling. Uploads preserve UUID Idempotency-Key
on retry and create Tiptap nodes carrying app-local asset_id references.

Set BLOG_MEDIA_ORIGIN in the Next.js environment to the HTTPS origin of the
backend BLOG_B2_PUBLIC_BASE_URL, without a path, credentials or tokens. The local
.env.local entry has been derived from the configured public URL. This is a public
CSP setting, not a B2 secret. All BLOG_B2 keys stay in the gateway root .env.
CSP permits only this additional media origin and supported YouTube frames;
connect-src stays same-origin. Next's documented proxyClientMaxBodySize is 65 MiB
to accommodate the backend's 64 MiB video limit. Next proxy buffers/clones request
bodies in memory despite the route streaming downstream, so deployers should
budget for that memory and set matching ingress limits/timeouts. The upload route
uses Node runtime/maxDuration 180 and a bounded 155-second backend timeout.

Post create has no durable backend idempotency key. If a new-post save returns an
ambiguous transport/server failure, the editor retains content and blocks another
create until the user checks the saved list and explicitly loads/starts a post.
Validation failures remain editable. Version conflicts retain the existing content
for review/reload, without automatic overwrite or retries. A failed list refresh
after successful save is reported separately. Categories/covers initially load up
to 100 entries; existing references outside that window are preserved when saved.
New category names still resolve server-side. A paged/searchable large asset and
category picker remains a later usability improvement.

Validation: 40 frontend regressions, typecheck, focused ESLint and production
build passed. Browser checks against a disposable localhost backend exercised
create/category save, publish, switching to an empty second app and reloading the
saved JSON/body/slug/author; enabling/disabling Tiptap no longer marks saved content
dirty. A 390px check showed no document horizontal overflow. Browser data was
fabricated; this is not a configured PostgreSQL write/production acceptance test.
The separate real B2 smoke uploaded a tiny generated WAV to blogPost001, public
GET returned identical bytes (200), and the exact test object/version was deleted
(204). No real blog/category/asset DB rows or grants were created and no consumer
application code, packages or deployment were included.

Manual fabricated browser fixture (never use as production gateway):

```powershell
node tests/manual-blog-backend.cjs
# Separate terminal; point only this temporary preview at the fixture:
$env:GATEWAY_URL='http://127.0.0.1:8014'
$env:ADMIN_ORIGIN='http://localhost:3014'
node node_modules/next/dist/bin/next dev --hostname localhost --port 3014
```

Visit http://localhost:8014/session to set a fabricated localhost test cookie,
then http://localhost:3014/blog-editor. This does not grant real backend access.
Stop both processes after testing. Phase 6 still needs configured DB concurrency/
write acceptance, real authenticated UI upload/save checks, and deployment review.


## Phase 6 local acceptance - completed 2026-10-24

Actual configured PostgreSQL/B2 acceptance found and corrected the post/category
`items` response contract, archived-save preservation and selected-media replacement.
The frontend now has 43 passing regressions, including an actual isolated FastAPI
contract fixture and a real ProseMirror retention regression. Real browser checks
verified image upload/save, archived JSON reload, app isolation, all three B2 media
kinds decoding, and settled 390px rendering. YouTube iframe output now sets the
required referrer policy; arbitrary third-party playback is not claimed.

The complete scoped result is documented at
D:/AIModels_SearchAPIS/app/blog/PHASE6_ACCEPTANCE.md and phase6-verification.json.
All labelled test posts are archived and the temporary test sessions/servers are
closed. The initial network interruption and recovery remain documented. Limited
user failures and destructive/failure scenarios stayed isolated; no existing grants
or consumer code changed. Deployment was explicitly deferred by the user.

## Official media schema (2026-10-25)

The active `/blog-editor` now registers official `@tiptap/extension-image`,
`@tiptap/extension-audio`, and `@tiptap/extension-youtube` (matching core 3.32.0),
plus the existing StarterKit and official TableKit. It does not register custom
nodes or add custom attributes to official nodes. Image JSON uses `image` with
`src`, `alt`, `title`, `width`, `height`; audio uses official `audio` attributes;
YouTube uses `youtube` with `src`, `start`, `width`, `height`.

Uploaded video and generic attachments use an ordinary paragraph/text/Link mark.
There is no invented `video`/`file` node or substitute community extension.
Captions from legacy records become ordinary paragraphs. The existing picker,
upload retry token, app authorization, profile snapshots and save controls remain.
Only image/audio assets are embedded by the active editor; uploaded videos are
links in the editor. AzeemLab enhances a standalone registered video link into a
native player on its public article page.

Official nodes intentionally contain no `asset_id`. The backend resolves image
and audio `src` values by exact `blog_assets.public_url` in the selected app's
database and verifies MIME, rather than trusting an arbitrary source. The public
reader batches URL lookups, checks its configured media origins and renders only
resolved app-local image/audio/video assets. External images pasted into JSON can
be recognized as standard nodes but cannot be saved unless registered in that
app's asset database. B2 uploads and credentials remain backend-owned.

Existing database posts are never mass-migrated or rewritten on load. Legacy
custom media JSON is converted in memory before the active editor loads it; an
explicit Save writes the standard representation. Backend/consumer read support
for legacy records remains for backward compatibility. The separate legacy
`BlogEditorView` demo and its existing browser drafts are retained; it is not the
active database editor and its old extensions are not imported by that editor.

Deploy/restart the backend and editor together, followed by the AzeemLab consumer.
Other consumer projects discussed earlier are not integrated by this change.
No schema migration, database write, test, type/lint check, build or browser
check was run. Existing import-contract test sources were updated but not run.

References:
- https://tiptap.dev/docs/editor/extensions/nodes/image
- https://tiptap.dev/docs/editor/extensions/nodes/audio
- https://tiptap.dev/docs/editor/extensions/nodes/youtube


